import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIrrigation } from '../context/IrrigationContext';
import { useSettings } from '../context/SettingsContext';
import {
  LayoutDashboard,
  Activity,
  LineChart,
  ToggleLeft,
  AlertTriangle,
  BarChart3,
  CloudSun,
  Cpu,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  Sun,
  Moon,
  RefreshCw,
  Info,
  ShieldAlert
} from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { pumpStatus, lastUpdated, deviceStatus, alerts, refreshData, emergencyStopped, resetEmergencyStop } = useIrrigation();
  const { darkMode, setDarkMode } = useSettings();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const activeAlertsCount = alerts.filter(a => a.active).length;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Sensor Monitoring', path: '/sensors', icon: Activity },
    { name: 'Real-Time Charts', path: '/charts', icon: LineChart },
    { name: 'Irrigation Control', path: '/control', icon: ToggleLeft },
    { name: 'Alerts', path: '/alerts', icon: AlertTriangle, badge: activeAlertsCount > 0 ? activeAlertsCount : null },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Weather Forecast', path: '/weather', icon: CloudSun },
    { name: 'Device Management', path: '/device', icon: Cpu },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-emerald-600 dark:text-emerald-400">
            <span className="bg-emerald-100 dark:bg-emerald-950 p-1.5 rounded-lg text-emerald-700 dark:text-emerald-300">🌿</span>
            <span className="tracking-tight hidden sm:inline">HydroSmart</span>
          </Link>

          {/* Collapsible toggle for Desktop */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 ml-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Top bar status and controls */}
        <div className="flex items-center gap-4">
          {/* Device online status */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 py-1 px-3 rounded-full text-xs font-medium">
            <span className={`w-2.5 h-2.5 rounded-full ${deviceStatus === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <span>Device {deviceStatus}</span>
            <span className="text-slate-400 dark:text-slate-500">|</span>
            <span className="text-slate-500 dark:text-slate-400">Updated: {lastUpdated}</span>
          </div>

          {/* Quick manual actions */}
          <button
            onClick={refreshData}
            title="Refresh Sensors"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 focus:outline-none"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle theme"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 focus:outline-none"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Alerts Notification dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 focus:outline-none"
            >
              <Bell className="w-5 h-5" />
              {activeAlertsCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-bounce">
                  {activeAlertsCount}
                </span>
              )}
            </button>

            {/* Notifications Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-semibold text-sm">Active Notifications</h3>
                  <Link to="/alerts" onClick={() => setNotificationsOpen(false)} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                    View All
                  </Link>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {activeAlertsCount === 0 ? (
                    <div className="px-4 py-6 text-center text-slate-400 dark:text-slate-500 text-sm">
                      No active alerts. All systems nominal!
                    </div>
                  ) : (
                    alerts.filter(a => a.active).map(alert => (
                      <div key={alert.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start gap-3 border-b border-slate-100 dark:border-slate-800/40 last:border-b-0">
                        <span className={`p-1 rounded-full mt-0.5 ${
                          alert.severity === 'danger' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' :
                          alert.severity === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                          'bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400'
                        }`}>
                          <Info className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <p className="text-xs font-semibold">{alert.type}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{alert.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick User Avatar */}
          <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
          </Link>
        </div>
      </header>

      {/* Emergency Alert Banner if Emergency Stopped */}
      {emergencyStopped && (
        <div className="bg-rose-600 text-white py-2.5 px-4 flex items-center justify-between text-sm font-medium z-30 animate-pulse">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>EMERGENCY STOP ACTIVE! Pumps forced OFF. Automatic irrigation suspended.</span>
          </div>
          <button
            onClick={resetEmergencyStop}
            className="bg-white text-rose-700 px-3 py-1 rounded-md text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            Reset Emergency
          </button>
        </div>
      )}

      {/* App Body Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Desktop) */}
        <aside className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}>
          {/* Sidebar Menu Items */}
          <nav className="flex-1 py-4 space-y-1 overflow-y-auto px-3">
            {menuItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center p-3 rounded-xl transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm border-l-4 border-emerald-500 pl-2'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  {!sidebarCollapsed && (
                    <span className="ml-3 text-sm flex-1">{item.name}</span>
                  )}
                  {!sidebarCollapsed && item.badge && (
                    <span className="ml-auto bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60">
            <button
              onClick={handleLogout}
              className="w-full flex items-center p-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-150"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Side Drawer Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            ></div>

            {/* Sidebar content */}
            <aside className="relative flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-850 h-full z-10 animate-in slide-in-from-left duration-200">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">🌿 HydroSmart Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1 overflow-y-auto px-3">
                {menuItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center p-3 rounded-xl transition-all duration-150 ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold border-l-4 border-emerald-500 pl-2'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="ml-3 text-sm flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-slate-200 dark:border-slate-850">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center p-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-150"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="ml-3 text-sm font-medium">Logout</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
