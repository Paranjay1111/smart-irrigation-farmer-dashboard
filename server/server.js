import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbRun, dbGet, dbAll, initDB } from './db.js';

// ── DynamoDB repos (non-auth data) ────────────────────────────────────────────
import { USE_DYNAMO } from './dynamo/client.js';
import { saveTelemetry, getLatestTelemetry, getByDate, getByMonth, getMonthlySummary, getByDateRange } from './dynamo/telemetryRepo.js';
import { getPumpState as dynamoGetPump, setPumpStatus as dynamoSetPump, setAutomatic as dynamoSetAuto, setEmergencyStop as dynamoSetEmergency } from './dynamo/pumpRepo.js';
import { getAllAlerts, getAlert, setAlertActive, addAlertHistory, resolveAlertHistory, getAlertHistory, clearAlertHistory, seedAlerts } from './dynamo/alertsRepo.js';
import { getAllSchedules, addSchedule as dynamoAddSchedule, toggleSchedule as dynamoToggleSchedule, deleteSchedule as dynamoDeleteSchedule, seedSchedules } from './dynamo/schedulesRepo.js';
import { getSettings as dynamoGetSettings, updateSettings as dynamoUpdateSettings } from './dynamo/settingsRepo.js';

// ── AWS IoT Core MQTT (gracefully skips if certs missing) ────────────────────
import { USE_IOT, connectIoT, publishTelemetry as iotPublishTelemetry, publishPumpStatus, TOPICS } from './iot/awsIot.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_farmer_key_123_abc';

// Enable Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Setup DB connection and run tables creation/seeding
initDB().then(async () => {
  console.log('Database initialized successfully.');
  // Seed DynamoDB with defaults if DynamoDB is enabled
  if (USE_DYNAMO) {
    try {
      await seedAlerts();
      await seedSchedules();
      console.log('✅ DynamoDB seeded with default data.');
    } catch (err) {
      console.error('DynamoDB seeding failed:', err.message);
    }
  }
}).catch(err => {
  console.error('Database initialization failed:', err);
});

// Connect to AWS IoT Core MQTT (if certs are available)
if (USE_IOT) {
  connectIoT();
}

