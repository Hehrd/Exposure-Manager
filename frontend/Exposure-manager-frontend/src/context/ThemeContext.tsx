import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  // table display mode
  displayType: 'infinite' | 'paginated';
  setDisplayType: (mode: 'infinite' | 'paginated') => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  displayType: 'paginated',
  setDisplayType: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // theme state
  const getInitialTheme = (): 'light' | 'dark' => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? 'dark' : 'light';
  };
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  // display type state
  const getInitialDisplay = (): 'infinite' | 'paginated' => {
    const saved = localStorage.getItem('tableDisplayType');
    return saved === 'infinite' ? 'infinite' : 'paginated';
  };
  const [displayType, setDisplayType] = useState<'infinite' | 'paginated'>(getInitialDisplay);

  // persist theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // persist display type
  useEffect(() => {
    localStorage.setItem('tableDisplayType', displayType);
  }, [displayType]);

  const toggleTheme = () =>
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, displayType, setDisplayType }}>
      {children}
    </ThemeContext.Provider>
  );
};
