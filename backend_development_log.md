# Smart Irrigation Dashboard - Backend Development Log

This file tracks the system architecture, development tasks, API specification, and step-by-step progress for building the backend.

---

## 1. Project Context & Current State
The project is a React + Vite + Tailwind CSS frontend dashboard representing a Smart Irrigation system for a farmer (John Doe).
Currently, the application manages all state (Authentication, Irrigation state, Sensor readings, Schedules, Settings, Alerts) in-memory using React Contexts:
- `AuthContext.jsx`: Mock register, login, profile info, and a 2-minute inactivity timeout.
- `IrrigationContext.jsx`: Mock sensors (temperature, humidity, moisture, etc.), quick pump commands, active alerts, alert history logs, schedules list, and client-side simulation logic (updates sensor values and triggers pump controls every 10 seconds).
- `SettingsContext.jsx`: Dark mode, language, units, and threshold adjustments (e.g. soil moisture start/stop limits).

There are no APIs or databases, meaning any updates (adding a schedule, turning on/off pump) reset upon refreshing the browser.

---

## 2. Target Architecture
We will implement a Node.js + Express backend with an SQLite database.
- **Backend Folder**: `/server`
- **Database File**: `/server/database.sqlite`
- **Port**: `5000` (proxied from Vite frontend `/api` requests)

### Database Schemas (SQLite)
1. **users**: `id`, `name`, `email`, `password_hash`, `phone`, `farm_location`, `farm_size`, `crop_type`, `profile_picture`
2. **schedules**: `id`, `time`, `duration`, `enabled` (boolean)
3. **telemetry_history**: `id`, `temperature`, `humidity`, `soil_moisture`, `rain`, `light_intensity`, `water_tank`, `battery`, `timestamp`
4. **pump_state**: `id` (1), `status` (ON/OFF), `is_automatic` (boolean), `emergency_stopped` (boolean), `last_updated` (text)
5. **alerts**: `id`, `type`, `severity`, `message`, `active` (boolean)
6. **alert_history**: `id`, `date`, `type`, `status`, `severity`
7. **settings**: `id` (1), `soil_moisture_low`, `soil_moisture_high`, `temp_high`, `water_tank_low`, `language`, `dark_mode`, `notifications_email`, `notifications_push`, `notifications_sms`, `auto_refresh`, `units`, `weather_theme`

### Telemetry Simulation Loop (Server-Side)
We will move the 10-second simulation loop to the server. Every 10 seconds, it will:
1. Query the current pump state, automatic mode state, and current settings (thresholds).
2. Calculate minor fluctuations in temperature, soil moisture, humidity, battery, etc.
3. Apply automatic rules: if `is_automatic` is true, and moisture drops below the low threshold, set pump to `ON`. If moisture rises above high threshold, set pump to `OFF`.
4. Create alert events in `alerts` and `alert_history` if values cross thresholds.
5. Save the new reading to `telemetry_history`.

---

## 3. Implementation Tasks & Progress Log

- [x] **Task 1: Project Planning & Context Establishment**
  - [x] Initial codebase analysis.
  - [x] Create backend development log in project workspace.
  - [x] Create `implementation_plan.md` artifact.
- [x] **Task 2: Setup Server Scaffold & Database Configuration**
  - [x] Initialize Node.js app in `/server`.
  - [x] Configure `package.json` with dependencies.
  - [x] Create `db.js` for table creation, schema setup, and default record/historical seeding.
- [x] **Task 3: Implement Backend Routes & Simulation Loop**
  - [x] Create route handlers for Auth, Irrigation, Schedules, Alerts, and Settings.
  - [x] Build the server-side telemetry simulation interval.
  - [x] Assemble `server.js` and verify it starts and queries database correctly.
- [x] **Task 4: Integrate Frontend Contexts to API Endpoints**
  - [x] Configure Vite proxy for `/api` in `vite.config.js`.
  - [x] Rewrite `AuthContext.jsx` to fetch and post to API endpoints.
  - [x] Rewrite `IrrigationContext.jsx` to synchronize state with server APIs and polling updates.
  - [x] Rewrite `SettingsContext.jsx` to store settings on backend.
- [x] **Task 5: Verification & UI Testing**
  - [x] Verify full registration, login, logout, and token expiration warning behaviors.
  - [x] Test pump controls, scheduling CRUD, alert logging, threshold configuration adjustments.
  - [x] Verify historical chart displays data properly.
