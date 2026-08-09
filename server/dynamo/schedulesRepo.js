/**
 * schedulesRepo.js — Irrigation schedules in DynamoDB
 * Table: hydrosmart-schedules
 *   PK: deviceId, SK: scheduleId (nanoid / sequential)
 */
import {
  PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand
} from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES, DEVICE_ID } from './client.js';

// ── Seed default schedules ───────────────────────────────────────────────────
export const seedSchedules = async () => {
  const existing = await getAllSchedules();
  if (existing.length === 0) {
    await docClient.send(new PutCommand({
      TableName: TABLES.SCHEDULES,
      Item: { deviceId: DEVICE_ID, scheduleId: 'sch-001', time: '06:00 AM', duration: '10 Minutes', enabled: true },
    }));
    await docClient.send(new PutCommand({
      TableName: TABLES.SCHEDULES,
      Item: { deviceId: DEVICE_ID, scheduleId: 'sch-002', time: '06:00 PM', duration: '15 Minutes', enabled: true },
    }));
  }
};

// ── Get all schedules ────────────────────────────────────────────────────────
export const getAllSchedules = async () => {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.SCHEDULES,
    KeyConditionExpression: 'deviceId = :did',
    ExpressionAttributeValues: { ':did': DEVICE_ID },
  }));
  return (result.Items || []).map(item => ({
    id:       item.scheduleId,
    time:     item.time,
    duration: item.duration,
    enabled:  item.enabled,
  }));
};

// ── Add a new schedule ───────────────────────────────────────────────────────
export const addSchedule = async (time, duration) => {
  const scheduleId = `sch-${Date.now()}`;
  const item = { deviceId: DEVICE_ID, scheduleId, time, duration, enabled: true };
  await docClient.send(new PutCommand({ TableName: TABLES.SCHEDULES, Item: item }));
  return { id: scheduleId, time, duration, enabled: true };
};

// ── Toggle schedule enabled/disabled ────────────────────────────────────────
export const toggleSchedule = async (scheduleId) => {
  const result = await docClient.send(new GetCommand({
    TableName: TABLES.SCHEDULES,
    Key: { deviceId: DEVICE_ID, scheduleId },
  }));
  const current = result.Item?.enabled ?? true;
  await docClient.send(new UpdateCommand({
    TableName: TABLES.SCHEDULES,
    Key: { deviceId: DEVICE_ID, scheduleId },
    UpdateExpression: 'SET enabled = :e',
    ExpressionAttributeValues: { ':e': !current },
  }));
  return { id: scheduleId, enabled: !current };
};

// ── Delete a schedule ────────────────────────────────────────────────────────
export const deleteSchedule = async (scheduleId) => {
  await docClient.send(new DeleteCommand({
    TableName: TABLES.SCHEDULES,
    Key: { deviceId: DEVICE_ID, scheduleId },
  }));
};
