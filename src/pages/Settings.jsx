import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Bell,
  Languages,
  Sliders,
  RefreshCw,
  Scale,
  Save,
  CheckCircle
} from 'lucide-react';

const Settings = () => {
  const {
    darkMode,
    setDarkMode,
    notifications,
    setNotifications,
    language,
    setLanguage,
    thresholdValues,
    setThresholdValues,
    autoRefresh,
    setAutoRefresh,
    units,
    setUnits,
    weatherTheme,
    setWeatherTheme
  } = useSettings();

  // Local notifications states
  const [emailNotif, setEmailNotif] = useState(notifications.email);
  const [pushNotif, setPushNotif] = useState(notifications.push);
  const [smsNotif, setSmsNotif] = useState(notifications.sms);

  // Local threshold states
  const [moistureLow, setMoistureLow] = useState(thresholdValues.soilMoistureLow);
  const [moistureHigh, setMoistureHigh] = useState(thresholdValues.soilMoistureHigh);
  const [tempHigh, setTempHigh] = useState(thresholdValues.tempHigh);
  const [waterLow, setWaterLow] = useState(thresholdValues.waterTankLow);

  // Status indicator
  const [success, setSuccess] = useState('');

  const handleSave = (e) => {
    e.preventDefault();

    // Commit back to SettingsContext
    setNotifications({ email: emailNotif, push: pushNotif, sms: smsNotif });
    setThresholdValues({
      soilMoistureLow: moistureLow,
      soilMoistureHigh: moistureHigh,
      tempHigh: tempHigh,
      waterTankLow: waterLow
    });

    setSuccess('Settings saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Customize application accessibility styling, notification delivery configurations, and telemetry limits.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-450 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. VISUAL & ACCESSIBILITY SETTINGS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <SettingsIcon className="w-4.5 h-4.5 text-emerald-500" />
            General Preferences
          </h3>

          {/* Dark Mode Theme */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold block">App Interface Theme</span>
              <span className="text-[11px] text-slate-450 dark:text-slate-400">Toggle between Light and Dark visual theme formats.</span>
            </div>
            
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 rounded-xl text-xs font-semibold cursor-pointer"
            >
              {darkMode ? (
                <>
                  <Moon className="w-4 h-4 text-sky-450" />
                  Dark Mode Active
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  Light Mode Active
                </>
              )}
            </button>
          </div>

          {/* Weather-Based Theme */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold block">Weather-Based Theme</span>
              <span className="text-[11px] text-slate-450 dark:text-slate-400">Match colors to current or simulated weather patterns.</span>
            </div>
            
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs">
              <Sun className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <select
                value={weatherTheme}
                onChange={(e) => setWeatherTheme(e.target.value)}
                className="bg-transparent border-0 focus:outline-none pr-3 text-xs font-semibold cursor-pointer dark:text-white"
              >
                <option value="optimal">Optimal Spring (Green)</option>
                <option value="sunny">Sunny / Dry (Amber)</option>
                <option value="rainy">Rainy / Overcast (Indigo)</option>
                <option value="winter">Winter / Frost (Cyan)</option>
              </select>
            </div>
          </div>

          {/* System Language */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold block">Preferred Language</span>
              <span className="text-[11px] text-slate-455 dark:text-slate-400">Configure language vocabulary settings.</span>
            </div>
            
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs">
              <Languages className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border-0 focus:outline-none pr-3 text-xs font-semibold cursor-pointer dark:text-white"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>

          {/* Units Selection */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold block">Telemetry Metric Units</span>
              <span className="text-[11px] text-slate-455 dark:text-slate-400">Standard Metric (°C, Liters) or Imperial (°F, Gallons).</span>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl text-xs font-semibold border border-slate-200/50 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setUnits('Metric')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  units === 'Metric'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-450 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Metric
              </button>
              <button
                type="button"
                onClick={() => setUnits('Imperial')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  units === 'Imperial'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-450 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Imperial
              </button>
            </div>
          </div>

          {/* Auto Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold block">Auto Refresh Interval</span>
              <span className="text-[11px] text-slate-455 dark:text-slate-400">Telemetry sensor update timer frequency.</span>
            </div>
            
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs">
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <select
                value={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.value)}
                className="bg-transparent border-0 focus:outline-none pr-3 text-xs font-semibold cursor-pointer dark:text-white"
              >
                <option value="10s">10 Seconds</option>
                <option value="30s">30 Seconds</option>
                <option value="60s">60 Seconds</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. NOTIFICATIONS SETTINGS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-emerald-500" />
            Alert Notification Channels
          </h3>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold block">Email Summaries</span>
                <span className="text-[11px] text-slate-450 dark:text-slate-400">Receive weekly reports and critical hardware alarms.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={emailNotif}
                  onChange={(e) => setEmailNotif(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-650 peer-checked:bg-emerald-600 rounded-full"></div>
              </label>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold block">Push Notifications</span>
                <span className="text-[11px] text-slate-450 dark:text-slate-400">Immediate warnings directly on your browser interface.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pushNotif}
                  onChange={(e) => setPushNotif(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-650 peer-checked:bg-emerald-600 rounded-full"></div>
              </label>
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold block">SMS Alerts (Emergency Only)</span>
                <span className="text-[11px] text-slate-450 dark:text-slate-400">Text messaging alerts during critical water losses.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={smsNotif}
                  onChange={(e) => setSMSNotif ? setSMSNotif(e.target.checked) : setSmsNotif(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-650 peer-checked:bg-emerald-600 rounded-full"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 3. THRESHOLD ADJUSTMENTS LIMITS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 lg:col-span-2">
          <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Sliders className="w-4.5 h-4.5 text-emerald-500" />
            Device Threshold Triggers
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Soil Moisture Low Threshold */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>Moisture Alarm Low Limit</span>
                <span className="text-rose-500 font-bold">{moistureLow}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="50"
                value={moistureLow}
                onChange={(e) => setMoistureLow(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Soil Moisture High Threshold */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>Moisture Stop Limit</span>
                <span className="text-emerald-500 font-bold">{moistureHigh}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="90"
                value={moistureHigh}
                onChange={(e) => setMoistureHigh(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Temperature Max Threshold */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>Max Ambient Temperature Warning</span>
                <span className="text-rose-500 font-bold">{tempHigh}°C</span>
              </div>
              <input
                type="range"
                min="30"
                max="45"
                value={tempHigh}
                onChange={(e) => setTempHigh(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Water Tank Minimum */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>Min Water Reservoir Limit</span>
                <span className="text-rose-600 font-bold">{waterLow}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="30"
                value={waterLow}
                onChange={(e) => setWaterLow(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

          </div>
        </div>

        {/* Form Action Save footer */}
        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/10 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Configuration Changes
          </button>
        </div>

      </form>
    </div>
  );
};

export default Settings;
