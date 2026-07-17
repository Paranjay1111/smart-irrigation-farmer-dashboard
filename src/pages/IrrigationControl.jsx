import React, { useState } from 'react';
import { useIrrigation } from '../context/IrrigationContext';
import {
  ToggleLeft,
  Activity,
  Calendar,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  Play,
  Square,
  Sparkles
} from 'lucide-react';

const IrrigationControl = () => {
  const {
    pumpStatus,
    setPumpStatus,
    isAutomaticMode,
    setIsAutomaticMode,
    schedules,
    addSchedule,
    removeSchedule,
    toggleSchedule,
    sensors,
    emergencyStopped
  } = useIrrigation();

  // Local state for adding a new schedule
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newDuration, setNewDuration] = useState('10 Minutes');
  const [showAddForm, setShowAddForm] = useState(false);

  // Threshold editing states (simulated values)
  const [moistureThreshold, setMoistureThreshold] = useState(40);
  const [startThreshold, setStartThreshold] = useState(40);
  const [stopThreshold, setStopThreshold] = useState(75);

  const handleAddScheduleSubmit = (e) => {
    e.preventDefault();
    if (!newTime || !newDuration) return;
    addSchedule(newTime, newDuration);
    setNewTime('08:00 AM');
    setNewDuration('10 Minutes');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Irrigation Control</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Toggle manual override pump operations, establish automatic soil moisture triggers, and manage cron schedules.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-4 py-2 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Mode: {isAutomaticMode ? 'Automatic (Smart)' : 'Manual Override'}</span>
        </div>
      </div>

      {/* Main Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. MANUAL MODE CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <span className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl">
                <ToggleLeft className="w-4.5 h-4.5" />
              </span>
              <h3 className="font-bold text-base">Manual Operations</h3>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Forcing pump operations will override automatic moisture thresholds and active schedules. Ideal for manual watering cycles or emergency system flushes.
            </p>

            {/* Status indicators */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-750 p-4 rounded-xl mb-6">
              <span className="text-xs font-semibold text-slate-400">Current Pump State</span>
              <span className={`text-sm font-bold flex items-center gap-1.5 ${
                pumpStatus === 'ON' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
              }`}>
                <span className={`w-2 h-2 rounded-full ${pumpStatus === 'ON' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                {pumpStatus}
              </span>
            </div>

            {/* Command Trigger */}
            <div className="space-y-3">
              <button
                onClick={() => !emergencyStopped && setPumpStatus('ON')}
                disabled={pumpStatus === 'ON' || isAutomaticMode || emergencyStopped}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Force Turn Pump ON
              </button>
              
              <button
                onClick={() => !emergencyStopped && setPumpStatus('OFF')}
                disabled={pumpStatus === 'OFF' || isAutomaticMode || emergencyStopped}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                Force Turn Pump OFF
              </button>
            </div>
          </div>

          {isAutomaticMode && (
            <p className="text-[11px] text-amber-500 font-medium flex items-center gap-1.5 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Disable Automatic mode to enable manual command controls.</span>
            </p>
          )}
        </div>

        {/* 2. AUTOMATIC MODE CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                  <Activity className="w-4.5 h-4.5" />
                </span>
                <h3 className="font-bold text-base">Automatic Mode</h3>
              </div>

              {/* Mode Toggle Slider */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAutomaticMode}
                  onChange={(e) => setIsAutomaticMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-650 peer-checked:bg-emerald-600 rounded-full"></div>
              </label>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Smart sensors monitor real-time soil moisture and kick start the pumps to maintain optimal agricultural conditions automatically.
            </p>

            {/* Threshold Adjustments */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                  <span>Soil Moisture Threshold</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{moistureThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={moistureThreshold}
                  onChange={(e) => {
                    setMoistureThreshold(Number(e.target.value));
                    setStartThreshold(Number(e.target.value));
                  }}
                  disabled={!isAutomaticMode}
                  className="w-full accent-emerald-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-750 rounded-xl">
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">Start Pump</span>
                  <span className="text-sm font-bold mt-1 block">Below {startThreshold}%</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-750 rounded-xl">
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase">Stop Pump</span>
                  <span className="text-sm font-bold mt-1 block">Above {stopThreshold}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
            Current Soil moisture reading: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{sensors.soilMoisture}%</span>
          </div>
        </div>

        {/* 3. SCHEDULING CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
                <Calendar className="w-4.5 h-4.5" />
              </span>
              <h3 className="font-bold text-base">Irrigation Schedules</h3>
            </div>
            
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20 hover:opacity-80 focus:outline-none"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add schedule form */}
          {showAddForm && (
            <form onSubmit={handleAddScheduleSubmit} className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-755 rounded-xl space-y-3 animate-in slide-in-from-top duration-150">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 06:00 AM"
                    className="w-full text-xs p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="e.g. 10 Minutes"
                    className="w-full text-xs p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Save Schedule
              </button>
            </form>
          )}

          {/* List of Schedules */}
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`p-4 border rounded-xl flex items-center justify-between transition-all ${
                  schedule.enabled
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/65'
                    : 'bg-transparent border-slate-100 dark:border-slate-850 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${schedule.enabled ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">{schedule.time}</span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-400 font-medium">Duration: {schedule.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Enabled switch */}
                  <label className="relative inline-flex items-center cursor-pointer scale-75 select-none">
                    <input
                      type="checkbox"
                      checked={schedule.enabled}
                      onChange={() => toggleSchedule(schedule.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-650 peer-checked:bg-indigo-650 rounded-full"></div>
                  </label>

                  {/* Delete button (only show delete if it is not default schedules 6am/6pm) */}
                  {schedule.id !== 1 && schedule.id !== 2 && (
                    <button
                      onClick={() => removeSchedule(schedule.id)}
                      className="p-1 text-slate-450 hover:text-rose-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default IrrigationControl;
