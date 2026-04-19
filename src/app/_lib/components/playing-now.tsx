'use client';

import { useRadio } from '@/hooks';
import { MusicNoteIcon } from '@phosphor-icons/react';
import { useT } from 'next-i18next/client';

export function PlayingNow() {
  const { song } = useRadio();
  const { t } = useT('home');

  return (
    <p className="w-full h-5 inline-flex items-center justify-center gap-2 text-sm text-gray-500">
      <MusicNoteIcon size={16} />
      {t('now_playing')}:
      <span className="text-gray-900">
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