// Middleware for Authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid or expired' });
    }
    req.user = user;
    next();
  });
};

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, farmLocation, farmSize, cropType } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in name, email, and password.' });
    }

    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const result = await dbRun(`
      INSERT INTO users (name, email, password_hash, phone, farm_location, farm_size, crop_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      email,
      passwordHash,
      phone || '',
      farmLocation || '',
      farmSize || '',
      cropType || ''
    ]);

    const newUser = await dbGet('SELECT id, name, email, phone, farm_location as farmLocation, farm_size as farmSize, crop_type as cropType, profile_picture as profilePicture FROM users WHERE id = ?', [result.lastID]);
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      farmLocation: user.farm_location,
      farmSize: user.farm_size,
      cropType: user.crop_type,
      profilePicture: user.profile_picture
    };

    res.json({ token, user: userPayload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Get Profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, name, email, phone, farm_location as farmLocation, farm_size as farmSize, crop_type as cropType, profile_picture as profilePicture FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
});

// Update Profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, farmLocation, farmSize, cropType, profilePicture } = req.body;
    
    await dbRun(`
      UPDATE users 
      SET name = ?, email = ?, phone = ?, farm_location = ?, farm_size = ?, crop_type = ?, profile_picture = ?
      WHERE id = ?
    `, [name, email, phone, farmLocation, farmSize, cropType, profilePicture, req.user.id]);

    const updatedUser = await dbGet('SELECT id, name, email, phone, farm_location as farmLocation, farm_size as farmSize, crop_type as cropType, profile_picture as profilePicture FROM users WHERE id = ?', [req.user.id]);
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

// ----------------------------------------------------
// IRRIGATION / TELEMETRY ENDPOINTS
// ----------------------------------------------------

// Get unified irrigation state (current pump state, sensors, settings, schedules, alerts)
app.get('/api/irrigation/state', authenticateToken, async (req, res) => {
  try {
    const pumpState = await dbGet('SELECT * FROM pump_state WHERE id = 1');
    const settings = await dbGet('SELECT * FROM settings WHERE id = 1');
    const telemetry = await dbGet('SELECT * FROM telemetry_history ORDER BY timestamp DESC LIMIT 1');
    const allAlerts = await dbAll('SELECT * FROM alerts');
    const schedules = await dbAll('SELECT * FROM schedules');
    
    res.json({
      pumpStatus: pumpState ? pumpState.status : 'OFF',
      isAutomaticMode: pumpState ? pumpState.is_automatic === 1 : false,
      emergencyStopped: pumpState ? pumpState.emergency_stopped === 1 : false,
      lastUpdated: pumpState ? pumpState.last_updated : '',
      deviceStatus: pumpState && pumpState.emergency_stopped === 1 ? 'Offline' : 'Online',
      sensors: telemetry ? {
        temperature: telemetry.temperature,
        humidity: telemetry.humidity,
        soilMoisture: telemetry.soil_moisture,
        rain: telemetry.rain,
        lightIntensity: telemetry.light_intensity,
        waterTank: telemetry.water_tank,
        battery: telemetry.battery,
      } : {
        temperature: 28,
        humidity: 68,
        soilMoisture: 55,
        rain: 'No',
        lightIntensity: 780,
        waterTank: 72,
        battery: 93
      },
      alerts: allAlerts.map(a => ({ ...a, active: a.active === 1 })),
      schedules: schedules.map(s => ({ ...s, enabled: s.enabled === 1 })),
      thresholds: settings ? {
        soilMoistureLow: settings.soil_moisture_low,
        soilMoistureHigh: settings.soil_moisture_high,
        tempHigh: settings.temp_high,
        waterTankLow: settings.water_tank_low,
      } : {
        soilMoistureLow: 40,
        soilMoistureHigh: 75,
        tempHigh: 35,
        waterTankLow: 20
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving irrigation state.' });
  }
});

// Set pump state manually
app.post('/api/irrigation/pump', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (status !== 'ON' && status !== 'OFF') {
      return res.status(400).json({ message: 'Invalid status. Must be ON or OFF.' });
    }

    const pumpState = await dbGet('SELECT * FROM pump_state WHERE id = 1');
    if (pumpState && pumpState.emergency_stopped === 1) {
      return res.status(400).json({ message: 'Emergency stop is active. Clear it first.' });
    }

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    await dbRun("UPDATE pump_state SET status = ?, last_updated = ? WHERE id = 1", [status, timeNow]);
    
    res.json({ message: `Pump turned ${status} successfully.`, status, lastUpdated: timeNow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error setting pump status.' });
  }
});

// Set automatic/manual mode
app.post('/api/irrigation/mode', authenticateToken, async (req, res) => {
  try {
    const { isAutomaticMode } = req.body;
    const modeInt = isAutomaticMode ? 1 : 0;
    
    await dbRun("UPDATE pump_state SET is_automatic = ? WHERE id = 1", [modeInt]);
    res.json({ message: `Mode set to ${isAutomaticMode ? 'Automatic' : 'Manual'}.`, isAutomaticMode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error setting operation mode.' });
  }
});

// Emergency Stop
app.post('/api/irrigation/emergency-stop', authenticateToken, async (req, res) => {
  try {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    await dbRun("UPDATE pump_state SET status = 'OFF', is_automatic = 0, emergency_stopped = 1, last_updated = ? WHERE id = 1", [timeNow]);

    const dateNow = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await dbRun("INSERT INTO alert_history (date, type, status, severity) VALUES (?, 'Emergency Stop Activated', 'Active', 'danger')", [dateNow]);

    res.json({ message: 'Emergency Stop triggered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error triggering emergency stop.' });
  }
});

// Reset Emergency Stop
app.post('/api/irrigation/reset-emergency', authenticateToken, async (req, res) => {
  try {
    await dbRun("UPDATE pump_state SET emergency_stopped = 0 WHERE id = 1");
    // Also resolve emergency stop alerts in history
    await dbRun("UPDATE alert_history SET status = 'Resolved' WHERE type = 'Emergency Stop Activated' AND status = 'Active'");
    res.json({ message: 'Emergency Stop reset successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error resetting emergency stop.' });
  }
});

// Get latest sensor telemetry
app.get('/api/irrigation/sensors', authenticateToken, async (req, res) => {
  try {
    const telemetry = await dbGet('SELECT * FROM telemetry_history ORDER BY timestamp DESC LIMIT 1');
    res.json(telemetry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching telemetry.' });
  }
});

// Get historical telemetry data (for Recharts)
app.get('/api/irrigation/history', authenticateToken, async (req, res) => {
  try {
    const history = await dbAll('SELECT * FROM telemetry_history ORDER BY timestamp DESC LIMIT 30');
    // Return in chronological order
    res.json(history.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching telemetry history.' });
  }
});

// ----------------------------------------------------
// SCHEDULES ENDPOINTS
// ----------------------------------------------------
app.get('/api/schedules', authenticateToken, async (req, res) => {
  try {
    const schedules = await dbAll('SELECT * FROM schedules');
    res.json(schedules.map(s => ({ ...s, enabled: s.enabled === 1 })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching schedules.' });
  }
});

app.post('/api/schedules', authenticateToken, async (req, res) => {
  try {
    const { time, duration } = req.body;
    if (!time || !duration) {
      return res.status(400).json({ message: 'Please specify time and duration.' });
    }
    const result = await dbRun('INSERT INTO schedules (time, duration, enabled) VALUES (?, ?, 1)', [time, duration]);
    res.status(201).json({ id: result.lastID, time, duration, enabled: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating schedule.' });
  }
});

app.delete('/api/schedules/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM schedules WHERE id = ?', [id]);
    res.json({ message: 'Schedule deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting schedule.' });
  }
});

app.put('/api/schedules/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('UPDATE schedules SET enabled = 1 - enabled WHERE id = ?', [id]);
    const updated = await dbGet('SELECT * FROM schedules WHERE id = ?', [id]);
    res.json({ ...updated, enabled: updated.enabled === 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error toggling schedule.' });
  }
});

// ----------------------------------------------------
// ALERTS ENDPOINTS
// ----------------------------------------------------
app.get('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = await dbAll('SELECT * FROM alerts');
    res.json(alerts.map(a => ({ ...a, active: a.active === 1 })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching alerts.' });
  }
});

app.get('/api/alerts/history', authenticateToken, async (req, res) => {
  try {
    const history = await dbAll('SELECT * FROM alert_history ORDER BY id DESC');
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching alert history.' });
  }
});

app.post('/api/alerts/clear-history', authenticateToken, async (req, res) => {
  try {
    await dbRun('DELETE FROM alert_history');
    res.json({ message: 'Alert history cleared.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error clearing alert history.' });
  }
});

// Toggle alert (Simulated in GUI)
app.post('/api/alerts/toggle', authenticateToken, async (req, res) => {
  try {
    const { type, active } = req.body;
    const activeInt = active ? 1 : 0;
    
    await dbRun('UPDATE alerts SET active = ? WHERE type = ?', [activeInt, type]);
    
    const dateNow = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const alert = await dbGet('SELECT * FROM alerts WHERE type = ?', [type]);

    if (active) {
      await dbRun('INSERT INTO alert_history (date, type, status, severity) VALUES (?, ?, \'Active\', ?)', [
        dateNow, type, alert?.severity || 'warning'
      ]);
    } else {
      await dbRun('UPDATE alert_history SET status = \'Resolved\' WHERE type = ? AND status = \'Active\'', [type]);
    }

    res.json({ message: `Alert ${type} status updated to ${active ? 'Active' : 'Offline'}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error toggling alert state.' });
  }
});

