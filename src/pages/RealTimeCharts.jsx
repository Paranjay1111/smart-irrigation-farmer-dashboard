import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useIrrigation } from '../context/IrrigationContext';
import { useSettings } from '../context/SettingsContext';
import { LineChart, BarChart3, Thermometer, Waves, Droplet, RefreshCw } from 'lucide-react';

const RealTimeCharts = () => {
  const { sensors, refreshData } = useIrrigation();
  const { darkMode } = useSettings();

  // Selected time interval for Soil Moisture graph: 'hourly' | 'daily' | 'weekly' | 'monthly'
  const [moistureTab, setMoistureTab] = useState('hourly');

  // Chart configuration constants based on theme
  const gridColor = darkMode ? '#1e293b' : '#e2e8f0';
  const labelColor = darkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = darkMode ? '#0f172a' : '#ffffff';
  const tooltipBorder = darkMode ? '#1e293b' : '#e2e8f0';

  // 1. Temperature Mock Data (Hourly trend)
  const temperatureData = [
    { time: '08:00 AM', Temp: 22 },
    { time: '10:00 AM', Temp: 24 },
    { time: '12:00 PM', Temp: 28 },
    { time: '02:00 PM', Temp: 31 },
    { time: '04:00 PM', Temp: 30 },
    { time: '06:00 PM', Temp: 27 },
    { time: '08:00 PM', Temp: 25 },
    { time: '10:00 PM', Temp: 23 },
    { time: '12:00 AM', Temp: 21 },
  ];

  // 2. Soil Moisture Mock Data sets
  const moistureData = {
    hourly: [
      { label: '08:00 AM', Moisture: 52 },
      { label: '10:00 AM', Moisture: 51 },
      { label: '12:00 PM', Moisture: 48 },
      { label: '02:00 PM', Moisture: 44 },
      { label: '04:05 PM', Moisture: 72 }, // Pump kicked in here!
      { label: '06:00 PM', Moisture: 68 },
      { label: '08:00 PM', Moisture: 62 },
      { label: '10:00 PM', Moisture: 58 },
      { label: '12:00 AM', Moisture: 55 },
    ],
    daily: [
      { label: 'Mon', Moisture: 55 },
      { label: 'Tue', Moisture: 49 },
      { label: 'Wed', Moisture: 63 }, // Irrigated
      { label: 'Thu', Moisture: 58 },
      { label: 'Fri', Moisture: 52 },
      { label: 'Sat', Moisture: 45 },
      { label: 'Sun', Moisture: 61 }, // Irrigated
    ],
    weekly: [
      { label: 'Week 1', Moisture: 58 },
      { label: 'Week 2', Moisture: 53 },
      { label: 'Week 3', Moisture: 61 },
      { label: 'Week 4', Moisture: 56 },
    ],
    monthly: [
      { label: 'Jan', Moisture: 58 },
      { label: 'Feb', Moisture: 62 },
      { label: 'Mar', Moisture: 55 },
      { label: 'Apr', Moisture: 50 },
      { label: 'May', Moisture: 48 },
      { label: 'Jun', Moisture: 53 },
      { label: 'Jul', Moisture: 55 }, // Current month
    ]
  };

  // 3. Water Consumption Data: Today, Yesterday, Monthly (we'll break monthly down or group them)
  const consumptionData = [
    { name: 'Today', Liters: 450, Average: 400 },
    { name: 'Yesterday', Liters: 620, Average: 400 },
    { name: 'Monthly Avg', Liters: 550, Average: 400 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Real-Time Charts</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Visual analytical summaries for sensor telemetry trends and resource utilization.
          </p>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Update Live Trends
        </button>
      </div>

      {/* Main Charts grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Soil Moisture Graphs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                  <Waves className="w-4.5 h-4.5" />
                </span>
                <h3 className="font-bold text-base">Soil Moisture Analysis</h3>
              </div>

              {/* Interval tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
                {['hourly', 'daily', 'weekly', 'monthly'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMoistureTab(tab)}
                    className={`px-3 py-1.5 rounded-lg transition-all capitalize cursor-pointer ${
                      moistureTab === tab
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moistureData[moistureTab]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="label" stroke={labelColor} fontSize={11} tickLine={false} />
                  <YAxis stroke={labelColor} fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px' }}
                    labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Moisture"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#moistureGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
            Current Soil Moisture level: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{sensors.soilMoisture}%</span>
          </div>
        </div>

        {/* 2. Temperature Graphs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <span className="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-500 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                <Thermometer className="w-4.5 h-4.5" />
              </span>
              <h3 className="font-bold text-base">Ambient Air Temperature Trend</h3>
            </div>

            {/* Chart Area */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={temperatureData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="time" stroke={labelColor} fontSize={10} tickLine={false} />
                  <YAxis stroke={labelColor} fontSize={11} tickLine={false} domain={[10, 45]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px' }}
                    labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Temp"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#tempGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
            Current Air Temperature level: <span className="font-semibold text-amber-600 dark:text-amber-500">{sensors.temperature}°C</span>
          </div>
        </div>

        {/* 3. Water Consumption Graph */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-6">
            <span className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-500 border border-blue-100 dark:border-blue-900/30 rounded-xl">
              <BarChart3 className="w-4.5 h-4.5" />
            </span>
            <div>
              <h3 className="font-bold text-base">Water Consumption Volume</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Liters consumed today, yesterday and monthly comparison average.</p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={labelColor} fontSize={11} tickLine={false} />
                <YAxis stroke={labelColor} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px' }}
                  labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', pt: 10 }} />
                <Bar dataKey="Liters" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} name="Consumed Liters" />
                <Bar dataKey="Average" fill="#94a3b8" radius={[6, 6, 0, 0]} barSize={40} name="Optimal Baseline" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RealTimeCharts;
