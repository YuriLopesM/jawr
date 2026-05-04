'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme =
  | 'light'
  | 'dark'
  | 'amoled'
  | 'nord'
  | 'dracula'
  | 'catppuccin'
  | 'gruvbox'
  | 'everforest'
  | 'city-lights';

export const THEMES: Theme[] = [
  'light',
  'dark',
  'amoled',
  'nord',
  'city-lights',
  'dracula',
  'catppuccin',
  'gruvbox',
  'everforest',
];

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  cycle: () => void;
}>({
  theme: 'dark',
  setTheme: () => {},
  cycle: () => {},
});

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('theme') as Theme | null;
  return stored && THEMES.includes(stored) ? stored : 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    THEMES.forEach((t) => root.classList.remove(t));
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const cycle = () =>
    setThemeState((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
