import dayjs from 'dayjs';

import moviesData from '@/app/_lib/assets/movies.json';
import { getNumberDay, getUserTimezone } from '@/app/_lib/helpers/date';

export const MAX_ATTEMPTS = 1;
export const DAILY_LIMIT = 3;
const OPTION_COUNT = 4;

const DAILY_KEY = 'jawr-guess-movie-daily';

// Linear congruential generator constants (glibc) for deterministic shuffles.
const LCG_MULTIPLIER = 1103515245;
const LCG_INCREMENT = 12345;
const LCG_MODULUS = 0x7fffffff;

// Distinct seed offsets so each derived sequence (distractors, option order,
// daily picks) is independent without sharing the same shuffle.
const SEED_DISTRACTORS = 7;
const SEED_OPTIONS = 13;
const SEED_BACKFILL = 1;
const SEED_DAY_STRIDE = 31;
const SEED_INDEX_STRIDE = 7919;

type MovieEntry = {
  title: string;
  year: string;
  poster: string;
  genre: string;
};

export type Puzzle = {
  poster: string;
  title: string;
  year: string;
  genre: string;
  options: string[];
};

const entries = moviesData as MovieEntry[];

function decadeOf(year: string): string {
  return year.length >= 3 ? year.slice(0, 3) : '';
}

const ALL_TITLES = Array.from(new Set(entries.map((entry) => entry.title)));

function seededShuffle<T>(items: T[], seed: number): T[] {
  const shuffled = [...items];
  let state = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    state = (state * LCG_MULTIPLIER + LCG_INCREMENT) & LCG_MODULUS;
    const swapIndex = state % (i + 1);
    [shuffled[i], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[i]];
  }
  return shuffled;
}

function isSameGenreOrDecade(candidate: MovieEntry, target: MovieEntry): boolean {
  const targetDecade = decadeOf(target.year);
  return (
    (!!target.genre && candidate.genre === target.genre) ||
    (!!targetDecade && decadeOf(candidate.year) === targetDecade)
  );
}

function pickDistractors(movie: MovieEntry, count: number, seed: number): string[] {
  const relatedNames = Array.from(
    new Set(
      entries
        .filter(
          (entry) =>
            entry.title !== movie.title && isSameGenreOrDecade(entry, movie)
        )
        .map((entry) => entry.title)
    )
  );

  let pool = seededShuffle(relatedNames, seed).slice(0, count);

  if (pool.length < count) {
    const backfill = seededShuffle(ALL_TITLES, seed + SEED_BACKFILL).filter(
      (name) => name !== movie.title && !pool.includes(name)
    );
    pool = [...pool, ...backfill].slice(0, count);
  }

  return pool;
}

function buildPuzzle(movie: MovieEntry, seed: number): Puzzle {
  const distractors = pickDistractors(movie, OPTION_COUNT - 1, seed + SEED_DISTRACTORS);
  const options = seededShuffle([movie.title, ...distractors], seed + SEED_OPTIONS);

  return {
    poster: movie.poster,
    title: movie.title,
    year: movie.year,
    genre: movie.genre,
    options,
  };
}

function getTodayStr(): string {
  return dayjs().tz(getUserTimezone()).format('YYYY-MM-DD');
}

export function getTodayLabel(): string {
  return dayjs().tz(getUserTimezone()).format('D MMM').toLowerCase();
}

export function getDailyPuzzle(index: number): Puzzle {
  const seed = getNumberDay() * SEED_DAY_STRIDE + index * SEED_INDEX_STRIDE;
  return buildPuzzle(entries[seed % entries.length], seed);
}

export function decadeLabel(year: string): string {
  const decade = decadeOf(year);
  return decade ? `${decade}0s` : '';
}

export type DailyData = { date: string; count: number; results: boolean[] };

export function getDailyData(): DailyData {
  if (typeof window === 'undefined') return { date: '', count: 0, results: [] };
  const today = getTodayStr();
  const empty: DailyData = { date: today, count: 0, results: [] };
  try {
    const stored = localStorage.getItem(DAILY_KEY);
    if (!stored) return empty;
    const data: DailyData = JSON.parse(stored);
    if (data.date !== today) return empty;
    return { ...empty, ...data, results: data.results ?? [] };
  } catch {
    return empty;
  }
}

export function recordResult(solved: boolean): DailyData {
  const data = getDailyData();
  const updated: DailyData = {
    date: getTodayStr(),
    count: data.count + 1,
    results: [...data.results, solved],
  };
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}
