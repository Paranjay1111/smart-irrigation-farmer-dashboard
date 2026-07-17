import React, { useState } from 'react';
import { useIrrigation } from '../context/IrrigationContext';
import {
  Cpu,
  RefreshCw,
  Power,
  Layers,
  Wifi,
  Clock,
  Database,
  ArrowUpCircle,
  Play,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const DeviceManagement = () => {
  const { deviceStatus, setDeviceStatus, lastUpdated, refreshData } = useIrrigation();

  // Firmware and stats local state (simulated)
  const [firmwareVersion, setFirmwareVersion] = useState('1.2.0');
  const [signalStrength, setSignalStrength] = useState('-68 dBm'); // RSSI
  const [ramUsage, setRamUsage] = useState('42%');
  const [uptime, setUptime] = useState('4 days, 12 hours');

  // Loader states
  const [modalType, setModalType] = useState(null); // 'restart' | 'update' | null
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(5);

  const triggerRestartSimulation = () => {
    setModalType('restart');
    setCountdown(5);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setModalType(null);
          refreshData();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerFirmwareUpdateSimulation = () => {
    if (firmwareVersion === '1.2.1') {
      alert('Firmware is already up to date!');
      return;
    }
    setModalType('update');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFirmwareVersion('1.2.1');
            setModalType(null);
            setProgress(0);
          }, 600);
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  const toggleConnectionSimulation = () => {
    if (deviceStatus === 'Online') {
      setDeviceStatus('Offline');
      setSignalStrength('N/A');
      setRamUsage('0%');
      setUptime('0 hrs');
    } else {
      setDeviceStatus('Online');
      setSignalStrength('-64 dBm');
      setRamUsage('38%');
      setUptime('1 minute');
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Device Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Perform hardware diagnoses, execute firmware upgrades, trigger controller restarts, or disconnect fields node.
          </p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. DEVICE METADATA CARD */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-base mb-6 flex items-center gap-2">
            <Cpu className="w-4.5 h-4.5 text-emerald-500" />
            ESP32 Node Hardware Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Device Name</span>
              <span className="text-sm font-bold mt-1.5 block">ESP32</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Device ID</span>
              <span className="text-sm font-bold mt-1.5 block">001</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">WiFi Strength (RSSI)</span>
              <span className="text-sm font-bold mt-1.5 block flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-emerald-500" />
                {signalStrength}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Firmware Build</span>
              <span className="text-sm font-bold mt-1.5 block flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-500" />
                v{firmwareVersion}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">RAM Allocation</span>
              <span className="text-sm font-bold mt-1.5 block flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-500" />
                {ramUsage}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">System Uptime</span>
              <span className="text-sm font-bold mt-1.5 block flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-500" />
                {uptime}
              </span>
            </div>
          </div>
        </div>

        {/* 2. ACTIONS COMMAND CENTER */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base mb-6 flex items-center gap-2">
              <Power className="w-4.5 h-4.5 text-slate-550" />
              Hardware Maintenance Controls
            </h3>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Select one of the actions below to send OTA firmware modifications, force power cycle boot instructions, or disable transmitter broadcasts.
            </p>

            <div className="space-y-3.5">
              {/* Update Firmware */}
              <button
                onClick={triggerFirmwareUpdateSimulation}
                disabled={deviceStatus === 'Offline'}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200/65 dark:border-slate-700/65 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
                  Update Firmware
                </span>
                <span className="text-[10px] text-slate-400">Build OTA</span>
              </button>

              {/* Restart Device */}
              <button
                onClick={triggerRestartSimulation}
                disabled={deviceStatus === 'Offline'}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200/65 dark:border-slate-700/65 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-sky-500" />
                  Restart Device
                </span>
                <span className="text-[10px] text-slate-400">Soft Boot</span>
              </button>

              {/* Disconnect/Connect Device */}
              <button
                onClick={toggleConnectionSimulation}
                className={`w-full flex items-center justify-between p-3.5 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  deviceStatus === 'Online'
                    ? 'bg-rose-50/50 hover:bg-rose-100 border-rose-200/60 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400'
                    : 'bg-emerald-50/50 hover:bg-emerald-100 border-emerald-200/60 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-450'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Power className="w-4 h-4" />
                  {deviceStatus === 'Online' ? 'Disconnect Device' : 'Connect Device'}
                </span>
                <span className="text-[10px] opacity-80">{deviceStatus === 'Online' ? 'Active' : 'Offline'}</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-805/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 mt-6 flex gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>ESP32 controller is currently transmitting packages. Next check scheduled in 10s.</span>
          </div>
        </div>

      </div>

      {/* POPUP SIMULATION MODALS */}
      {modalType === 'restart' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 rounded-2xl shadow-xl text-center space-y-4 animate-in zoom-in-95 duration-150">
            <RefreshCw className="w-12 h-12 text-sky-500 animate-spin mx-auto" />
            <h3 className="font-bold text-base">Rebooting ESP32 Controller</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Forcing a soft boot on ESP32 field node. Systems will temporarily go offline. Reconnecting in {countdown} seconds...
            </p>
          </div>
        </div>
      )}

      {modalType === 'update' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 rounded-2xl shadow-xl text-center space-y-4 animate-in zoom-in-95 duration-150">
            <ArrowUpCircle className="w-12 h-12 text-emerald-500 animate-bounce mx-auto" />
            <h3 className="font-bold text-base">Installing OTA Firmware Update</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Downloading and flashing build image...
            </p>
            <div className="w-full bg-slate-105 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-500 h-2.5 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-450">{progress}% Completed</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default DeviceManagement;
