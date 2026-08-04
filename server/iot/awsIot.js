/**
 * awsIot.js — AWS IoT Core MQTT connection
 * Uses standard MQTT over TLS (port 8883) with X.509 client certificates.
 * Gracefully disables itself if certificates are not present.
 * 
 * Required env vars (in server/.env):
 *   AWS_IOT_ENDPOINT   — xxxxx-ats.iot.ap-south-1.amazonaws.com
 *   AWS_IOT_CERT_PATH  — ./iot/certs/device-cert.pem
 *   AWS_IOT_KEY_PATH   — ./iot/certs/device-private.key
 *   AWS_IOT_CA_PATH    — ./iot/certs/root-ca.pem
 *   AWS_IOT_DEVICE_ID  — hydrosmart-farm-001
 */

import mqtt from 'mqtt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from server/ directory (parent of iot/)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Feature flag — only enabled if all cert files and endpoint are configured
const ENDPOINT   = process.env.AWS_IOT_ENDPOINT;
const CERT_PATH  = process.env.AWS_IOT_CERT_PATH  || './iot/certs/hydrosmart-farm-001.cert.pem';
const KEY_PATH   = process.env.AWS_IOT_KEY_PATH   || './iot/certs/hydrosmart-farm-001.private.key';
const CA_PATH    = process.env.AWS_IOT_CA_PATH    || './iot/certs/root-ca.pem';
const DEVICE_ID  = process.env.AWS_IOT_DEVICE_ID  || 'hydrosmart-farm-001';

const resolvePath = (p) => path.resolve(__dirname, '..', p.replace(/^\.\//,''));

const certsExist = () => {
  try {
    return (
      ENDPOINT &&
      ENDPOINT !== 'PASTE_YOUR_IOT_ENDPOINT_HERE' &&
      fs.existsSync(resolvePath(CERT_PATH)) &&
      fs.existsSync(resolvePath(KEY_PATH))  &&
      fs.existsSync(resolvePath(CA_PATH))
    );
  } catch {
    return false;
  }
};

export const USE_IOT = certsExist();
console.log(`[IoT] USE_IOT=${USE_IOT}, endpoint=${ENDPOINT || 'not set'}`);


let client = null;
const subscribers = {};  // topic → [callback, ...]

// ── Topics ────────────────────────────────────────────────────────────────────
export const TOPICS = {
  telemetry:     `hydrosmart/devices/${DEVICE_ID}/telemetry`,
  pumpCommand:   `hydrosmart/devices/${DEVICE_ID}/pump/command`,
  pumpStatus:    `hydrosmart/devices/${DEVICE_ID}/pump/status`,
  alerts:        `hydrosmart/devices/${DEVICE_ID}/alerts`,
  settings:      `hydrosmart/devices/${DEVICE_ID}/settings`,
};

// ── Connect to AWS IoT Core ───────────────────────────────────────────────────
export const connectIoT = () => {
  if (!USE_IOT) {
    console.log('ℹ️  AWS IoT MQTT disabled — certs not found. Add certs to server/iot/certs/ and set AWS_IOT_ENDPOINT in .env to enable.');
    return null;
  }

  const options = {
    host:               ENDPOINT,
    port:               8883,
    protocol:           'mqtts',
    clientId:           `hydrosmart-server-${Date.now()}`,
    cert:               fs.readFileSync(resolvePath(CERT_PATH)),
    key:                fs.readFileSync(resolvePath(KEY_PATH)),
    ca:                 fs.readFileSync(resolvePath(CA_PATH)),
    rejectUnauthorized: true,
    reconnectPeriod:    5000,   // auto-reconnect every 5s
    keepalive:          60,
  };

  client = mqtt.connect(options);

  client.on('connect', () => {
    console.log(`✅ AWS IoT Core connected — endpoint: ${ENDPOINT}`);
    // Subscribe to pump command topic to receive commands from external sources
    client.subscribe(TOPICS.pumpCommand, { qos: 1 }, (err) => {
      if (err) console.error('[IoT] Subscribe error:', err);
      else console.log(`[IoT] Subscribed to: ${TOPICS.pumpCommand}`);
    });
  });

  client.on('message', (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      if (subscribers[topic]) {
        subscribers[topic].forEach(cb => cb(payload));
      }
    } catch (err) {
      console.error('[IoT] Failed to parse message:', err);
    }
  });

  client.on('error', (err) => {
    console.error('[IoT] MQTT error:', err.message);
  });

  client.on('reconnect', () => {
    console.log('[IoT] Reconnecting to AWS IoT Core...');
  });

  client.on('offline', () => {
    console.warn('[IoT] MQTT client offline.');
  });

  return client;
};

// ── Publish telemetry to IoT Core ────────────────────────────────────────────
export const publishTelemetry = (data) => {
  if (!client?.connected) return;
  const payload = JSON.stringify({ deviceId: DEVICE_ID, ...data, timestamp: new Date().toISOString() });
  client.publish(TOPICS.telemetry, payload, { qos: 1 }, (err) => {
    if (err) console.error('[IoT] Publish error:', err);
  });
};

// ── Publish pump status change ────────────────────────────────────────────────
export const publishPumpStatus = (status, isAutomatic) => {
  if (!client?.connected) return;
  const payload = JSON.stringify({
    deviceId: DEVICE_ID,
    status,
    isAutomatic,
    timestamp: new Date().toISOString()
  });
  client.publish(TOPICS.pumpStatus, payload, { qos: 1 });
};

// ── Subscribe to a topic (used by server for pump commands) ──────────────────
export const onMessage = (topic, callback) => {
  if (!subscribers[topic]) subscribers[topic] = [];
  subscribers[topic].push(callback);
  if (client?.connected) {
    client.subscribe(topic, { qos: 1 });
  }
};

// ── Graceful shutdown ─────────────────────────────────────────────────────────
export const disconnectIoT = () => {
  if (client) client.end();
};