// ----------------------------------------------------
// SETTINGS ENDPOINTS
// ----------------------------------------------------
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const settings = await dbGet('SELECT * FROM settings WHERE id = 1');
    res.json({
      darkMode: settings.dark_mode === 1,
      language: settings.language,
      autoRefresh: settings.auto_refresh,
      units: settings.units,
      weatherTheme: settings.weather_theme,
      notifications: {
        email: settings.notifications_email === 1,
        push: settings.notifications_push === 1,
        sms: settings.notifications_sms === 1,
      },
      thresholdValues: {
        soilMoistureLow: settings.soil_moisture_low,
        soilMoistureHigh: settings.soil_moisture_high,
        tempHigh: settings.temp_high,
        waterTankLow: settings.water_tank_low,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching settings.' });
  }
});

app.put('/api/settings', authenticateToken, async (req, res) => {
  try {
    const { darkMode, language, autoRefresh, units, weatherTheme, notifications, thresholdValues } = req.body;
    
    const settings = await dbGet('SELECT * FROM settings WHERE id = 1');
    if (!settings) return res.status(404).json({ message: 'Settings not found' });

    const newDarkMode = darkMode !== undefined ? (darkMode ? 1 : 0) : settings.dark_mode;
    const newLang = language || settings.language;
    const newAuto = autoRefresh || settings.auto_refresh;
    const newUnits = units || settings.units;
    const newTheme = weatherTheme || settings.weather_theme;

    const email = notifications?.email !== undefined ? (notifications.email ? 1 : 0) : settings.notifications_email;
    const push = notifications?.push !== undefined ? (notifications.push ? 1 : 0) : settings.notifications_push;
    const sms = notifications?.sms !== undefined ? (notifications.sms ? 1 : 0) : settings.notifications_sms;

    const moistureLow = thresholdValues?.soilMoistureLow !== undefined ? thresholdValues.soilMoistureLow : settings.soil_moisture_low;
    const moistureHigh = thresholdValues?.soilMoistureHigh !== undefined ? thresholdValues.soilMoistureHigh : settings.soil_moisture_high;
    const tempHigh = thresholdValues?.tempHigh !== undefined ? thresholdValues.tempHigh : settings.temp_high;
    const tankLow = thresholdValues?.waterTankLow !== undefined ? thresholdValues.waterTankLow : settings.water_tank_low;

    await dbRun(`
      UPDATE settings 
      SET dark_mode = ?, language = ?, auto_refresh = ?, units = ?, weather_theme = ?, 
          notifications_email = ?, notifications_push = ?, notifications_sms = ?, 
          soil_moisture_low = ?, soil_moisture_high = ?, temp_high = ?, water_tank_low = ?
      WHERE id = 1
    `, [
      newDarkMode, newLang, newAuto, newUnits, newTheme,
      email, push, sms,
      moistureLow, moistureHigh, tempHigh, tankLow
    ]);

    const updated = await dbGet('SELECT * FROM settings WHERE id = 1');
    res.json({
      darkMode: updated.dark_mode === 1,
      language: updated.language,
      autoRefresh: updated.auto_refresh,
      units: updated.units,
      weatherTheme: updated.weather_theme,
      notifications: {
        email: updated.notifications_email === 1,
        push: updated.notifications_push === 1,
        sms: updated.notifications_sms === 1,
      },
      thresholdValues: {
        soilMoistureLow: updated.soil_moisture_low,
        soilMoistureHigh: updated.soil_moisture_high,
        tempHigh: updated.temp_high,
        waterTankLow: updated.water_tank_low,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating settings.' });
  }
});


// ----------------------------------------------------
// ANALYTICS ENDPOINTS — Real data from telemetry_history
// GET /api/analytics/telemetry?range=24h|7d|30d
// GET /api/analytics/summary?range=24h|7d|30d
// GET /api/analytics/pump?range=7d|30d
// ----------------------------------------------------

app.get('/api/analytics/telemetry', authenticateToken, async (req, res) => {
  try {
    const range = req.query.range || '7d';
    let interval, groupBy, limit;
    switch (range) {
      case '24h':
        interval = "datetime('now', '-24 hours')";
        groupBy  = "strftime('%Y-%m-%dT%H:00:00.000Z', timestamp)";
        limit    = 24; break;
      case '30d':
        interval = "datetime('now', '-30 days')";
        groupBy  = "strftime('%Y-%m-%d', timestamp)";
        limit    = 30; break;
      default:
        interval = "datetime('now', '-7 days')";
        groupBy  = "strftime('%Y-%m-%dT%H:00:00.000Z', timestamp)";
        limit    = 168;
    }
    const rows = await dbAll(`
      SELECT
        ${groupBy}                     AS bucket,
        ROUND(AVG(temperature), 1)     AS avgTemp,
        ROUND(MIN(temperature), 1)     AS minTemp,
        ROUND(MAX(temperature), 1)     AS maxTemp,
        ROUND(AVG(humidity), 1)        AS avgHumidity,
        ROUND(AVG(soil_moisture), 1)   AS avgSoilMoisture,
        ROUND(MIN(soil_moisture), 1)   AS minSoilMoisture,
        ROUND(AVG(water_tank), 1)      AS avgWaterTank,
        ROUND(AVG(battery), 1)         AS avgBattery,
        ROUND(AVG(light_intensity), 0) AS avgLight,
        SUM(CASE WHEN rain='Yes' THEN 1 ELSE 0 END) AS rainReadings,
        COUNT(*) AS sampleCount
      FROM telemetry_history
      WHERE timestamp >= ${interval}
      GROUP BY ${groupBy}
      ORDER BY bucket ASC
      LIMIT ${limit}
    `);
    res.json({ range, count: rows.length, data: rows });
  } catch (err) {
    console.error('[Analytics/telemetry]', err.message);
    res.status(500).json({ message: 'Failed to fetch telemetry analytics.' });
  }
});

app.get('/api/analytics/summary', authenticateToken, async (req, res) => {
  try {
    const range = req.query.range || '7d';
    const intervals = { '24h': "datetime('now','-24 hours')", '7d': "datetime('now','-7 days')", '30d': "datetime('now','-30 days')" };
    const interval = intervals[range] || intervals['7d'];
    const [stats] = await dbAll(`
      SELECT
        ROUND(AVG(temperature),1)   AS avgTemp,
        ROUND(MAX(temperature),1)   AS maxTemp,
        ROUND(MIN(temperature),1)   AS minTemp,
        ROUND(AVG(humidity),1)      AS avgHumidity,
        ROUND(AVG(soil_moisture),1) AS avgSoilMoisture,
        ROUND(MIN(soil_moisture),1) AS minSoilMoisture,
        ROUND(MAX(soil_moisture),1) AS maxSoilMoisture,
        ROUND(AVG(water_tank),1)    AS avgWaterTank,
        ROUND(MIN(water_tank),1)    AS minWaterTank,
        ROUND(AVG(battery),1)       AS avgBattery,
        SUM(CASE WHEN rain='Yes' THEN 1 ELSE 0 END) AS rainReadings,
        COUNT(*) AS totalReadings
      FROM telemetry_history
      WHERE timestamp >= ${interval}
    `);
    const prevMap = { '24h': ['-48 hours','-24 hours'], '7d': ['-14 days','-7 days'], '30d': ['-60 days','-30 days'] };
    const [pStart, pEnd] = prevMap[range] || prevMap['7d'];
    const [prev] = await dbAll(`
      SELECT ROUND(AVG(temperature),1) AS avgTemp,
             ROUND(AVG(soil_moisture),1) AS avgSoilMoisture,
             ROUND(AVG(humidity),1) AS avgHumidity
      FROM telemetry_history
      WHERE timestamp >= datetime('now','${pStart}') AND timestamp < datetime('now','${pEnd}')
    `);
    const delta = (a, b) => (a != null && b != null) ? +((a - b).toFixed(1)) : 0;
    res.json({
      range, stats,
      deltas: {
        temp:     delta(stats?.avgTemp,         prev?.avgTemp),
        moisture: delta(stats?.avgSoilMoisture, prev?.avgSoilMoisture),
        humidity: delta(stats?.avgHumidity,     prev?.avgHumidity),
      }
    });
  } catch (err) {
    console.error('[Analytics/summary]', err.message);
    res.status(500).json({ message: 'Failed to fetch analytics summary.' });
  }
});

app.get('/api/analytics/pump', authenticateToken, async (req, res) => {
  try {
    const range = req.query.range || '7d';
    const intervals = { '24h': "datetime('now','-24 hours')", '7d': "datetime('now','-7 days')", '30d': "datetime('now','-30 days')" };
    const interval = intervals[range] || intervals['7d'];
    const pumpEvents = await dbAll(`
      SELECT
        strftime('%Y-%m-%d', date) AS date,
        SUM(CASE WHEN type='pump_on' OR type LIKE '%pump%on%' THEN 1 ELSE 0 END) AS pumpOnCount,
        SUM(CASE WHEN type='pump_off' OR type LIKE '%pump%off%' THEN 1 ELSE 0 END) AS pumpOffCount
      FROM alert_history
      WHERE date >= ${interval}
      GROUP BY strftime('%Y-%m-%d', date)
      ORDER BY date ASC
    `);
    const [pumpState] = await dbAll('SELECT * FROM pump_state LIMIT 1');
    const [alertCount] = await dbAll(`SELECT COUNT(*) as cnt FROM alert_history WHERE date >= ${interval}`);
    res.json({ range, pumpState: pumpState || {}, pumpEvents, totalAlerts: alertCount?.cnt || 0 });
  } catch (err) {
    console.error('[Analytics/pump]', err.message);
    res.status(500).json({ message: 'Failed to fetch pump analytics.' });
  }
});

// ----------------------------------------------------
// REAL WEATHER API — Open-Meteo (free, no API key)
// GET /api/weather?lat=30.3033&lon=78.0370
// Returns current conditions + 7-day forecast + hourly
// ----------------------------------------------------

app.get('/api/weather', authenticateToken, async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ message: 'lat and lon query params required' });
    }

    const latitude  = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'lat and lon must be valid numbers' });
    }

    // Build Open-Meteo URL — all params we need for agriculture
    const params = new URLSearchParams({
      latitude,
      longitude,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'rain',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
        'uv_index',
        'surface_pressure',
      ].join(','),
      hourly: [
        'temperature_2m',
        'precipitation_probability',
        'precipitation',
        'weather_code',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'precipitation_probability_max',
        'wind_speed_10m_max',
        'uv_index_max',
        'sunrise',
        'sunset',
      ].join(','),
      timezone: 'Asia/Kolkata',
      forecast_days: 7,
      wind_speed_unit: 'kmh',
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Map WMO weather codes to human-readable labels + icon types
    const describeWMO = (code) => {
      const map = {
        0:  { label: 'Clear Sky',         icon: 'sun' },
        1:  { label: 'Mainly Clear',      icon: 'sun' },
        2:  { label: 'Partly Cloudy',     icon: 'cloud-sun' },
        3:  { label: 'Overcast',          icon: 'cloud' },
        45: { label: 'Foggy',             icon: 'cloud' },
        48: { label: 'Icy Fog',           icon: 'cloud' },
        51: { label: 'Light Drizzle',     icon: 'cloud-rain' },
        53: { label: 'Drizzle',           icon: 'cloud-rain' },
        55: { label: 'Heavy Drizzle',     icon: 'cloud-rain' },
        61: { label: 'Slight Rain',       icon: 'cloud-rain' },
        63: { label: 'Moderate Rain',     icon: 'cloud-rain' },
        65: { label: 'Heavy Rain',        icon: 'cloud-rain' },
        71: { label: 'Slight Snow',       icon: 'cloud' },
        73: { label: 'Moderate Snow',     icon: 'cloud' },
        75: { label: 'Heavy Snow',        icon: 'cloud' },
        77: { label: 'Snow Grains',       icon: 'cloud' },
        80: { label: 'Slight Showers',    icon: 'cloud-rain' },
        81: { label: 'Moderate Showers',  icon: 'cloud-rain' },
        82: { label: 'Violent Showers',   icon: 'cloud-rain' },
        85: { label: 'Snow Showers',      icon: 'cloud' },
        86: { label: 'Heavy Snow Showers',icon: 'cloud' },
        95: { label: 'Thunderstorm',      icon: 'lightning' },
        96: { label: 'Thunderstorm + Hail',icon:'lightning' },
        99: { label: 'Thunderstorm + Heavy Hail',icon:'lightning'},
      };
      return map[code] || { label: 'Unknown', icon: 'cloud' };
    };

    // Format current conditions
    const current = {
      temperature:        data.current.temperature_2m,
      feelsLike:          data.current.apparent_temperature,
      humidity:           data.current.relative_humidity_2m,
      precipitation:      data.current.precipitation,
      rain:               data.current.rain,
      windSpeed:          data.current.wind_speed_10m,
      windDirection:      data.current.wind_direction_10m,
      uvIndex:            data.current.uv_index,
      pressure:           data.current.surface_pressure,
      weatherCode:        data.current.weather_code,
      ...describeWMO(data.current.weather_code),
    };

    // Format 7-day daily forecast
    const daily = data.daily.time.map((date, i) => ({
      date,
      tempMax:        data.daily.temperature_2m_max[i],
      tempMin:        data.daily.temperature_2m_min[i],
      precipSum:      data.daily.precipitation_sum[i],
      precipProb:     data.daily.precipitation_probability_max[i],
      windMax:        data.daily.wind_speed_10m_max[i],
      uvMax:          data.daily.uv_index_max[i],
      sunrise:        data.daily.sunrise[i],
      sunset:         data.daily.sunset[i],
      weatherCode:    data.daily.weather_code[i],
      ...describeWMO(data.daily.weather_code[i]),
    }));

    // Format next 24h hourly (48 entries, take first 24)
    const hourly = data.hourly.time.slice(0, 24).map((time, i) => ({
      time,
      temperature:    data.hourly.temperature_2m[i],
      precipProb:     data.hourly.precipitation_probability[i],
      precipitation:  data.hourly.precipitation[i],
      weatherCode:    data.hourly.weather_code[i],
      ...describeWMO(data.hourly.weather_code[i]),
    }));

    // Smart agricultural advice based on actual data
    const rainComingToday = daily[0]?.precipProb >= 60;
    const highHeat        = current.temperature >= 35;
    const highUV          = current.uvIndex >= 8;

    const advisories = [];
    if (rainComingToday) advisories.push({
      type: 'warning',
      message: `${daily[0].precipProb}% rain probability today — consider delaying irrigation to save water.`,
    });
    if (highHeat) advisories.push({
      type: 'caution',
      message: `High temperature ${current.temperature}°C — irrigate in early morning or evening to minimise evaporation.`,
    });
    if (highUV) advisories.push({
      type: 'info',
      message: `UV index ${current.uvIndex} — avoid fieldwork between 11am and 3pm.`,
    });
    if (!rainComingToday && !highHeat) advisories.push({
      type: 'success',
      message: 'Good conditions for irrigation. Schedule runs as planned.',
    });

    res.json({
      latitude,
      longitude,
      current,
      daily,
      hourly,
      advisories,
      source: 'Open-Meteo (open-meteo.com)',
      fetchedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error('[Weather API] Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch weather data.', error: err.message });
  }
});

