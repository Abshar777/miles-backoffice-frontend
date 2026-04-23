import { createContext, useContext, useState, useEffect } from 'react';

// Single theme: Modern Banking White
const THEMES = ['banking'];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme] = useState('banking');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'banking');
    document.documentElement.classList.remove('dark');
    document.documentElement.style.setProperty('--app-font', "'Plus Jakarta Sans', Inter, sans-serif");
    localStorage.setItem('miles-theme', 'banking');
  }, []);

  // No-op stubs — kept so existing call sites don't break
  const cycleTheme = () => {};
  const toggleTheme = () => {};
  const setTheme = () => {};

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, cycleTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
