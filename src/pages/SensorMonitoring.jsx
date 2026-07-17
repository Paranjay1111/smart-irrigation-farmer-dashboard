import React from 'react';
import { useIrrigation } from '../context/IrrigationContext';
import {
  Waves,
  Thermometer,
  Droplet,
  Sun,
  CloudRain,
  TrendingDown,
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';

const SensorMonitoring = () => {
  const { sensors, refreshData } = useIrrigation();

  // Status computation for Light
  let lightStatus = 'Overcast';
  if (sensors.lightIntensity > 750) {
    lightStatus = 'Full Sun';
  } else if (sensors.lightIntensity > 400) {
    lightStatus = 'Partial Shade';
  } else if (sensors.lightIntensity > 150) {
    lightStatus = 'Cloudy';
  } else {
    lightStatus = 'Night / Low Light';
  }

  // Define sensors statistics
  const categories = [
    {
      title: 'Soil Moisture Sensor',
      description: 'Capacitive probe measuring volumetric water content at root zone.',
      icon: Waves,
      themeColor: 'emerald',
      stats: [
        { label: 'Current Reading', value: `${sensors.soilMoisture}%`, highlighted: true },
        { label: 'Minimum Today', value: '38%', subText: 'Recorded at 4:30 AM' },
        { label: 'Maximum Today', value: '65%', subText: 'Recorded at 6:45 PM' },
        { label: 'Average (7d)', value: '52%' }
      ]
    },
    {
      title: 'Temperature Sensor',
      description: 'SHT31 sensor detailing atmospheric ambient heat values.',
      icon: Thermometer,
      themeColor: 'amber',
      stats: [
        { label: 'Current Reading', value: `${sensors.temperature}°C`, highlighted: true },
        { label: 'Highest Today', value: '32.5°C', subText: 'Recorded at 2:15 PM' },
        { label: 'Lowest Today', value: '19.8°C', subText: 'Recorded at 5:12 AM' }
      ]
    },
    {
      title: 'Air Humidity Sensor',
      description: 'High-precision relative air humidity tracking module.',
      icon: Droplet,
      themeColor: 'blue',
      stats: [
        { label: 'Current Reading', value: `${sensors.humidity}%`, highlighted: true },
        { label: 'Average Today', value: '64%' },
        { label: 'Optimal Humidity', value: '60% - 75%' }
      ]
    },
    {
      title: 'Light Sensor',
      description: 'BH1750 ambient light sensor measuring solar irradiance.',
      icon: Sun,
      themeColor: 'yellow',
      stats: [
        { label: 'Sunlight Intensity', value: `${sensors.lightIntensity} Lux`, highlighted: true },
        { label: 'Current Status', value: lightStatus },
        { label: 'Light Exposure Today', value: '8.4 hrs' }
      ]
    },
    {
      title: 'Rain Sensor',
      description: 'Digital tipping-bucket type rainfall and precipitation sensor.',
      icon: CloudRain,
      themeColor: 'indigo',
      stats: [
        { label: 'Rain Detected', value: sensors.rain, highlighted: true },
        { label: 'Last Rain Event', value: 'Yesterday, 4:15 PM' },
        { label: 'Precipitation Volume', value: '0.0 mm/hr' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sensor Monitoring</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Detailed sensor readings, historical statistics, and individual telemetry diagnostic logs.
          </p>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
        >
          <Activity className="w-4 h-4" />
          Poll Sensors Now
        </button>
      </div>

      {/* Grid containing categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((category, idx) => {
          const Icon = category.icon;
          const isEmerald = category.themeColor === 'emerald';
          const isAmber = category.themeColor === 'amber';
          const isBlue = category.themeColor === 'blue';
          const isYellow = category.themeColor === 'yellow';
          const isIndigo = category.themeColor === 'indigo';
          
          let colorClass = '';
          let bgClass = '';
          if (isEmerald) { colorClass = 'text-emerald-500 border-emerald-200 dark:border-emerald-900/30'; bgClass = 'bg-emerald-50/50 dark:bg-emerald-950/20'; }
          if (isAmber) { colorClass = 'text-amber-500 border-amber-200 dark:border-amber-900/30'; bgClass = 'bg-amber-50/50 dark:bg-amber-950/20'; }
          if (isBlue) { colorClass = 'text-blue-500 border-blue-200 dark:border-blue-900/30'; bgClass = 'bg-blue-50/50 dark:bg-blue-950/20'; }
          if (isYellow) { colorClass = 'text-yellow-500 border-yellow-200 dark:border-yellow-900/30'; bgClass = 'bg-yellow-50/50 dark:bg-yellow-950/20'; }
          if (isIndigo) { colorClass = 'text-indigo-500 border-indigo-200 dark:border-indigo-900/30'; bgClass = 'bg-indigo-50/50 dark:bg-indigo-950/20'; }

          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`p-2.5 rounded-xl border ${colorClass} ${bgClass}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="font-bold text-lg">{category.title}</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
                  {category.description}
                </p>

                {/* Stat details layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                  {category.stats.map((stat, sIdx) => (
                    <div
                      key={sIdx}
                      className={`p-4 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between ${
                        stat.highlighted
                          ? 'col-span-1 sm:col-span-2 bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60'
                          : 'bg-transparent'
                      }`}
                    >
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{stat.label}</span>
                      <span className={`mt-1 font-bold ${stat.highlighted ? 'text-2xl text-emerald-600 dark:text-emerald-400' : 'text-base'}`}>
                        {stat.value}
                      </span>
                      {stat.subText && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{stat.subText}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock Diagnostic action */}
              <div className="mt-6 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-4 text-slate-400 dark:text-slate-500">
                <span>Last calibratated: 7 days ago</span>
                <button className="flex items-center gap-1 hover:text-emerald-500 font-semibold transition-colors">
                  Run Diagnostic
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SensorMonitoring;
