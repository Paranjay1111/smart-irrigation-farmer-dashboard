/**
 * settingsRepo.js — Dashboard settings in DynamoDB
 * Table: hydrosmart-settings
 *   PK: deviceId, SK: 'settings' (constant)
 */
import { PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES, DEVICE_ID } from './client.js';

const SK = 'settings';

const DEFAULT_SETTINGS = {
  soilMoistureLow:    40,
  soilMoistureHigh:   75,
  tempHigh:           35,
  waterTankLow:       20,
  language:           'English',
  darkMode:           false,
  notificationsEmail: true,
  notificationsPush:  true,
  notificationsSms:   false,
  autoRefresh:        '10s',
  units:              'Metric',
  weatherTheme:       'optimal',
};

// ── Get settings (auto-seeds defaults on first access) ───────────────────────
export const getSettings = async () => {
  const result = await docClient.send(new GetCommand({
    TableName: TABLES.SETTINGS,
    Key: { deviceId: DEVICE_ID, sk: SK },
  }));

  if (!result.Item) {
    await docClient.send(new PutCommand({
      TableName: TABLES.SETTINGS,
      Item: { deviceId: DEVICE_ID, sk: SK, ...DEFAULT_SETTINGS },
    }));
    return DEFAULT_SETTINGS;
  }

  const item = result.Item;
  return {
    soilMoistureLow:    item.soilMoistureLow,
    soilMoistureHigh:   item.soilMoistureHigh,
    tempHigh:           item.tempHigh,
    waterTankLow:       item.waterTankLow,
    darkMode:           item.darkMode,
    language:           item.language,
    autoRefresh:        item.autoRefresh,
    units:              item.units,
    weatherTheme:       item.weatherTheme,
    notifications: {
      email: item.notificationsEmail,
      push:  item.notificationsPush,
      sms:   item.notificationsSms,
    },
    thresholdValues: {
      soilMoistureLow:  item.soilMoistureLow,
      soilMoistureHigh: item.soilMoistureHigh,
      tempHigh:         item.tempHigh,
      waterTankLow:     item.waterTankLow,
    },
  };
};

// ── Update settings ──────────────────────────────────────────────────────────
export const updateSettings = async (updates) => {
  const {
    soilMoistureLow, soilMoistureHigh, tempHigh, waterTankLow,
    darkMode, language, autoRefresh, units, weatherTheme,
    notifications
  } = updates;

  await docClient.send(new UpdateCommand({
    TableName: TABLES.SETTINGS,
    Key: { deviceId: DEVICE_ID, sk: SK },
    UpdateExpression: `SET
      soilMoistureLow    = :sml,
      soilMoistureHigh   = :smh,
      tempHigh           = :th,
      waterTankLow       = :wtl,
      darkMode           = :dm,
      #lang              = :lang,
      autoRefresh        = :ar,
      units              = :units,
      weatherTheme       = :wt,
      notificationsEmail = :ne,
      notificationsPush  = :np,
      notificationsSms   = :ns
    `,
    ExpressionAttributeNames: { '#lang': 'language' },
    ExpressionAttributeValues: {
      ':sml':  soilMoistureLow  ?? DEFAULT_SETTINGS.soilMoistureLow,
      ':smh':  soilMoistureHigh ?? DEFAULT_SETTINGS.soilMoistureHigh,
      ':th':   tempHigh         ?? DEFAULT_SETTINGS.tempHigh,
      ':wtl':  waterTankLow     ?? DEFAULT_SETTINGS.waterTankLow,
      ':dm':   darkMode         ?? DEFAULT_SETTINGS.darkMode,
      ':lang': language         ?? DEFAULT_SETTINGS.language,
      ':ar':   autoRefresh      ?? DEFAULT_SETTINGS.autoRefresh,
      ':units':units            ?? DEFAULT_SETTINGS.units,
      ':wt':   weatherTheme     ?? DEFAULT_SETTINGS.weatherTheme,
      ':ne':   notifications?.email ?? DEFAULT_SETTINGS.notificationsEmail,
      ':np':   notifications?.push  ?? DEFAULT_SETTINGS.notificationsPush,
      ':ns':   notifications?.sms   ?? DEFAULT_SETTINGS.notificationsSms,
    },
  }));

  return getSettings();
};
