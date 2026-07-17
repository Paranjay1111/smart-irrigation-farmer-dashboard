import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileDown,
  Download,
  Calendar,
  Search,
  CheckCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  Droplets,
  AlertOctagon
} from 'lucide-react';

const Reports = () => {
  const [downloading, setDownloading] = useState(null); // 'pdf' | 'excel' | 'csv' | null
  const [selectedMonth, setSelectedMonth] = useState('July 2026');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock report history logs
  const reportHistory = [
    { id: 1, name: 'Smart Irrigation Monthly Report - June 2026', date: '2026-07-01', size: '2.4 MB', type: 'Monthly Report' },
    { id: 2, name: 'Water Consumption Analysis - Q2 2026', date: '2026-07-01', size: '4.8 MB', type: 'Quarterly Summary' },
    { id: 3, name: 'Smart Irrigation Monthly Report - May 2026', date: '2026-06-01', size: '2.2 MB', type: 'Monthly Report' },
    { id: 4, name: 'Soil Telemetry Logging Data - May 2026', date: '2026-06-01', size: '12.6 MB', type: 'Raw Sensor Log' },
    { id: 5, name: 'Smart Irrigation Monthly Report - April 2026', date: '2026-05-01', size: '2.1 MB', type: 'Monthly Report' },
  ];

  // Mock metrics summary based on selected month
  const monthlySummaries = {
    'July 2026': { waterUsed: '15,420 Liters', efficiency: '94%', alerts: 2 },
    'June 2026': { waterUsed: '62,840 Liters', efficiency: '91%', alerts: 6 },
    'May 2026': { waterUsed: '58,400 Liters', efficiency: '92%', alerts: 4 },
  };

  const currentSummary = monthlySummaries[selectedMonth] || { waterUsed: '0 Liters', efficiency: '0%', alerts: 0 };

  const triggerDownloadSimulation = (format) => {
    setDownloading(format);

    // Simulate creation/compilation download latency
    setTimeout(() => {
      setDownloading(null);
      
      // Build mock download element to simulate browser save dialog
      const element = document.createElement('a');
      const fileText = `HydroSmart Irrigation Report\nMonth: ${selectedMonth}\nWater Used: ${currentSummary.waterUsed}\nEfficiency Score: ${currentSummary.efficiency}\nIncidents Logged: ${currentSummary.alerts}`;
      const file = new Blob([fileText], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `hydrosmart-report-${selectedMonth.toLowerCase().replace(' ', '-')}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1500);
  };

  const filteredHistory = reportHistory.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Generate custom data summaries, download CSV telemetry files, or export PDF farm efficiency sheets.
          </p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. QUICK DOWNLOAD PANEL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <FileDown className="w-4.5 h-4.5 text-emerald-500" />
              Download Current Data
            </h3>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Export farm telemetry stats including soil moistures, temperature metrics, and water log charts for the month of <strong className="text-slate-850 dark:text-white font-semibold">{selectedMonth}</strong>.
            </p>

            {/* Select Month Dropdown */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-755 p-3 rounded-xl mb-6 text-xs">
              <span className="font-semibold text-slate-400">Target Month</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-0 focus:outline-none pr-3 text-xs font-semibold cursor-pointer dark:text-white"
              >
                <option value="July 2026">July 2026</option>
                <option value="June 2026">June 2026</option>
                <option value="May 2026">May 2026</option>
              </select>
            </div>

            {/* Download Buttons Grid */}
            <div className="space-y-3">
              {/* PDF */}
              <button
                onClick={() => triggerDownloadSimulation('pdf')}
                disabled={downloading !== null}
                className="w-full flex items-center justify-between p-3.5 bg-rose-50/40 hover:bg-rose-50 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400">
                  <FileText className="w-4.5 h-4.5" />
                  Download PDF Report
                </span>
                {downloading === 'pdf' ? (
                  <span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Download className="w-4 h-4 text-rose-500" />
                )}
              </button>

              {/* Excel */}
              <button
                onClick={() => triggerDownloadSimulation('excel')}
                disabled={downloading !== null}
                className="w-full flex items-center justify-between p-3.5 bg-emerald-50/40 hover:bg-emerald-50 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-450">
                  <FileSpreadsheet className="w-4.5 h-4.5" />
                  Download Excel Spreadsheet
                </span>
                {downloading === 'excel' ? (
                  <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Download className="w-4 h-4 text-emerald-500" />
                )}
              </button>

              {/* CSV */}
              <button
                onClick={() => triggerDownloadSimulation('csv')}
                disabled={downloading !== null}
                className="w-full flex items-center justify-between p-3.5 bg-blue-50/40 hover:bg-blue-50 dark:bg-blue-950/10 dark:hover:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="flex items-center gap-2.5 text-blue-700 dark:text-blue-400">
                  <FileText className="w-4.5 h-4.5" />
                  Download CSV Data
                </span>
                {downloading === 'csv' ? (
                  <span className="w-4 h-4 border-2 border-blue-550 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Download className="w-4 h-4 text-blue-500" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-805/45 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 mt-6 flex gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Reports include complete timestamps, localized coordinates and calibration logs.</span>
          </div>
        </div>

        {/* 2. MONTHLY SUMMARY METRICS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base mb-6 flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-emerald-500" />
              Monthly Performance Summary
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-755 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-blue-105 dark:bg-blue-950/20 text-blue-500 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                    <Droplets className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Water Volume Used</span>
                </div>
                <span className="text-sm font-extrabold">{currentSummary.waterUsed}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-755 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-emerald-105 dark:bg-emerald-950/20 text-emerald-500 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">System Efficiency Score</span>
                </div>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-450">{currentSummary.efficiency}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-755 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-rose-105 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-900/30 rounded-lg">
                    <AlertOctagon className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">System Alarms Raised</span>
                </div>
                <span className={`text-sm font-extrabold ${currentSummary.alerts > 4 ? 'text-rose-550' : 'text-slate-700 dark:text-white'}`}>
                  {currentSummary.alerts}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            Summary calculations are generated relative to the selected target month.
          </div>
        </div>

        {/* 3. REPORT HISTORY TABLE */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="font-bold text-base">Archived Reports Library</h3>

            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search archived files..."
                className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-4">Creation Date</th>
                  <th className="py-3 px-4">Report Name</th>
                  <th className="py-3 px-4">Report Category</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 dark:text-slate-500">
                      No archived reports found.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-350" />
                        {report.date}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                        {report.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-550 dark:text-slate-400">
                        {report.type}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {report.size}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => triggerDownloadSimulation('pdf')}
                          className="flex items-center gap-1 text-emerald-600 dark:text-emerald-450 hover:underline font-bold"
                        >
                          Export
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
