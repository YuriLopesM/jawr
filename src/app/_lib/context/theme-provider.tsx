'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Theme } from '../../_types';

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

const THEME_COOKIE = 'theme';
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function ThemeProvider({
  children,
  initialTheme = 'dark',
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    THEMES.forEach((t) => root.classList.remove(t));
    root.classList.add(theme);
    document.cookie = `${THEME_COOKIE}=${encodeURIComponent(theme)}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
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
