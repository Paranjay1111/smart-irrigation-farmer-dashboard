import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';
dotenv.config();

// --- DynamoDB Client ---
const rawClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  ...(process.env.AWS_ACCESS_KEY_ID && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  })
});

export const docClient = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: { removeUndefinedValues: true }
});

// --- Table names (from .env or defaults) ---
export const TABLES = {
  TELEMETRY:     process.env.DYNAMO_TELEMETRY_TABLE     || 'hydrosmart-telemetry',
  PUMP:          process.env.DYNAMO_PUMP_TABLE          || 'hydrosmart-pump-state',
  ALERTS:        process.env.DYNAMO_ALERTS_TABLE        || 'hydrosmart-alerts',
  ALERT_HISTORY: process.env.DYNAMO_ALERT_HISTORY_TABLE || 'hydrosmart-alert-history',
  SCHEDULES:     process.env.DYNAMO_SCHEDULES_TABLE     || 'hydrosmart-schedules',
  SETTINGS:      process.env.DYNAMO_SETTINGS_TABLE      || 'hydrosmart-settings',
};

// Device identifier for all DynamoDB records
export const DEVICE_ID = process.env.DYNAMO_DEVICE_ID || 'hydrosmart-farm-001';

// Feature flag — true when AWS credentials are present in .env
export const USE_DYNAMO = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_REGION
);

if (USE_DYNAMO) {
  console.log(`✅ DynamoDB enabled — region: ${process.env.AWS_REGION}, device: ${DEVICE_ID}`);
} else {
  console.log('⚠️  DynamoDB not configured — falling back to SQLite for all data. Add AWS credentials to .env to enable DynamoDB.');
}
