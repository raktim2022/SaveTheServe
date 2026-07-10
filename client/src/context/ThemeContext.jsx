'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('light');

  const applyTheme = useCallback((resolved) => {
    if (typeof document === 'undefined') return;

    setResolvedTheme(resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  }, []);

  const setTheme = useCallback((preference) => {
    setThemeState(preference);

    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-preference', preference);
    }

    const resolved = preference === 'system' ? getSystemTheme() : preference;
    applyTheme(resolved);
  }, [applyTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('theme-preference') || 'system';
    setThemeState(saved);
    const resolved = saved === 'system' ? getSystemTheme() : saved;
    applyTheme(resolved);
  }, [applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => applyTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, applyTheme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme,
    isDark: resolvedTheme === 'dark',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
