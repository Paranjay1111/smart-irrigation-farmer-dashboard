import React from 'react';
import {
  CloudSun,
  CloudRain,
  Wind,
  Droplet,
  Compass,
  Calendar,
  AlertTriangle,
  Sun,
  CloudLightning
} from 'lucide-react';

const WeatherForecast = () => {
  // Weather information variables requested
  const todayTemp = 31;
  const tomorrowTemp = 29;
  const rainProb = 80;

  const weeklyForecast = [
    { day: 'Today', temp: `${todayTemp}°C`, rain: `${rainProb}%`, condition: 'Heavy Rain / Showers', icon: CloudRain, color: 'text-sky-500' },
    { day: 'Tomorrow', temp: `${tomorrowTemp}°C`, rain: '60%', condition: 'Scattered Showers', icon: CloudRain, color: 'text-blue-500' },
    { day: 'Sunday', temp: '28°C', rain: '20%', condition: 'Mostly Cloudy', icon: CloudSun, color: 'text-indigo-400' },
    { day: 'Monday', temp: '30°C', rain: '10%', condition: 'Sunny / Clear', icon: Sun, color: 'text-amber-500' },
    { day: 'Tuesday', temp: '32°C', rain: '5%', condition: 'Hot & Sunny', icon: Sun, color: 'text-yellow-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weather Forecast</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Local meteorology reports, precipitation predictions, and smart agricultural recommendation alerts.
          </p>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Forecast Main Glassmorphic Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-8 shadow-lg flex flex-col justify-between relative overflow-hidden">
          {/* Decorative weather pattern overlay */}
          <div className="absolute right-[-5%] top-[-5%] w-[45%] h-[45%] opacity-10 bg-white rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-blue-105 opacity-80">Local Weather Station</span>
                <h2 className="text-3xl font-black tracking-tight mt-1">Today</h2>
              </div>
              <CloudLightning className="w-16 h-16 text-sky-200 animate-bounce duration-[3000ms]" />
            </div>

            <div className="flex items-baseline gap-2 mt-8">
              <span className="text-7xl font-black tracking-tighter">{todayTemp}°C</span>
              <span className="text-sm font-semibold opacity-85">Scattered Storms</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-8 mt-12 relative z-10 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-white/10 rounded-lg"><CloudRain className="w-4 h-4 text-sky-300" /></span>
              <div>
                <span className="block opacity-75">Rain Chance</span>
                <span className="font-bold text-sm">{rainProb}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-white/10 rounded-lg"><Wind className="w-4 h-4 text-sky-300" /></span>
              <div>
                <span className="block opacity-75">Wind Speed</span>
                <span className="font-bold text-sm">18 km/h</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-white/10 rounded-lg"><Droplet className="w-4 h-4 text-sky-300" /></span>
              <div>
                <span className="block opacity-75">Humidity</span>
                <span className="font-bold text-sm">82%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Agricultural Recommendation/Advice card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-5 text-amber-600 dark:text-amber-450">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-bold text-sm">Smart Advisory Alert</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed space-y-3">
              Rain is highly probable within the next 24 hours (80% confidence level).
              <br />
              <br />
              <strong className="text-slate-850 dark:text-white font-semibold">System Action:</strong> The irrigation controller's automatic schedule has been put on hold to prevent root oversaturation and reduce water usage by approximately 800 liters.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-750 text-[11px] text-slate-500 dark:text-slate-400 mt-6">
            Recommended Soil target: <span className="font-semibold text-emerald-600">55% moisture</span>. Skip irrigation cycles until Sunday afternoon.
          </div>
        </div>

        {/* Weekly Weather Outlook List */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-base mb-6 flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-slate-400" />
            5-Day Meteorological Outlook
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {weeklyForecast.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className={`p-5 rounded-2xl border flex flex-col items-center justify-between text-center transition-all ${
                    i === 0
                      ? 'bg-blue-50/50 dark:bg-slate-800 border-blue-200 dark:border-slate-700 shadow-inner'
                      : 'bg-transparent border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850/20'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">{item.day}</span>
                  
                  <span className={`my-4 p-2 bg-slate-50 dark:bg-slate-800 rounded-full ${item.color}`}>
                    <Icon className="w-6 h-6 animate-pulse" />
                  </span>

                  <div>
                    <span className="block font-black text-lg text-slate-850 dark:text-white">{item.temp}</span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">{item.condition}</span>
                    <span className="block text-[10px] text-sky-600 dark:text-sky-400 font-bold mt-1.5">💧 {item.rain} Rain</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default WeatherForecast;
