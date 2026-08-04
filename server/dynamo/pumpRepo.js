/**
 * pumpRepo.js — Pump state stored in DynamoDB
 * Table: hydrosmart-pump-state
 *   PK: deviceId (String) — single item per device
 *   SK: 'state' (constant)
 */
import { PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES, DEVICE_ID } from './client.js';

const SK = 'state';

// ── Get current pump state ───────────────────────────────────────────────────
export const getPumpState = async () => {
  const result = await docClient.send(new GetCommand({
    TableName: TABLES.PUMP,
    Key: { deviceId: DEVICE_ID, sk: SK },
  }));

  if (!result.Item) {
    // Seed default state on first access
    const defaultState = {
      deviceId:        DEVICE_ID,
      sk:              SK,
      status:          'OFF',
      isAutomatic:     false,
      emergencyStopped:false,
      lastUpdated:     new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    await docClient.send(new PutCommand({ TableName: TABLES.PUMP, Item: defaultState }));
    return defaultState;
  }
  return result.Item;
};

// ── Update pump status (ON/OFF) ──────────────────────────────────────────────
export const setPumpStatus = async (status) => {
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  await docClient.send(new UpdateCommand({
    TableName: TABLES.PUMP,
    Key: { deviceId: DEVICE_ID, sk: SK },
    UpdateExpression: 'SET #s = :status, lastUpdated = :t',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':status': status, ':t': timeNow },
  }));
  return { status, lastUpdated: timeNow };
};

// ── Set automatic mode ───────────────────────────────────────────────────────
export const setAutomatic = async (isAutomatic) => {
  await docClient.send(new UpdateCommand({
    TableName: TABLES.PUMP,
    Key: { deviceId: DEVICE_ID, sk: SK },
    UpdateExpression: 'SET isAutomatic = :auto',
    ExpressionAttributeValues: { ':auto': isAutomatic },
  }));
};

// ── Set emergency stop ───────────────────────────────────────────────────────
export const setEmergencyStop = async (stopped) => {
  const status = stopped ? 'OFF' : 'OFF';
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  await docClient.send(new UpdateCommand({
    TableName: TABLES.PUMP,
    Key: { deviceId: DEVICE_ID, sk: SK },
    UpdateExpression: 'SET emergencyStopped = :es, #s = :status, lastUpdated = :t',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':es': stopped, ':status': status, ':t': timeNow },
  }));
};
