import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? saved === 'true' : false;
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

  const [language, setLanguage] = useState('English');
  
  const [thresholdValues, setThresholdValues] = useState({
    soilMoistureLow: 40,
    soilMoistureHigh: 75,
    tempHigh: 35,
    waterTankLow: 20
  });

  const [autoRefresh, setAutoRefresh] = useState('10s');
  const [units, setUnits] = useState('Metric'); // Metric (°C, Liters) or Imperial (°F, Gallons)
  const [weatherTheme, setWeatherTheme] = useState(() => {
    return localStorage.getItem('weatherTheme') || 'optimal';
  });

  // Toggle Dark Mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Toggle Weather Theme classes on document element
  useEffect(() => {
    document.documentElement.classList.remove('theme-sunny', 'theme-rainy', 'theme-optimal', 'theme-winter');
    document.body.classList.remove('theme-sunny', 'theme-rainy', 'theme-optimal', 'theme-winter');
    
    document.documentElement.classList.add(`theme-${weatherTheme}`);
    document.body.classList.add(`theme-${weatherTheme}`);
    localStorage.setItem('weatherTheme', weatherTheme);
  }, [weatherTheme]);

  const updateThresholds = (key, value) => {
    setThresholdValues(prev => ({
      ...prev,
      [key]: Number(value)
    }));
  };

  return (
    <SettingsContext.Provider value={{
      darkMode,
      setDarkMode,
      notifications,
      setNotifications,
      language,
      setLanguage,
      thresholdValues,
      setThresholdValues,
      updateThresholds,
      autoRefresh,
      setAutoRefresh,
      units,
      setUnits,
      weatherTheme,
      setWeatherTheme
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
