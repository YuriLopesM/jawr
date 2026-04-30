'use client';

import { useTheme, THEMES } from './theme-provider';

export function ThemeToggle() {
  const { theme, cycle } = useTheme();
  const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  return (
    <span
      onClick={cycle}
      className="text-sm cursor-pointer transition-colors text-gray-400 hover:text-gray-600 hover:font-medium dark:tk-muted dark:hover:tk-heading"
      title={`Switch to ${next}`}
    >
      [{theme}]
    </span>
  );
}
