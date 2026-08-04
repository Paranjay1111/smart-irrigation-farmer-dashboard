/**
 * alertsRepo.js — Alerts + Alert History in DynamoDB
 * Table: hydrosmart-alerts
 *   PK: deviceId, SK: type (e.g. "Soil Moisture Low")
 * Table: hydrosmart-alert-history
 *   PK: deviceId, SK: timestamp#type (composite)
 */
import {
  PutCommand, GetCommand, QueryCommand, UpdateCommand, ScanCommand
} from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES, DEVICE_ID } from './client.js';

const DEFAULT_ALERTS = [
  { type: 'Soil Moisture Low', severity: 'warning',  message: 'Soil moisture dropped below threshold (40%)' },
  { type: 'Temperature High',  severity: 'warning',  message: 'Ambient temperature exceeds 35°C' },
  { type: 'Device Offline',    severity: 'danger',   message: 'ESP32 controller failed to send heartbeat' },
  { type: 'Rain Detected',     severity: 'info',     message: 'Rain sensor active. Irrigation paused.' },
  { type: 'Water Tank Empty',  severity: 'danger',   message: 'Water levels critically low (< 20%)' },
  { type: 'Battery Low',       severity: 'warning',  message: 'Backup battery power below 15%' },
];

// ── Seed default alerts if table is empty ────────────────────────────────────
export const seedAlerts = async () => {
  for (const alert of DEFAULT_ALERTS) {
    await docClient.send(new PutCommand({
      TableName: TABLES.ALERTS,
      Item: { deviceId: DEVICE_ID, type: alert.type, severity: alert.severity, message: alert.message, active: false },
      ConditionExpression: 'attribute_not_exists(deviceId)',
    })).catch(() => {}); // ignore if already exists
  }
};

// ── Get all active alerts ────────────────────────────────────────────────────
export const getAllAlerts = async () => {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.ALERTS,
    KeyConditionExpression: 'deviceId = :did',
    ExpressionAttributeValues: { ':did': DEVICE_ID },
  }));
  return result.Items || [];
};

// ── Get one alert by type ────────────────────────────────────────────────────
export const getAlert = async (type) => {
  const result = await docClient.send(new GetCommand({
    TableName: TABLES.ALERTS,
    Key: { deviceId: DEVICE_ID, type },
  }));
  return result.Item || null;
};

// ── Set alert active/inactive ────────────────────────────────────────────────
export const setAlertActive = async (type, active) => {
  await docClient.send(new UpdateCommand({
    TableName: TABLES.ALERTS,
    Key: { deviceId: DEVICE_ID, type },
    UpdateExpression: 'SET active = :a',
    ExpressionAttributeValues: { ':a': active },
  }));
};

// ── Add alert history entry ──────────────────────────────────────────────────
export const addAlertHistory = async (type, severity, status = 'Active') => {
  const now = new Date();
  const timestamp = now.toISOString();
  const date  = timestamp.substring(0, 10);
  const month = timestamp.substring(0, 7);

  await docClient.send(new PutCommand({
    TableName: TABLES.ALERT_HISTORY,
    Item: {
      deviceId:  DEVICE_ID,
      sk:        `${timestamp}#${type}`,
      date,
      month,
      timestamp: timestamp.replace('T', ' ').substring(0, 19),
      type,
      severity,
      status,
    },
  }));
};

// ── Resolve active alert history entries ─────────────────────────────────────
export const resolveAlertHistory = async (type) => {
  // Query alert history for active entries of this type
  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.ALERT_HISTORY,
    KeyConditionExpression: 'deviceId = :did',
    FilterExpression: '#t = :type AND #s = :active',
    ExpressionAttributeNames: { '#t': 'type', '#s': 'status' },
    ExpressionAttributeValues: { ':did': DEVICE_ID, ':type': type, ':active': 'Active' },
  }));

  for (const item of (result.Items || [])) {
    await docClient.send(new UpdateCommand({
      TableName: TABLES.ALERT_HISTORY,
      Key: { deviceId: DEVICE_ID, sk: item.sk },
      UpdateExpression: 'SET #s = :resolved',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':resolved': 'Resolved' },
    }));
  }
};

// ── Get alert history (latest N entries) ─────────────────────────────────────
export const getAlertHistory = async (limit = 20) => {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.ALERT_HISTORY,
    KeyConditionExpression: 'deviceId = :did',
    ExpressionAttributeValues: { ':did': DEVICE_ID },
    ScanIndexForward: false,
    Limit: limit,
  }));

  return (result.Items || []).map(item => ({
    date:     item.timestamp,
    type:     item.type,
    status:   item.status,
    severity: item.severity,
  }));
};

// ── Clear all alert history ──────────────────────────────────────────────────
export const clearAlertHistory = async () => {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.ALERT_HISTORY,
    KeyConditionExpression: 'deviceId = :did',
    ExpressionAttributeValues: { ':did': DEVICE_ID },
  }));

  for (const item of (result.Items || [])) {
    await docClient.send(new UpdateCommand({
      TableName: TABLES.ALERT_HISTORY,
      Key: { deviceId: DEVICE_ID, sk: item.sk },
      UpdateExpression: 'SET #s = :cleared',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':cleared': 'Cleared' },
    }));
  }
};
