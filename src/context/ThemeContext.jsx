import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const REDUCE_MOTION_KEY = 'smart_campus_reduce_motion';
export const REDUCE_TRANSPARENCY_KEY = 'smart_campus_reduce_transparency';

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const stored = localStorage.getItem('colorScheme');
    const resolvedMode = stored || 'light';
    
    let activeTheme = resolvedMode;
    if (resolvedMode === 'system') {
        activeTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Ustaw color-scheme natychmiast przy inicjalizacji
    let colorScheme = activeTheme;
    if (['frutiger', 'autumn', 'christmas'].includes(activeTheme)) colorScheme = 'light';
    if (activeTheme === 'halloween') colorScheme = 'dark';
    document.documentElement.style.setProperty('color-scheme', colorScheme);
    document.documentElement.dataset.theme = resolvedMode;
    return resolvedMode;
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (themeMode === 'system') {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return themeMode;
  });

  const [reduceMotion, setReduceMotion] = useState(() => {
    const enabled = localStorage.getItem(REDUCE_MOTION_KEY) === 'true';
    if (enabled) {
      document.documentElement.dataset.reduceMotion = 'true';
    }
    return enabled;
  });

  const [reduceTransparency, setReduceTransparency] = useState(() => {
    const enabled = localStorage.getItem(REDUCE_TRANSPARENCY_KEY) === 'true';
    if (enabled) {
      document.documentElement.dataset.reduceTransparency = 'true';
    }
    return enabled;
  });

  useEffect(() => {
    const updateTheme = () => {
      let activeTheme = themeMode;
      if (themeMode === 'system') {
        activeTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      setResolvedTheme(activeTheme);
      
      const root = document.documentElement;
      let colorScheme = activeTheme;
      if (['frutiger', 'autumn', 'christmas'].includes(activeTheme)) colorScheme = 'light';
      if (activeTheme === 'halloween') colorScheme = 'dark';
      root.style.setProperty('color-scheme', colorScheme);
      root.dataset.theme = themeMode;
    };

    updateTheme();
    localStorage.setItem('colorScheme', themeMode);

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateTheme();
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', listener);
        return () => mediaQuery.removeEventListener('change', listener);
      } else {
        mediaQuery.addListener(listener);
        return () => mediaQuery.removeListener(listener);
      }
    }
  }, [themeMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion) {
      root.dataset.reduceMotion = 'true';
    } else {
      delete root.dataset.reduceMotion;
    }
    localStorage.setItem(REDUCE_MOTION_KEY, String(reduceMotion));
  }, [reduceMotion]);

  useEffect(() => {
    const root = document.documentElement;
    if (reduceTransparency) {
      root.dataset.reduceTransparency = 'true';
    } else {
      delete root.dataset.reduceTransparency;
    }
    localStorage.setItem(REDUCE_TRANSPARENCY_KEY, String(reduceTransparency));
  }, [reduceTransparency]);

  const toggleTheme = (idOrState, newState) => {
    if (typeof newState === 'boolean') {
      setThemeMode(newState ? 'dark' : 'light');
      return;
    }
    if (typeof idOrState === 'boolean') {
      setThemeMode(idOrState ? 'dark' : 'light');
      return;
    }
    setThemeMode((prev) => (resolvedTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme,
        themeMode,
        setThemeMode,
        toggleTheme,
        reduceMotion,
        setReduceMotion,
        reduceTransparency,
        setReduceTransparency,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
