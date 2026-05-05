'use client';

import { GithubLogoIcon } from '@phosphor-icons/react';

import dayjs from 'dayjs';

import { JawrLogo } from './jawr-logo';

export function Footer() {
  const year = dayjs().year();

  return (
    <footer className="border-t-gray-100 bg-(--dk-bg,#f9f9f9) border-t dark:border-t-(--dk-border)">
      <div className="max-w-5xl w-full mx-auto h-9 flex items-center justify-between">
        <p className="text-xs text-gray-300 dark:tk-muted flex items-center gap-2">
          <JawrLogo className="h-4 w-4 fill-current" />
          jawr | {year}
        </p>
        <a
          aria-label="github logo"
          href="https://github.com/YuriLopesM/jawr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 dark:tk-muted text-md hover:text-gray-600 dark:hover:tk-accent transition-colors"
        >
          <GithubLogoIcon />
        </a>
      </div>
    </footer>
  );
}
