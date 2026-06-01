'use client';

import { albumGame } from '@/app/_lib/services/guess-album';
import { GuessGame } from '@/app/_lib/components/guess-game';

export function GuessAlbum() {
  return (
    <GuessGame
      game={albumGame}
      i18nPrefix="guess_album"
      imageClassName="relative w-80 aspect-square bg-gray-100 dark:bg-white/5 overflow-hidden"
      shareLine="🎵 jawr · guess the album"
    />
  );
}
