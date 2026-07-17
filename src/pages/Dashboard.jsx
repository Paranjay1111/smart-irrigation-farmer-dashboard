import React from 'react';
import { useIrrigation } from '../context/IrrigationContext';
import {
  Thermometer,
  Droplet,
  Waves,
  CloudRain,
  Sun,
  Activity,
  Battery,
  Container,
  Play,
  Square,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const Dashboard = () => {
  const {
    pumpStatus,
    setPumpStatus,
    lastUpdated,
    deviceStatus,
    sensors,
    refreshData,
    emergencyStop,
    emergencyStopped
  } = useIrrigation();

  const metrics = [
    {
      title: 'Temperature',
      value: `${sensors.temperature}°C`,
      icon: Thermometer,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30',
      description: 'Air Temperature today'
    },
    {
      title: 'Humidity',
      value: `${sensors.humidity}%`,
      icon: Droplet,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30',
      description: 'Relative Air Humidity'
    },
    {
      title: 'Soil Moisture',
      value: `${sensors.soilMoisture}%`,
      icon: Waves,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30',
      description: 'Average Rootzone moisture'
    },
    {
      title: 'Rain',
      value: sensors.rain,
      icon: CloudRain,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30',
      description: 'Precipitation detector'
    },
    {
      title: 'Light Intensity',
      value: `${sensors.lightIntensity} Lux`,
      icon: Sun,
      color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/30',
      description: 'Photosynthetic light'
    },
    {
      title: 'Pump Status',
      value: pumpStatus,
      icon: Activity,
      color: pumpStatus === 'ON'
        ? 'text-emerald-600 bg-emerald-100/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-900/40 font-bold'
        : 'text-slate-500 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800',
      description: 'Irrigation Pump'
    },
    {
      title: 'Water Tank',
      value: `${sensors.waterTank}%`,
      icon: Container,
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/30',
      description: 'Irrigation source volume'
    },
    {
      title: 'Battery',
      value: `${sensors.battery}%`,
      icon: Battery,
      color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/30',
      description: 'ESP32 Backup Battery'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header section with live status and timestamps */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Smart Irrigation Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time telemetry and manual controls for field node.
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 py-1.5 px-4 rounded-xl text-sm font-medium">
            <span className={`w-2.5 h-2.5 rounded-full ${deviceStatus === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <span>Live Status (🟢 Device {deviceStatus})</span>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500">
            Last Updated: <span className="font-semibold text-slate-600 dark:text-slate-300">{lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Quick Action buttons */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Quick Command Center</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => !emergencyStopped && setPumpStatus('ON')}
            disabled={pumpStatus === 'ON' || emergencyStopped}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            Turn Pump ON
          </button>
          
          <button
            onClick={() => !emergencyStopped && setPumpStatus('OFF')}
            disabled={pumpStatus === 'OFF' || emergencyStopped}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-slate-600/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Square className="w-4 h-4 fill-white" />
            Turn Pump OFF
          </button>
          
          <button
            onClick={refreshData}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
          
          <button
            onClick={emergencyStop}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-rose-600/10 col-span-2 sm:col-span-1 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            Emergency Stop
          </button>
        </div>
      </div>

      {/* Telemetry Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.01]"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-400 dark:text-slate-500">{metric.title}</p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1.5">{metric.value}</p>
                </div>
                <span className={`p-2.5 rounded-xl border ${metric.color}`}>
                  <Icon className="w-5 h-5" />
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 border-t border-slate-100 dark:border-slate-800 pt-2">
                {metric.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
