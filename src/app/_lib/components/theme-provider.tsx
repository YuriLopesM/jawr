'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'amoled' | 'nord' | 'dracula' | 'catppuccin' | 'gruvbox' | 'everforest' | 'city-lights';

export const THEMES: Theme[] = ['light', 'dark', 'amoled', 'nord', 'city-lights', 'dracula', 'catppuccin', 'gruvbox', 'everforest'];

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void; cycle: () => void }>({
  theme: 'dark',
  setTheme: () => {},
  cycle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored && THEMES.includes(stored)) setThemeState(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    THEMES.forEach(t => root.classList.remove(t));
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const cycle = () => setThemeState(t => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
