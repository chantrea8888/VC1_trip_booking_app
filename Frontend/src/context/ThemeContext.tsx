import React, { createContext, useContext, useState, useEffect } from 'react';
const DARK_MODE_STORAGE_KEY = 'darkMode';
const THEME_STORAGE_KEY = 'theme';
const THEME_CHANGE_EVENT = 'app-theme-change';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (savedDarkMode !== null) {
      return JSON.parse(savedDarkMode);
    }

    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme === 'dark';
    }

    return false;
  });

  useEffect(() => {
    localStorage.setItem(DARK_MODE_STORAGE_KEY, JSON.stringify(isDarkMode));
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }

    window.dispatchEvent(
      new CustomEvent(THEME_CHANGE_EVENT, {
        detail: { theme: isDarkMode ? 'dark' : 'light' },
      }),
    );
  }, [isDarkMode]);

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<{ theme?: 'light' | 'dark' }>).detail?.theme;

      if (nextTheme === 'light' || nextTheme === 'dark') {
        const nextDarkMode = nextTheme === 'dark';
        setIsDarkMode((current: boolean) => (current === nextDarkMode ? current : nextDarkMode));
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
