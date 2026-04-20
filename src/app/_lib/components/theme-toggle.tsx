'use client';

import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <span
      onClick={toggle}
      className="text-sm cursor-pointer transition-colors text-gray-400 hover:text-gray-600 hover:font-medium dark:text-[#6e6e6e] dark:hover:text-[#f0f0f0]"
    >
      [{theme === 'light' ? 'dark' : 'light'}]
    </span>
  );
}
