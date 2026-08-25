import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('jarvis_sound') !== 'false';
  });
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('jarvis_theme') || 'dark';
  });

  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('jarvis_api_key') || '';
  });

  useEffect(() => {
    localStorage.setItem('jarvis_sound', soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('jarvis_theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('jarvis_api_key', apiKey);
  }, [apiKey]);

  const toggleSound = () => setSoundEnabled(!soundEnabled);
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <SettingsContext.Provider value={{ soundEnabled, toggleSound, theme, toggleTheme, apiKey, setApiKey }}>
      {children}
    </SettingsContext.Provider>
  );
};
