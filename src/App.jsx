import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { IrrigationProvider } from './context/IrrigationContext';
import Layout from './components/Layout';

// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import SensorMonitoring from './pages/SensorMonitoring';
import RealTimeCharts from './pages/RealTimeCharts';
import IrrigationControl from './pages/IrrigationControl';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import WeatherForecast from './pages/WeatherForecast';
import DeviceManagement from './pages/DeviceManagement';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Icons for modal
import { Clock, ShieldAlert } from 'lucide-react';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Main App Container with Router context
const AppContent = () => {
  const { isAuthenticated, showTimeoutModal, extendSession, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/forgot-password" element={<Auth />} />
        <Route path="/reset-password" element={<Auth />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sensors"
          element={
            <ProtectedRoute>
              <Layout>
                <SensorMonitoring />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/charts"
          element={
            <ProtectedRoute>
              <Layout>
                <RealTimeCharts />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/control"
          element={
            <ProtectedRoute>
              <Layout>
                <IrrigationControl />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Layout>
                <Alerts />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/weather"
          element={
            <ProtectedRoute>
              <Layout>
                <WeatherForecast />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/device"
          element={
            <ProtectedRoute>
              <Layout>
                <DeviceManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Global Session Timeout Notification Modal */}
      {isAuthenticated && showTimeoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 rounded-2xl shadow-xl text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="bg-amber-100 dark:bg-amber-955/20 p-3 rounded-full text-amber-600 dark:text-amber-400 w-fit mx-auto">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="font-bold text-base">Inactivity Timeout Warning</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your farmer portal session is about to expire due to 2 minutes of inactivity. Would you like to extend your session?
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={logout}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-250 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Log Out
              </button>
              <button
                onClick={extendSession}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/10 cursor-pointer"
              >
                Extend Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <IrrigationProvider>
            <AppContent />
          </IrrigationProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
