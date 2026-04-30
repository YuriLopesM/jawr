'use client';

import { GithubLogoIcon } from '@phosphor-icons/react';

import dayjs from 'dayjs';

export function Footer() {
  const year = dayjs().year();

  return (
    <footer className="border-t-gray-100 bg-[var(--dk-bg,#f9f9f9)] border-t dark:border-t-[var(--dk-border)]">
      <div className="max-w-5xl w-full mx-auto h-9 flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:tk-muted text-center">
          jawr <span className="text-gray-300 dark:tk-muted">| {year}</span>
        </p>
        <a
          href="https://github.com/YuriLopesM/jawr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 dark:tk-muted text-md hover:text-gray-600 dark:hover:tk-body transition-colors"
        >
          <GithubLogoIcon />
        </a>
      </div>
    </footer>
  );
}
