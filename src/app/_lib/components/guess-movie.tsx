'use client';

import { movieGame } from '@/app/_lib/services/guess-movie';
import { GuessGame } from '@/app/_lib/components/guess-game';

export function GuessMovie() {
  return (
    <GuessGame
      game={movieGame}
      i18nPrefix="guess_movie"
      imageClassName="relative h-80 aspect-[2/3] bg-gray-100 dark:bg-white/5 overflow-hidden"
      shareLine="🎬 jawr · guess the movie"
    />
  );
}
