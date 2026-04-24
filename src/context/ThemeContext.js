import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEMES = ['banking', 'dark'];

const ThemeContext = createContext();

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty('--app-font', "'Plus Jakarta Sans', Inter, sans-serif");
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    root.classList.add('dark');
  } else {
    root.setAttribute('data-theme', 'banking');
    root.classList.remove('dark');
  }
  localStorage.setItem('miles-theme', theme);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('miles-theme');
    return saved && THEMES.includes(saved) ? saved : 'banking';
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((t) => {
    const next = THEMES.includes(t) ? t : 'banking';
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'dark' ? 'banking' : 'dark');
  }, []);

  const cycleTheme = toggleTheme;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, cycleTheme, THEMES, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