// ----------------------------------------------------
// REPORTS ENDPOINTS (DynamoDB — telemetry history)
// These require DynamoDB to be configured in .env
// ----------------------------------------------------

const requireDynamo = (req, res, next) => {
  if (!USE_DYNAMO) {
    return res.status(503).json({
      message: 'DynamoDB is not configured. Add AWS credentials to server/.env to enable reports.',
      hint: 'Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and DYNAMO_* table names in server/.env'
    });
  }
  next();
};

// GET /api/reports/daily?date=2026-07-18
app.get('/api/reports/daily', authenticateToken, requireDynamo, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().substring(0, 10);
    const readings = await getByDate(date);
    res.json({ date, count: readings.length, readings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch daily report.' });
  }
});

// GET /api/reports/monthly?month=2026-07
app.get('/api/reports/monthly', authenticateToken, requireDynamo, async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().substring(0, 7);
    const readings = await getByMonth(month);
    res.json({ month, count: readings.length, readings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch monthly report.' });
  }
});

// GET /api/reports/summary?month=2026-07  (daily min/max/avg aggregates)
app.get('/api/reports/summary', authenticateToken, requireDynamo, async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().substring(0, 7);
    const summary = await getMonthlySummary(month);
    res.json({ month, days: summary.length, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch summary report.' });
  }
});

