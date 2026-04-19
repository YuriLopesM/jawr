'use client';

import { useRadio } from '@/hooks';
import { MusicNoteIcon } from '@phosphor-icons/react';

export function PlayingNow() {
  const { song } = useRadio();

  return (
    <p className="w-full h-5 inline-flex items-center justify-center gap-2 text-sm text-gray-500">
      <MusicNoteIcon size={16} />
      tocando agora:
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
