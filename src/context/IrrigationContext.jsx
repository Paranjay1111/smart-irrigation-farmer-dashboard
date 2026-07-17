import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const IrrigationContext = createContext();

export const useIrrigation = () => useContext(IrrigationContext);

export const IrrigationProvider = ({ children }) => {
  const [pumpStatus, setPumpStatus] = useState('ON');
  const [isAutomaticMode, setIsAutomaticMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('10:42:22 AM');
  const [deviceStatus, setDeviceStatus] = useState('Online');
  const [emergencyStopped, setEmergencyStopped] = useState(false);
  
  // Sensor states
  const [sensors, setSensors] = useState({
    temperature: 28,
    humidity: 68,
    soilMoisture: 55,
    rain: 'No',
    lightIntensity: 780,
    waterTank: 72,
    battery: 93,
  });

  // Alarm/Alert conditions
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'Soil Moisture Low', severity: 'warning', message: 'Soil moisture dropped below threshold (40%)', active: false },
    { id: 2, type: 'Temperature High', severity: 'warning', message: 'Ambient temperature exceeds 35°C', active: false },
    { id: 3, type: 'Device Offline', severity: 'danger', message: 'ESP32 controller failed to send heartbeat', active: false },
    { id: 4, type: 'Rain Detected', severity: 'info', message: 'Rain sensor active. Irrigation paused.', active: false },
    { id: 5, type: 'Water Tank Empty', severity: 'danger', message: 'Water levels critically low (< 20%)', active: false },
    { id: 6, type: 'Battery Low', severity: 'warning', message: 'Backup battery power below 15%', active: false },
  ]);

  const [alertHistory, setAlertHistory] = useState([
    { id: 1, date: '2026-07-17 08:15:22', type: 'Soil Moisture Low', status: 'Resolved', severity: 'warning' },
    { id: 2, date: '2026-07-17 09:20:11', type: 'Rain Detected', status: 'Active', severity: 'info' },
    { id: 3, date: '2026-07-16 14:05:43', type: 'Temperature High', status: 'Resolved', severity: 'warning' },
    { id: 4, date: '2026-07-16 22:30:00', type: 'Device Offline', status: 'Resolved', severity: 'danger' },
    { id: 5, date: '2026-07-15 11:12:09', type: 'Water Tank Empty', status: 'Resolved', severity: 'danger' },
  ]);

  // Schedules
  const [schedules, setSchedules] = useState([
    { id: 1, time: '06:00 AM', duration: '10 Minutes', enabled: true },
    { id: 2, time: '06:00 PM', duration: '15 Minutes', enabled: true },
  ]);

  // Auto Refresh Interval
  const refreshIntervalRef = useRef(null);

  // Simulation of sensor data changes on refresh or timer
  const refreshData = () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastUpdated(timeNow);
    
    // Simulate slight fluctuations in sensor values
    setSensors(prev => {
      const tempDiff = (Math.random() - 0.5) * 2;
      const moistDiff = (Math.random() - 0.5) * 4;
      const humidDiff = (Math.random() - 0.5) * 3;
      const batteryDiff = -0.1; // slowly depletes
      
      const newTemp = Math.min(Math.max(Math.round((prev.temperature + tempDiff) * 10) / 10, 15), 45);
      const newMoist = Math.min(Math.max(Math.round(prev.soilMoisture + moistDiff), 10), 100);
      const newHumid = Math.min(Math.max(Math.round(prev.humidity + humidDiff), 20), 95);
      const newBattery = Math.min(Math.max(Math.round((prev.battery + batteryDiff) * 10) / 10, 0), 100);
      
      // Update alerts based on new values
      setAlerts(currAlerts => currAlerts.map(alert => {
        if (alert.type === 'Soil Moisture Low') {
          return { ...alert, active: newMoist < 40 };
        }
        if (alert.type === 'Temperature High') {
          return { ...alert, active: newTemp > 35 };
        }
        if (alert.type === 'Battery Low') {
          return { ...alert, active: newBattery < 20 };
        }
        return alert;
      }));

      // Simulate automatic irrigation pump control if in automatic mode
      if (isAutomaticMode && !emergencyStopped) {
        if (newMoist < 40 && pumpStatus === 'OFF') {
          setPumpStatus('ON');
        } else if (newMoist > 75 && pumpStatus === 'ON') {
          setPumpStatus('OFF');
        }
      }

      return {
        ...prev,
        temperature: newTemp,
        soilMoisture: newMoist,
        humidity: newHumid,
        battery: newBattery,
        lightIntensity: Math.min(Math.max(prev.lightIntensity + Math.round((Math.random() - 0.5) * 50), 100), 1200),
      };
    });
  };

  // Trigger auto refresh
  useEffect(() => {
    // Clear existing
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    
    // Refresh interval of 10s
    refreshIntervalRef.current = setInterval(refreshData, 10000);
    
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [isAutomaticMode, pumpStatus, emergencyStopped]);

  const emergencyStop = () => {
    setPumpStatus('OFF');
    setIsAutomaticMode(false);
    setEmergencyStopped(true);
    
    // Add warning alert
    setAlerts(currAlerts => currAlerts.map(alert => {
      if (alert.type === 'Device Offline') {
        // Just hijack it or log custom behavior
        return alert;
      }
      return alert;
    }));

    // Add to history
    const dateNow = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setAlertHistory(prev => [
      {
        id: Date.now(),
        date: dateNow,
        type: 'Emergency Stop Activated',
        status: 'Active',
        severity: 'danger'
      },
      ...prev
    ]);
  };

  const resetEmergencyStop = () => {
    setEmergencyStopped(false);
  };

  const addSchedule = (time, duration) => {
    setSchedules(prev => [
      ...prev,
      { id: Date.now(), time, duration, enabled: true }
    ]);
  };

  const removeSchedule = (id) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const toggleSchedule = (id) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const toggleAlert = (type, activeState) => {
    setAlerts(prev => prev.map(alert => alert.type === type ? { ...alert, active: activeState } : alert));
    
    if (activeState) {
      const dateNow = new Date().toISOString().replace('T', ' ').substring(0, 19);
      setAlertHistory(prevHistory => [
        {
          id: Date.now(),
          date: dateNow,
          type: type,
          status: 'Active',
          severity: alerts.find(a => a.type === type)?.severity || 'warning'
        },
        ...prevHistory
      ]);
    } else {
      // Resolve it in history
      setAlertHistory(prevHistory => prevHistory.map(h => h.type === type && h.status === 'Active' ? { ...h, status: 'Resolved' } : h));
    }
  };

  const clearAlertHistory = () => {
    setAlertHistory([]);
  };

  return (
    <IrrigationContext.Provider value={{
      pumpStatus,
      setPumpStatus,
      isAutomaticMode,
      setIsAutomaticMode,
      lastUpdated,
      deviceStatus,
      setDeviceStatus,
      sensors,
      setSensors,
      alerts,
      setAlerts,
      alertHistory,
      setAlertHistory,
      schedules,
      addSchedule,
      removeSchedule,
      toggleSchedule,
      refreshData,
      emergencyStop,
      emergencyStopped,
      resetEmergencyStop,
      toggleAlert,
      clearAlertHistory
    }}>
      {children}
    </IrrigationContext.Provider>
  );
};
