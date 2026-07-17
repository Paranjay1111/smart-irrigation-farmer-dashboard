import React, { useState } from 'react';
import { useIrrigation } from '../context/IrrigationContext';
import {
  BellRing,
  AlertTriangle,
  Flame,
  WifiOff,
  CloudRain,
  Container,
  BatteryWarning,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Trash2
} from 'lucide-react';

const Alerts = () => {
  const {
    alerts,
    alertHistory,
    toggleAlert,
    clearAlertHistory
  } = useIrrigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Define icon map for the 6 alert cards
  const alertIconMap = {
    'Soil Moisture Low': { icon: AlertTriangle, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30' },
    'Temperature High': { icon: Flame, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30' },
    'Device Offline': { icon: WifiOff, color: 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 font-bold' },
    'Rain Detected': { icon: CloudRain, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/30' },
    'Water Tank Empty': { icon: Container, color: 'text-red-600 bg-rose-100/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/40' },
    'Battery Low': { icon: BatteryWarning, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900/30' }
  };

  const filteredHistory = alertHistory.filter(item => {
    const matchesSearch = item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Alerts</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Toggle simulations to trigger alarms, review active telemetry warnings, and inspect historical audit events.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 px-4 py-2 rounded-xl text-rose-600 dark:text-rose-450 text-sm font-semibold">
          <BellRing className="w-4 h-4 animate-swing" />
          <span>{alerts.filter(a => a.active).length} Active Alerts</span>
        </div>
      </div>

      {/* 6 core alert cards (Interactive Simulation!) */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Alarm Trigger Simulator</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert) => {
            const mapped = alertIconMap[alert.type] || { icon: AlertTriangle, color: 'text-slate-500' };
            const Icon = mapped.icon;
            
            return (
              <div
                key={alert.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                  alert.active
                    ? 'border-rose-500 dark:border-rose-800 ring-2 ring-rose-500/10'
                    : 'border-slate-200/60 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`p-2 rounded-xl border ${mapped.color}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      alert.active
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                    }`}>
                      {alert.active ? 'Active' : 'Offline'}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-sm">{alert.type}</h3>
                  <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1 leading-relaxed">
                    {alert.message}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">Type: Telemetry</span>
                  
                  {/* Simulate Switch */}
                  <button
                    onClick={() => toggleAlert(alert.type, !alert.active)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      alert.active
                        ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-650 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-650 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350'
                    }`}
                  >
                    {alert.active ? 'Force Resolve' : 'Simulate Trigger'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ALERT HISTORY TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="font-bold text-base">Alert History Log</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search history..."
                className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-0 focus:outline-none pr-4 text-xs font-semibold py-0.5 cursor-pointer dark:text-white"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Clear History */}
            <button
              onClick={clearAlertHistory}
              title="Clear logs"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 dark:hover:bg-slate-800 hover:bg-slate-50 focus:outline-none"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase font-semibold">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Alert Type</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No historical logs found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-350" />
                      {item.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                      {item.type}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.severity === 'danger' ? 'bg-rose-105 text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400' :
                        item.severity === 'warning' ? 'bg-amber-105 text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400' :
                        'bg-sky-105 text-sky-600 bg-sky-50 dark:bg-sky-950/30 dark:text-sky-400'
                      }`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        item.status === 'Active' ? 'text-rose-600 dark:text-rose-450' : 'text-emerald-600 dark:text-emerald-450'
                      }`}>
                        {item.status === 'Active' ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Active
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Resolved
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
