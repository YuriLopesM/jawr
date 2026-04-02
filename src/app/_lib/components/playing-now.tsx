'use client';

import { MusicNoteIcon } from '@phosphor-icons/react';

export function PlayingNow() {
  return (
    <p className="w-full h-5 inline-flex items-center justify-center gap-2 text-sm text-gray-500">
      <MusicNoteIcon size={16} />
      tocando agora:
      <span className="text-gray-900">
        <strong>bôa</strong> ― rain
      </span>
    </p>
  );
}
