import { createContext, useContext, useState, useEffect } from 'react';

const THEMES = ['banking', 'dark'];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('miles-theme');
    return saved && THEMES.includes(saved) ? saved : 'banking';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Font: both themes use Plus Jakarta Sans / Inter
    document.documentElement.style.setProperty(
      '--app-font',
      "'Plus Jakarta Sans', Inter, sans-serif"
    );
    localStorage.setItem('miles-theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setThemeState(t => (t === 'banking' ? 'dark' : 'banking'));

  const cycleTheme = toggleTheme;

  const setTheme = (t) => {
    if (THEMES.includes(t)) setThemeState(t);
  };

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
