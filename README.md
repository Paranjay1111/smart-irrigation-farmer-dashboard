# 🌾 HydroSmart — Smart Irrigation & Farmer Dashboard

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![AWS IoT](https://img.shields.io/badge/AWS-IoT_Core-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/iot-core/)
[![AWS DynamoDB](https://img.shields.io/badge/AWS-DynamoDB-4053D6?style=for-the-badge&logo=amazondynamodb&logoColor=white)](https://aws.amazon.com/dynamodb/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

---

## 📌 Overview

**HydroSmart** is an end-to-end IoT-powered Smart Irrigation and Agricultural Management Platform engineered to help farmers optimize water consumption, increase crop yield, and automate farm operations in real time. 

By integrating IoT field sensors with AWS IoT Core / MQTT telemetry protocols and a high-performance Express backend, HydroSmart empowers farmers to remotely monitor soil moisture, microclimate variables, water storage tanks, and execute automated or scheduled irrigation routines from a sleek, responsive dashboard.

---

## ✨ Key Features

### 📊 1. Real-Time Telemetry & Monitoring
* **Multi-Sensor Data Stream**: Live tracking of Soil Moisture, Ambient Temperature, Air Humidity, Light Intensity, Rain Detection, Water Tank Level, and System Battery Voltage.
* **Interactive Data Visualization**: Dynamic line, bar, and area charts powered by Recharts with time-range filtering (1H, 24H, 7D, 30D).
* **Live System Status Indicators**: Instant visibility into hardware connectivity (Wi-Fi, MQTT broker status), battery health, and active pump states.

### 💧 2. Remote Irrigation Control & Automation
* **Dual Operation Modes**: 
  * **Manual Mode**: One-tap pump activation/deactivation with customizable timer durations.
  * **Automatic Mode**: Threshold-based automated watering based on real-time soil moisture levels.
* **Emergency Water Shutoff**: Instant safety kill-switch to isolate pump electrical loops during leaks or pipe bursts.
* **Smart Scheduling Engine**: Create, toggle, and manage recurring automated irrigation windows tailored to crop water requirements.

### ⚠️ 3. Smart Alerts & Incident Management
* **Configurable Alert Thresholds**: Set custom triggers for Low Soil Moisture, High Temperature, Low Water Tank Levels, Battery Depletion, and System Disconnections.
* **Severity Levels**: Categorized notification badges (Critical, Warning, Info) with audio/visual cues.
* **Incident Log & Resolution**: Track open field alerts, snooze warnings, or acknowledge resolved issues.

### 🌦️ 4. Weather Forecast & Agricultural Insights
* **Hyper-Local Forecast**: Real-time temperature, humidity, precipitation probability, and wind velocity metrics.
* **Evapotranspiration & Rain Predictions**: AI-assisted watering recommendations to avoid over-irrigation before rain events.

### 📑 5. Reports & Analytics
* **Exportable Field Reports**: Export historical telemetry data, irrigation logs, and water usage statistics to CSV/PDF formats.
* **Water Efficiency Analytics**: Visual breakdowns of daily, weekly, and monthly water consumption vs. target savings.

### 🛡️ 6. Security & Device Management
* **JWT Authentication & Inactivity Timeout**: Secure user authorization with automatic session timeout notifications and token renewal.
* **IoT Device Management**: Overview of paired field microcontrollers (ESP32 / NodeMCU / Raspberry Pi), firmware versions, IP addresses, and sensor signal strengths.

---

## 🏗️ System Architecture

```
                       ┌─────────────────────────┐
                       │  ESP32 / IoT Field Hub   │
                       │  (Sensors & Relay Module)│
                       └───────────┬─────────────┘
                                   │ MQTT (SSL/TLS)
                                   ▼
                       ┌─────────────────────────┐
                       │      AWS IoT Core       │
                       └───────────┬─────────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
                     ▼                           ▼
          ┌────────────────────┐      ┌─────────────────────┐
          │   Node.js Backend   │      │    AWS DynamoDB     │
          │ (Express + REST API)│◄────►│  (Cloud Storage)    │
          └──────────┬─────────┘      └─────────────────────┘
                     │ (SQLite Fallback)
                     ▼
          ┌────────────────────┐
          │  React + Vite Web  │
          │  Farmer Dashboard  │
          └────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
* **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Routing**: [React Router DOM v7](https://reactrouter.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Data Visualization**: [Recharts](https://recharts.org/)
* **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
* **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
* **Web Framework**: [Express.js](https://expressjs.com/)
* **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
* **Local Database**: SQLite3 (`sqlite3`) for offline/standalone execution
* **Cloud Database**: AWS DynamoDB (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`)
* **IoT Protocols**: MQTT (`mqtt`) over TLS/SSL & AWS IoT Core (`@aws-sdk/client-iot`)

---

## 📁 Repository Structure

```
smart-irrigation-farmer-dashboard/
├── server/                    # Node.js + Express Backend API
│   ├── db.js                  # SQLite database initialization & query helpers
│   ├── server.js              # Express server setup, REST endpoints & AWS IoT/DynamoDB sync
│   ├── dynamo/                # DynamoDB SDK clients & operations
│   ├── iot/                   # AWS IoT Core MQTT client & SSL cert management
│   │   └── certs/             # Device certificates (PEM, private keys, root CA)
│   ├── database.sqlite        # Local SQLite database file
│   ├── package.json           # Backend dependencies
│   └── .env.example           # Environment configuration template
│
├── src/                       # React 19 Frontend Application
│   ├── assets/                # Static media assets & images
│   ├── components/            # UI components (Layout, Header, Navigation Sidebar, Modals)
│   ├── context/               # Global state providers (AuthContext, IrrigationContext, SettingsContext)
│   ├── pages/                 # Main Dashboard Views
│   │   ├── Auth.jsx           # Login, Registration & Password Reset
│   │   ├── Dashboard.jsx      # Main Farmer Telemetry Overview
│   │   ├── SensorMonitoring.jsx # Detailed Live Sensor Metrics
│   │   ├── RealTimeCharts.jsx # Interactive Visual Analytics
│   │   ├── IrrigationControl.jsx # Pump Controls, Manual Override & Schedules
│   │   ├── Alerts.jsx         # Alarm Center & System Logs
│   │   ├── Analytics.jsx      # Historical Water & Energy Efficiency Analytics
│   │   ├── WeatherForecast.jsx# Local Weather Metrics & Irrigation Advice
│   │   ├── DeviceManagement.jsx # IoT Hardware & Network Status
│   │   ├── Reports.jsx        # Data Exporting (CSV/PDF)
│   │   ├── Profile.jsx        # Farmer Profile & Farm Metadata
│   │   └── Settings.jsx       # System Preferences & Threshold Configurations
│   ├── App.jsx                # Main Application Route Setup & Session Guard
│   ├── main.jsx               # React DOM Entry Point
│   └── index.css              # Global Tailwind CSS Styles
│
├── public/                    # Static Web Public Assets
├── package.json               # Frontend dependencies & scripts
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── README.md                  # Project Documentation
```

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### 📋 Prerequisites

* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher
* *(Optional)* AWS Account with **AWS IoT Core** and **DynamoDB** configured if connecting live hardware.

---

### 📥 1. Clone the Repository

```bash
git clone https://github.com/your-username/smart-irrigation-farmer-dashboard.git
cd smart-irrigation-farmer-dashboard
```

---

### ⚙️ 2. Backend Setup & Configuration

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install backend dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `server` directory by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` values** according to your environment:
   ```env
   PORT=5001
   JWT_SECRET=super_secret_jwt_key_change_in_production
   DATABASE_FILE=database.sqlite

   # AWS IoT Core Configuration (Optional for Cloud Integration)
   AWS_IOT_ENDPOINT=your-endpoint.iot.us-east-1.amazonaws.com
   AWS_IOT_DEVICE_ID=hydrosmart-field-01
   AWS_IOT_CERT_PATH=./iot/certs/device.cert.pem
   AWS_IOT_KEY_PATH=./iot/certs/private.key
   AWS_IOT_CA_PATH=./iot/certs/root-ca.pem

   # AWS Credentials & DynamoDB
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=ap-south-1
   DYNAMO_TELEMETRY_TABLE=hydrosmart-telemetry
   DYNAMO_PUMP_TABLE=hydrosmart-pump-state
   DYNAMO_ALERTS_TABLE=hydrosmart-alerts
   ```

5. **Start the Express API server**:
   * **Development Mode** (with hot reload via Nodemon):
     ```bash
     npm run dev
     ```
   * **Production Mode**:
     ```bash
     npm start
     ```
   *(The server will initialize the SQLite database automatically on port `5001`)*

---

### 💻 3. Frontend Setup

1. **Open a new terminal window** in the project root directory:
   ```bash
   cd smart-irrigation-farmer-dashboard
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:5173
   ```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new farmer account | ❌ |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | ❌ |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile | ✅ |
| `GET` | `/api/telemetry/latest` | Fetch latest real-time sensor reading | ✅ |
| `GET` | `/api/telemetry/history` | Fetch historical sensor data logs | ✅ |
| `GET` | `/api/pump/state` | Fetch current irrigation pump status | ✅ |
| `POST` | `/api/pump/control` | Toggle pump state (ON/OFF) or set mode | ✅ |
| `POST` | `/api/pump/emergency-stop` | Trigger emergency pump shutoff | ✅ |
| `GET` | `/api/schedules` | Fetch configured irrigation schedules | ✅ |
| `POST` | `/api/schedules` | Create a new automated watering schedule | ✅ |
| `DELETE` | `/api/schedules/:id` | Remove an irrigation schedule | ✅ |
| `GET` | `/api/alerts` | Fetch system alerts & threshold violations | ✅ |
| `POST` | `/api/alerts/:id/resolve` | Mark an alert as resolved | ✅ |
| `GET` | `/api/settings` | Fetch user/farm configurations | ✅ |
| `PUT` | `/api/settings` | Update alert thresholds & farm metadata | ✅ |

---

## 🔐 Default Demo Login Credentials

If running locally with fresh seed data, you can use:
* **Email**: `farmer@hydro.com`
* **Password**: `farmer123`

*(You can also register a new account on the Auth page)*

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve HydroSmart:
1. Fork the Repository
2. Create a Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