// GET /api/reports/range?start=2026-07-01&end=2026-07-18
app.get('/api/reports/range', authenticateToken, requireDynamo, async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ message: 'start and end query params required (YYYY-MM-DD)' });
    const readings = await getByDateRange(start, end);
    res.json({ start, end, count: readings.length, readings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch range report.' });
  }
});

// ----------------------------------------------------
// ADVANCED SENSOR SIMULATION ENGINE
// Runs every 10 seconds. Simulates realistic field behaviour:
//  - Day/night temperature sine curve
//  - Evapotranspiration soil moisture loss (temp-dependent)
//  - Probabilistic rain events (1% chance per tick ~every ~17 min)
//  - Rain boosts soil moisture & humidity, pauses irrigation
//  - Solar battery charging during daylight, discharge at night
//  - Water tank drains when pump runs, refills during rain
//  - Automatic pump mode respects soil moisture thresholds
//  - Alert generation/resolution for all sensor types
// ----------------------------------------------------

// Simulation state (in-memory, updated each tick)
let simState = {
  isRaining: false,
  rainTicksLeft: 0,       // how many ticks the rain event lasts
};

setInterval(async () => {
  try {
    const pumpState = await dbGet('SELECT * FROM pump_state WHERE id = 1');
    const settings  = await dbGet('SELECT * FROM settings WHERE id = 1');
    const latest    = await dbGet('SELECT * FROM telemetry_history ORDER BY timestamp DESC LIMIT 1');

    if (!latest || !pumpState || !settings) return;

    // ── 1. TIME CONTEXT ──────────────────────────────────────────────────────
    const now        = new Date();
    const hourOfDay  = now.getHours() + now.getMinutes() / 60; // 0–24 float
    const isDaytime  = hourOfDay >= 6 && hourOfDay <= 18;

    // ── 2. TEMPERATURE — realistic sine curve ────────────────────────────────
    // Peak at ~14:00, trough at ~04:00. Range roughly 18°C–40°C
    const tempBase   = 29;   // mean temp
    const tempAmpl   = 9;    // amplitude (±)
    // Phase shift: max at hour 14
    const tempSine   = Math.sin(((hourOfDay - 8) / 12) * Math.PI);
    const noise      = (Math.random() - 0.5) * 1.5;
    const newTemp    = +Math.min(Math.max(tempBase + tempAmpl * tempSine + noise, 14), 45).toFixed(1);

    // ── 3. RAIN EVENT ────────────────────────────────────────────────────────
    // 1% chance per tick to start a rain event (lasts 6–18 ticks ≈ 1–3 min)
    if (!simState.isRaining && Math.random() < 0.01) {
      simState.isRaining    = true;
      simState.rainTicksLeft = Math.floor(Math.random() * 12) + 6;
      console.log('[Simulation] 🌧️  Rain event started!');
    }
    if (simState.isRaining) {
      simState.rainTicksLeft--;
      if (simState.rainTicksLeft <= 0) {
        simState.isRaining = false;
        console.log('[Simulation] ☀️  Rain event ended.');
      }
    }
    const rain = simState.isRaining ? 'Yes' : 'No';

    // ── 4. HUMIDITY ──────────────────────────────────────────────────────────
    // Inversely correlated with temperature; spikes during rain
    let humidBase   = 85 - (newTemp - 18) * 1.4;
    if (simState.isRaining) humidBase += 12;
    const humidNoise = (Math.random() - 0.5) * 3;
    const newHumid   = +Math.min(Math.max(humidBase + humidNoise, 20), 98).toFixed(1);

    // ── 5. SOIL MOISTURE — evapotranspiration + pump + rain ──────────────────
    // Evapotranspiration: higher temp = faster moisture loss
    const etRate   = isDaytime ? 0.08 + (newTemp - 20) * 0.005 : 0.02; // %/tick
    let moistDelta = -etRate;

    const pumpOn = pumpState.status === 'ON';

    if (pumpOn) {
      // Pump delivers +1.5% moisture per tick
      moistDelta += 1.5;
    }
    if (simState.isRaining) {
      // Rain adds +0.8% moisture per tick
      moistDelta += 0.8;
    }

    const moistNoise = (Math.random() - 0.5) * 0.5;
    const newMoist   = +Math.min(Math.max(latest.soil_moisture + moistDelta + moistNoise, 5), 100).toFixed(1);

    // ── 6. WATER TANK ────────────────────────────────────────────────────────
    let waterTank = latest.water_tank;
    if (pumpOn) {
      waterTank -= 0.5;         // Pump drains 0.5% per tick
    }
    if (simState.isRaining) {
      waterTank += 0.3;         // Rain refills tank slowly
    }
    waterTank = +Math.min(Math.max(waterTank, 0), 100).toFixed(1);

    // ── 7. BATTERY — solar charging during day, drain at night ───────────────
    // During daylight: charges via solar panel (+0.15%), at night depletes (-0.12%)
    let battDelta = isDaytime ? +0.15 : -0.12;
    if (pumpOn) battDelta -= 0.1;  // Pump draws extra power
    const newBattery = +Math.min(Math.max(latest.battery + battDelta, 0), 100).toFixed(1);

    // ── 8. LIGHT INTENSITY — sunrise/sunset curve ────────────────────────────
    let newLight = 0;
    if (isDaytime) {
      // Bell curve peaking at solar noon (hour 12)
      newLight = Math.round(Math.max(0,
        Math.sin(((hourOfDay - 6) / 12) * Math.PI) * 1100
      ) + (Math.random() - 0.5) * 40);
    }
    newLight = Math.min(newLight, 1200);

    // ── 9. AUTOMATIC PUMP LOGIC ───────────────────────────────────────────────
    let currentPumpStatus = pumpState.status;
    if (pumpState.is_automatic === 1 && pumpState.emergency_stopped === 0) {
      // Don't irrigate when it's raining
      if (simState.isRaining && currentPumpStatus === 'ON') {
        currentPumpStatus = 'OFF';
        const t = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        await dbRun("UPDATE pump_state SET status = 'OFF', last_updated = ? WHERE id = 1", [t]);
        console.log('[Simulation] 🌧️  Rain detected — Auto mode turned pump OFF');
      } else if (!simState.isRaining) {
        if (newMoist < settings.soil_moisture_low && currentPumpStatus === 'OFF') {
          currentPumpStatus = 'ON';
          const t = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          await dbRun("UPDATE pump_state SET status = 'ON', last_updated = ? WHERE id = 1", [t]);
          console.log(`[Simulation] 💧 Auto pump ON — moisture ${newMoist}% < low threshold ${settings.soil_moisture_low}%`);
        } else if (newMoist > settings.soil_moisture_high && currentPumpStatus === 'ON') {
          currentPumpStatus = 'OFF';
          const t = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          await dbRun("UPDATE pump_state SET status = 'OFF', last_updated = ? WHERE id = 1", [t]);
          console.log(`[Simulation] ✅ Auto pump OFF — moisture ${newMoist}% > high threshold ${settings.soil_moisture_high}%`);
        }
      }
    }

    // ── 10. ALERT ENGINE ─────────────────────────────────────────────────────
    const alertConditions = [
      { type: 'Soil Moisture Low', active: newMoist < settings.soil_moisture_low },
      { type: 'Temperature High',  active: newTemp  > settings.temp_high },
      { type: 'Water Tank Empty',  active: waterTank < settings.water_tank_low },
      { type: 'Battery Low',       active: newBattery < 20 },
      { type: 'Rain Detected',     active: simState.isRaining },
    ];

    for (const item of alertConditions) {
      const alert = await dbGet('SELECT * FROM alerts WHERE type = ?', [item.type]);
      if (!alert) continue;
      const isCurrentlyActive = alert.active === 1;

      if (item.active && !isCurrentlyActive) {
        await dbRun('UPDATE alerts SET active = 1 WHERE type = ?', [item.type]);
        const dateNow = now.toISOString().replace('T', ' ').substring(0, 19);
        await dbRun("INSERT INTO alert_history (date, type, status, severity) VALUES (?, ?, 'Active', ?)",
          [dateNow, item.type, alert.severity]);
        console.log(`[Simulation] 🚨 Alert triggered: ${item.type}`);
      } else if (!item.active && isCurrentlyActive) {
        await dbRun('UPDATE alerts SET active = 0 WHERE type = ?', [item.type]);
        await dbRun("UPDATE alert_history SET status = 'Resolved' WHERE type = ? AND status = 'Active'", [item.type]);
        console.log(`[Simulation] ✅ Alert resolved: ${item.type}`);
      }
    }

    // ── 11. PERSIST TELEMETRY ─────────────────────────────────────────────────
    const telemetryPayload = {
      temperature:    newTemp,
      humidity:       newHumid,
      soilMoisture:   newMoist,
      rain,
      lightIntensity: newLight,
      waterTank,
      battery:        newBattery,
    };

    // Always write to SQLite (local fallback + history)
    await dbRun(`
      INSERT INTO telemetry_history
        (temperature, humidity, soil_moisture, rain, light_intensity, water_tank, battery, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [newTemp, newHumid, newMoist, rain, newLight, waterTank, newBattery]);

    // Dual-write to DynamoDB when configured
    if (USE_DYNAMO) {
      await saveTelemetry(telemetryPayload).catch(err =>
        console.error('[Simulation] DynamoDB write failed:', err.message)
      );
    }

    // Publish to AWS IoT Core MQTT when connected
    if (USE_IOT) {
      iotPublishTelemetry(telemetryPayload);
    }

  } catch (err) {
    console.error('[Simulation] Error in telemetry loop:', err);
  }
}, 10000); // tick every 10 seconds



// Start the server
const server = app.listen(PORT, () => {
  console.log(`✅ Backend server is running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.\n   Run: lsof -ti :${PORT} | xargs kill -9\n   Then restart the server.\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

