'use client';

import { GithubLogoIcon } from '@phosphor-icons/react';

import dayjs from 'dayjs';

export function Footer() {
  const year = dayjs().year();

  return (
    <footer className="border-t-gray-100 bg-gray-50 border-t dark:bg-gray-950 dark:border-t-[#2a2a2a]">
      <div className="max-w-5xl w-full mx-auto h-9 flex items-center justify-between">
        <p className="text-xs text-gray-400 text-center">
          jawr <span className="text-gray-200">| {year}</span>
        </p>
        <a
          href="https://github.com/YuriLopesM/jawr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 text-md hover:text-gray-600 dark:hover:text-[#b0b0b0] transition-colors"
        >
          <GithubLogoIcon weight="duotone" />
        </a>
      </div>
    </footer>
  );
}
