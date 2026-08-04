/**
 * telemetryRepo.js
 * Handles all telemetry sensor data reads/writes in DynamoDB.
 * Table: hydrosmart-telemetry
 *   PK: deviceId (String)
 *   SK: timestamp (ISO String)
 *   GSI DateIndex  — partition: date  (YYYY-MM-DD), sort: timestamp
 *   GSI MonthIndex — partition: month (YYYY-MM),    sort: timestamp
 */

import {
  PutCommand,
  QueryCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES, DEVICE_ID } from './client.js';

// ── Write one telemetry reading ──────────────────────────────────────────────
export const saveTelemetry = async (data) => {
  const now = new Date();
  const timestamp = now.toISOString();
  const date  = timestamp.substring(0, 10);       // YYYY-MM-DD
  const month = timestamp.substring(0, 7);         // YYYY-MM

  const item = {
    deviceId:      DEVICE_ID,
    timestamp,
    date,
    month,
    temperature:   data.temperature,
    humidity:      data.humidity,
    soilMoisture:  data.soilMoisture,
    rain:          data.rain,
    lightIntensity:data.lightIntensity,
    waterTank:     data.waterTank,
    battery:       data.battery,
  };

  await docClient.send(new PutCommand({
    TableName: TABLES.TELEMETRY,
    Item: item,
  }));

  return item;
};

// ── Get latest reading ───────────────────────────────────────────────────────
export const getLatestTelemetry = async () => {
  const today = new Date().toISOString().substring(0, 10);

  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.TELEMETRY,
    IndexName: 'DateIndex',
    KeyConditionExpression: '#d = :date',
    ExpressionAttributeNames: { '#d': 'date' },
    ExpressionAttributeValues: { ':date': today },
    ScanIndexForward: false,  // descending — newest first
    Limit: 1,
  }));

  // Fallback: query by deviceId if DateIndex returns nothing
  if (!result.Items?.length) {
    const fallback = await docClient.send(new QueryCommand({
      TableName: TABLES.TELEMETRY,
      KeyConditionExpression: 'deviceId = :did',
      ExpressionAttributeValues: { ':did': DEVICE_ID },
      ScanIndexForward: false,
      Limit: 1,
    }));
    return fallback.Items?.[0] || null;
  }

  return result.Items[0];
};

// ── Get all readings for a specific date ─────────────────────────────────────
export const getByDate = async (date) => {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.TELEMETRY,
    IndexName: 'DateIndex',
    KeyConditionExpression: '#d = :date',
    ExpressionAttributeNames: { '#d': 'date' },
    ExpressionAttributeValues: { ':date': date },
    ScanIndexForward: true,
  }));
  return result.Items || [];
};

// ── Get all readings for a specific month ────────────────────────────────────
export const getByMonth = async (month) => {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.TELEMETRY,
    IndexName: 'MonthIndex',
    KeyConditionExpression: '#m = :month',
    ExpressionAttributeNames: { '#m': 'month' },
    ExpressionAttributeValues: { ':month': month },
    ScanIndexForward: true,
  }));
  return result.Items || [];
};

// ── Aggregate: daily averages for a month ────────────────────────────────────
export const getMonthlySummary = async (month) => {
  const items = await getByMonth(month);

  // Group by date
  const byDate = {};
  for (const item of items) {
    if (!byDate[item.date]) byDate[item.date] = [];
    byDate[item.date].push(item);
  }

  // Compute min/max/avg per day
  return Object.entries(byDate).map(([date, readings]) => {
    const avg = (field) =>
      +(readings.reduce((s, r) => s + (r[field] || 0), 0) / readings.length).toFixed(1);
    const min = (field) =>
      +Math.min(...readings.map(r => r[field] || 0)).toFixed(1);
    const max = (field) =>
      +Math.max(...readings.map(r => r[field] || 0)).toFixed(1);
    const rainReadings = readings.filter(r => r.rain === 'Yes').length;

    return {
      date,
      count: readings.length,
      temperature:   { avg: avg('temperature'),   min: min('temperature'),   max: max('temperature') },
      humidity:      { avg: avg('humidity'),       min: min('humidity'),      max: max('humidity') },
      soilMoisture:  { avg: avg('soilMoisture'),   min: min('soilMoisture'),  max: max('soilMoisture') },
      waterTank:     { avg: avg('waterTank'),      min: min('waterTank'),     max: max('waterTank') },
      battery:       { avg: avg('battery'),        min: min('battery'),       max: max('battery') },
      rainEvents:    rainReadings,
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
};

// ── Get readings for a date range ────────────────────────────────────────────
export const getByDateRange = async (startDate, endDate) => {
  // Query by month(s) covered by the range, then filter
  const start = new Date(startDate);
  const end   = new Date(endDate);
  const months = new Set();

  for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
    months.add(d.toISOString().substring(0, 7));
  }

  let allItems = [];
  for (const month of months) {
    const items = await getByMonth(month);
    allItems = allItems.concat(items);
  }

  return allItems.filter(item => item.date >= startDate && item.date <= endDate);
};
