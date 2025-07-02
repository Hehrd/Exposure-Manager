// src/context/ThemeContext.tsx
import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react'; 

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const getInitialTheme = (): 'light' | 'dark' => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};  
