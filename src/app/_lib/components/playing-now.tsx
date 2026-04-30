'use client';

import { useRadioContext } from './radio-provider';
import { MusicNoteIcon } from '@phosphor-icons/react';
import { useT } from 'next-i18next/client';

export function PlayingNow() {
  const { song } = useRadioContext();
  const { t } = useT('home');

  return (
    <p className="w-full inline-flex items-center justify-center gap-2 text-sm text-gray-500 dark:tk-body flex-wrap">
      <MusicNoteIcon size={16} className="shrink-0" />
      {t('now_playing')}:
      <span className="text-gray-900 dark:tk-heading">
        {song === null ? (
          '—'
        ) : song.artist ? (
          <span>
            <strong>{song.artist}</strong> - {song.title}
          </span>
        ) : (
          (song.title ?? '—')
        )}
      </span>
    </p>
  );
}
