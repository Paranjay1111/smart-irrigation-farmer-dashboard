import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = process.env.DATABASE_FILE || 'database.sqlite';
const dbPath = path.resolve(__dirname, dbFile);

console.log(`Connecting to SQLite database at: ${dbPath}`);
const db = new sqlite3.Database(dbPath);

// Helper functions to use async/await with sqlite3
export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialize schema and seed data
export const initDB = async () => {
  // Create tables
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      phone TEXT,
      farm_location TEXT,
      farm_size TEXT,
      crop_type TEXT,
      profile_picture TEXT
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT NOT NULL,
      duration TEXT NOT NULL,
      enabled INTEGER DEFAULT 1
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS telemetry_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      temperature REAL NOT NULL,
      humidity REAL NOT NULL,
      soil_moisture REAL NOT NULL,
      rain TEXT NOT NULL,
      light_intensity INTEGER NOT NULL,
      water_tank REAL NOT NULL,
      battery REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS pump_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      status TEXT DEFAULT 'OFF',
      is_automatic INTEGER DEFAULT 0,
      emergency_stopped INTEGER DEFAULT 0,
      last_updated TEXT
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL UNIQUE,
      severity TEXT NOT NULL,
      message TEXT NOT NULL,
      active INTEGER DEFAULT 0
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS alert_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      severity TEXT NOT NULL
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      soil_moisture_low INTEGER DEFAULT 40,
      soil_moisture_high INTEGER DEFAULT 75,
      temp_high INTEGER DEFAULT 35,
      water_tank_low INTEGER DEFAULT 20,
      language TEXT DEFAULT 'English',
      dark_mode INTEGER DEFAULT 0,
      notifications_email INTEGER DEFAULT 1,
      notifications_push INTEGER DEFAULT 1,
      notifications_sms INTEGER DEFAULT 0,
      auto_refresh TEXT DEFAULT '10s',
      units TEXT DEFAULT 'Metric',
      weather_theme TEXT DEFAULT 'optimal'
    )
  `);

  // Seed default user
  const defaultEmail = 'farmer.john@example.com';
  const user = await dbGet('SELECT * FROM users WHERE email = ?', [defaultEmail]);
  if (!user) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('password123', salt);
    await dbRun(`
      INSERT INTO users (name, email, password_hash, phone, farm_location, farm_size, crop_type, profile_picture)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'John Doe',
      defaultEmail,
      hash,
      '',
      '',
      '',
      '',
      null
    ]);
    console.log('Seeded default user.');
  }

  // Seed default pump state
  const state = await dbGet('SELECT * FROM pump_state WHERE id = 1');
  if (!state) {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    await dbRun(`
      INSERT INTO pump_state (id, status, is_automatic, emergency_stopped, last_updated)
      VALUES (1, 'ON', 0, 0, ?)
    `, [timeNow]);
    console.log('Seeded default pump state.');
  }

  // Seed alerts
  const alertsCount = await dbGet('SELECT COUNT(*) as count FROM alerts');
  if (alertsCount.count === 0) {
    const defaultAlerts = [
      { type: 'Soil Moisture Low', severity: 'warning', message: 'Soil moisture dropped below threshold (40%)' },
      { type: 'Temperature High', severity: 'warning', message: 'Ambient temperature exceeds 35°C' },
      { type: 'Device Offline', severity: 'danger', message: 'ESP32 controller failed to send heartbeat' },
      { type: 'Rain Detected', severity: 'info', message: 'Rain sensor active. Irrigation paused.' },
      { type: 'Water Tank Empty', severity: 'danger', message: 'Water levels critically low (< 20%)' },
      { type: 'Battery Low', severity: 'warning', message: 'Backup battery power below 15%' },
    ];
    for (const a of defaultAlerts) {
      await dbRun(`
        INSERT INTO alerts (type, severity, message, active)
        VALUES (?, ?, ?, 0)
      `, [a.type, a.severity, a.message]);
    }
    console.log('Seeded default alerts.');
  }

  // Seed alert history
  const historyCount = await dbGet('SELECT COUNT(*) as count FROM alert_history');
  if (historyCount.count === 0) {
    const defaultHistory = [
      { date: '2026-07-17 08:15:22', type: 'Soil Moisture Low', status: 'Resolved', severity: 'warning' },
      { date: '2026-07-17 09:20:11', type: 'Rain Detected', status: 'Active', severity: 'info' },
      { date: '2026-07-16 14:05:43', type: 'Temperature High', status: 'Resolved', severity: 'warning' },
      { date: '2026-07-16 22:30:00', type: 'Device Offline', status: 'Resolved', severity: 'danger' },
      { date: '2026-07-15 11:12:09', type: 'Water Tank Empty', status: 'Resolved', severity: 'danger' },
    ];
    for (const h of defaultHistory) {
      await dbRun(`
        INSERT INTO alert_history (date, type, status, severity)
        VALUES (?, ?, ?, ?)
      `, [h.date, h.type, h.status, h.severity]);
    }
    console.log('Seeded default alert history.');
  }

  // Seed default schedules
  const schedulesCount = await dbGet('SELECT COUNT(*) as count FROM schedules');
  if (schedulesCount.count === 0) {
    await dbRun(`INSERT INTO schedules (time, duration, enabled) VALUES (?, ?, 1)`, ['06:00 AM', '10 Minutes']);
    await dbRun(`INSERT INTO schedules (time, duration, enabled) VALUES (?, ?, 1)`, ['06:00 PM', '15 Minutes']);
    console.log('Seeded default schedules.');
  }

  // Seed default settings
  const settingsRow = await dbGet('SELECT * FROM settings WHERE id = 1');
  if (!settingsRow) {
    await dbRun(`
      INSERT INTO settings (id, soil_moisture_low, soil_moisture_high, temp_high, water_tank_low, language, dark_mode, notifications_email, notifications_push, notifications_sms, auto_refresh, units, weather_theme)
      VALUES (1, 40, 75, 35, 20, 'English', 0, 1, 1, 0, '10s', 'Metric', 'optimal')
    `);
    console.log('Seeded default settings.');
  }

  // Seed historical telemetry
  const telemetryCount = await dbGet('SELECT COUNT(*) as count FROM telemetry_history');
  if (telemetryCount.count === 0) {
    // Generate telemetry for the last 24 hours (1 point per hour)
    const baseTime = Date.now();
    for (let i = 24; i >= 0; i--) {
      const timeOffset = i * 3600 * 1000;
      const timestamp = new Date(baseTime - timeOffset).toISOString();
      
      // Add standard mock telemetry values with time variations
      const hourOfDay = new Date(baseTime - timeOffset).getHours();
      // Temperature rises during the day, falls at night
      const temperature = 20 + Math.sin((hourOfDay - 8) * Math.PI / 12) * 8 + (Math.random() - 0.5) * 2;
      // Humidity is inverse of temperature
      const humidity = 80 - Math.sin((hourOfDay - 8) * Math.PI / 12) * 15 + (Math.random() - 0.5) * 3;
      // Moisture varies slowly
      const soilMoisture = 50 + Math.cos(i / 5) * 8 + (Math.random() - 0.5) * 2;
      const rain = 'No';
      // Light is 0 at night, high at noon
      const lightIntensity = hourOfDay >= 6 && hourOfDay <= 18 
        ? Math.round(Math.sin((hourOfDay - 6) * Math.PI / 12) * 1000 + (Math.random() - 0.5) * 100)
        : 0;
      const waterTank = 75 - (24 - i) * 0.15; // Slow decrease
      const battery = 98 - (24 - i) * 0.1; // Slow decrease
      
      await dbRun(`
        INSERT INTO telemetry_history (temperature, humidity, soil_moisture, rain, light_intensity, water_tank, battery, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        Math.round(temperature * 10) / 10,
        Math.round(humidity * 10) / 10,
        Math.round(soilMoisture),
        rain,
        lightIntensity,
        Math.round(waterTank * 10) / 10,
        Math.round(battery * 10) / 10,
        timestamp
      ]);
    }
    console.log('Seeded historical telemetry.');
  }
};

export default db;
