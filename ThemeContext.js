import React, { createContext, useContext, useState, useMemo } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const THEME = {
  dark: {
    background: '#0A0E1A',
    backgroundSecondary: '#0F172A',
    surface: '#1E293B',
    surfaceElevated: '#2D3B52',
    surfaceSelected: 'rgba(99,102,241,0.25)',
    border: '#334155',
    borderLight: 'rgba(148, 163, 184, 0.1)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    accent: '#6366F1',
    accentLight: '#818CF8',
    accentDark: '#4F46E5',
    error: '#EF4444',
    errorLight: '#FCA5A5',
    success: '#10B981',
    successLight: '#6EE7B7',
    warning: '#F59E0B',
    warningLight: '#FCD34D',
    info: '#3B82F6',
    infoLight: '#93C5FD',
    purple: '#8B5CF6',
    purpleLight: '#C4B5FD',
    pink: '#EC4899',
    pinkLight: '#F9A8D4',
    teal: '#14B8A6',
    tealLight: '#5EEAD4',
    gradient1: ['#6366F1', '#8B5CF6'],
    gradient2: ['#10B981', '#059669'],
    gradient3: ['#F59E0B', '#EF4444'],
    gradient4: ['#EC4899', '#8B5CF6'],
    shadowColor: 'rgba(0, 0, 0, 0.5)',
  },
  light: {
    background: '#F8FAFC',
    backgroundSecondary: '#F1F5F9',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceSelected: 'rgba(99,102,241,0.15)',
    border: '#E2E8F0',
    borderLight: 'rgba(148, 163, 184, 0.2)',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    accent: '#6366F1',
    accentLight: '#818CF8',
    accentDark: '#4F46E5',
    error: '#DC2626',
    errorLight: '#FCA5A5',
    success: '#059669',
    successLight: '#6EE7B7',
    warning: '#D97706',
    warningLight: '#FCD34D',
    info: '#2563EB',
    infoLight: '#93C5FD',
    purple: '#7C3AED',
    purpleLight: '#C4B5FD',
    pink: '#DB2777',
    pinkLight: '#F9A8D4',
    teal: '#0D9488',
    tealLight: '#5EEAD4',
    gradient1: ['#6366F1', '#8B5CF6'],
    gradient2: ['#10B981', '#059669'],
    gradient3: ['#F59E0B', '#EF4444'],
    gradient4: ['#EC4899', '#8B5CF6'],
    shadowColor: 'rgba(0, 0, 0, 0.1)',
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const theme = useMemo(() => (isDarkMode ? THEME.dark : THEME.light), [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
