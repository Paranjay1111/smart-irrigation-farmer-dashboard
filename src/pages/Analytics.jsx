import React, { useState } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';
import { useSettings } from '../context/SettingsContext';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Thermometer,
  Droplet,
  Waves,
  Clock,
  Zap,
  Activity,
  Droplets
} from 'lucide-react';

const Analytics = () => {
  const { darkMode } = useSettings();
  const [timeRange, setTimeRange] = useState('7d');

  // Chart styling constants
  const gridColor = darkMode ? '#1e293b' : '#e2e8f0';
  const labelColor = darkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = darkMode ? '#0f172a' : '#ffffff';
  const tooltipBorder = darkMode ? '#1e293b' : '#e2e8f0';

  // Mock data generator based on selected timeframe
  const getAnalyticsSummary = () => {
    switch (timeRange) {
      case '30d':
        return {
          avgTemp: '24.8°C',
          avgHumidity: '71.5%',
          avgMoisture: '56.2%',
          totalWater: '62,840 L',
          pumpTime: '112.4 hrs',
          electricity: '168.6 kWh',
          tempTrend: '-1.2%',
          waterTrend: '+5.4%',
          moistureTrend: '+2.1%',
          history: [
            { label: 'Week 1', Water: 14500, Moisture: 54, Temp: 26 },
            { label: 'Week 2', Water: 16200, Moisture: 58, Temp: 25 },
            { label: 'Week 3', Water: 15900, Moisture: 55, Temp: 24 },
            { label: 'Week 4', Water: 16240, Moisture: 57, Temp: 24 }
          ]
        };
      case '12m':
        return {
          avgTemp: '22.1°C',
          avgHumidity: '62.4%',
          avgMoisture: '50.1%',
          totalWater: '745,200 L',
          pumpTime: '1,324.8 hrs',
          electricity: '1,987.2 kWh',
          tempTrend: '+0.8%',
          waterTrend: '+12.3%',
          moistureTrend: '-4.2%',
          history: [
            { label: 'Q1', Water: 172000, Moisture: 52, Temp: 18 },
            { label: 'Q2', Water: 215000, Moisture: 48, Temp: 25 },
            { label: 'Q3', Water: 228000, Moisture: 51, Temp: 27 },
            { label: 'Q4', Water: 130200, Moisture: 53, Temp: 19 }
          ]
        };
      case '7d':
      default:
        return {
          avgTemp: '26.4°C',
          avgHumidity: '64.2%',
          avgMoisture: '53.8%',
          totalWater: '15,420 L',
          pumpTime: '28.5 hrs',
          electricity: '42.8 kWh',
          tempTrend: '+2.4%',
          waterTrend: '-3.1%',
          moistureTrend: '+1.5%',
          history: [
            { label: 'Mon', Water: 2200, Moisture: 54, Temp: 25 },
            { label: 'Tue', Water: 2100, Moisture: 52, Temp: 27 },
            { label: 'Wed', Water: 2400, Moisture: 56, Temp: 28 },
            { label: 'Thu', Water: 2000, Moisture: 53, Temp: 26 },
            { label: 'Fri', Water: 2300, Moisture: 55, Temp: 27 },
            { label: 'Sat', Water: 2150, Moisture: 54, Temp: 26 },
            { label: 'Sun', Water: 2270, Moisture: 55, Temp: 26 }
          ]
        };
    }
  };

  const data = getAnalyticsSummary();

  const statCards = [
    {
      title: 'Average Temperature',
      value: data.avgTemp,
      icon: Thermometer,
      trend: data.tempTrend,
      isPositive: data.tempTrend.startsWith('-'), // Decreasing temp might be positive/neutral
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30'
    },
    {
      title: 'Average Humidity',
      value: data.avgHumidity,
      icon: Droplet,
      trend: '+1.2%',
      isPositive: true,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30'
    },
    {
      title: 'Average Soil Moisture',
      value: data.avgMoisture,
      icon: Waves,
      trend: data.moistureTrend,
      isPositive: data.moistureTrend.startsWith('+'),
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30'
    },
    {
      title: 'Total Water Used',
      value: data.totalWater,
      icon: Droplets,
      trend: data.waterTrend,
      isPositive: data.waterTrend.startsWith('-'), // Less water used is good
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/30'
    },
    {
      title: 'Pump Running Time',
      value: data.pumpTime,
      icon: Clock,
      trend: '-4.5%',
      isPositive: true, // running less is energy efficient
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30'
    },
    {
      title: 'Electricity Used',
      value: data.electricity,
      icon: Zap,
      trend: '-4.2%',
      isPositive: true,
      color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/30'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Analyze historical agricultural telemetry, water consumption efficiency, and node electrical power metrics.
          </p>
        </div>

        {/* Timeframe Selectors */}
        <div className="flex bg-slate-105 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold self-start md:self-auto border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeRange === '7d'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-450 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeRange === '30d'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-450 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('12m')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeRange === '12m'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-450 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            Last 12 Months
          </button>
        </div>
      </div>

      {/* Grid of 6 statistic cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    {card.title}
                  </span>
                  <span className="text-2xl font-bold tracking-tight mt-2 block text-slate-900 dark:text-white">
                    {card.value}
                  </span>
                </div>
                <span className={`p-2.5 rounded-xl border ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </span>
              </div>

              {/* Trend line */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs">
                <span className={`inline-flex items-center gap-0.5 font-bold ${
                  card.isPositive ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-600 dark:text-rose-455'
                }`}>
                  {card.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {card.trend}
                </span>
                <span className="text-slate-400">vs previous period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Combined Analytics charts (Resource efficiency) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <span className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
            <Activity className="w-4.5 h-4.5" />
          </span>
          <div>
            <h3 className="font-bold text-base">Efficiency & Resource Consumption Correlation</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Moisture response trend mapped against overall volume of water utilized.</p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.history} margin={{ top: 15, right: -5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="label" stroke={labelColor} fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke={labelColor} fontSize={11} tickLine={false} label={{ value: 'Water (Liters)', angle: -90, position: 'insideLeft', offset: 10, fill: labelColor, fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" stroke={labelColor} fontSize={11} tickLine={false} label={{ value: 'Moisture (%)', angle: 90, position: 'insideRight', offset: 10, fill: labelColor, fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px' }}
                labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Bar yAxisId="left" dataKey="Water" fill="#3b82f6" opacity={0.85} radius={[4, 4, 0, 0]} barSize={35} name="Irrigation Volume" />
              <Line yAxisId="right" type="monotone" dataKey="Moisture" stroke="#10b981" strokeWidth={3} name="Rootzone Moisture" dot={{ stroke: '#10b981', strokeWidth: 2, r: 4, fill: tooltipBg }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
