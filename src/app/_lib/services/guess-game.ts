import dayjs from 'dayjs';

import { getNumberDay, getUserTimezone } from '@/app/_lib/helpers/date';

export const MAX_ATTEMPTS = 1;
export const DAILY_LIMIT = 3;
const OPTION_COUNT = 4;

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

export type Puzzle = {
  image: string;
  answer: string;
  subtitle: string;
  year: string;
  genre: string;
  options: string[];
};

export type DailyData = { date: string; count: number; results: boolean[] };

type GameConfig<E> = {
  entries: E[];
  storageKey: string;
  getAnswer: (e: E) => string;
  getImage: (e: E) => string;
  getSubtitle: (e: E) => string;
  getYear: (e: E) => string;
  getGenre: (e: E) => string;
};

function decadeOf(year: string): string {
  return year.length >= 3 ? year.slice(0, 3) : '';
}

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

export function decadeLabel(year: string): string {
  const decade = decadeOf(year);
  return decade ? `${decade}0s` : '';
}

export function createGuessGame<E>(config: GameConfig<E>) {
  const { entries, storageKey, getAnswer, getImage, getSubtitle, getYear, getGenre } = config;

  const ALL_ANSWERS = Array.from(new Set(entries.map(getAnswer)));

  function isSameGenreOrDecade(candidate: E, target: E): boolean {
    const targetGenre = getGenre(target);
    const targetDecade = decadeOf(getYear(target));
    return (
      (!!targetGenre && getGenre(candidate) === targetGenre) ||
      (!!targetDecade && decadeOf(getYear(candidate)) === targetDecade)
    );
  }

  function pickDistractors(entry: E, count: number, seed: number): string[] {
    const relatedNames = Array.from(
      new Set(
        entries
          .filter((e) => getAnswer(e) !== getAnswer(entry) && isSameGenreOrDecade(e, entry))
          .map(getAnswer)
      )
    );

    let pool = seededShuffle(relatedNames, seed).slice(0, count);

    if (pool.length < count) {
      const backfill = seededShuffle(ALL_ANSWERS, seed + SEED_BACKFILL).filter(
        (name) => name !== getAnswer(entry) && !pool.includes(name)
      );
      pool = [...pool, ...backfill].slice(0, count);
    }

    return pool;
  }

  function buildPuzzle(entry: E, seed: number): Puzzle {
    const distractors = pickDistractors(entry, OPTION_COUNT - 1, seed + SEED_DISTRACTORS);
    const options = seededShuffle([getAnswer(entry), ...distractors], seed + SEED_OPTIONS);

    return {
      image: getImage(entry),
      answer: getAnswer(entry),
      subtitle: getSubtitle(entry),
      year: getYear(entry),
      genre: getGenre(entry),
      options,
    };
  }

  function getTodayStr(): string {
    return dayjs().tz(getUserTimezone()).format('YYYY-MM-DD');
  }

  function getTodayLabel(): string {
    return dayjs().tz(getUserTimezone()).format('D MMM').toLowerCase();
  }

  function getDailyPuzzle(index: number): Puzzle {
    const seed = getNumberDay() * SEED_DAY_STRIDE + index * SEED_INDEX_STRIDE;
    return buildPuzzle(entries[seed % entries.length], seed);
  }

  function getDailyData(): DailyData {
    if (typeof window === 'undefined') return { date: '', count: 0, results: [] };
    const today = getTodayStr();
    const empty: DailyData = { date: today, count: 0, results: [] };
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return empty;
      const data: DailyData = JSON.parse(stored);
      if (data.date !== today) return empty;
      return { ...empty, ...data, results: data.results ?? [] };
    } catch {
      return empty;
    }
  }

  function recordResult(solved: boolean): DailyData {
    const data = getDailyData();
    const updated: DailyData = {
      date: getTodayStr(),
      count: data.count + 1,
      results: [...data.results, solved],
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
    return updated;
  }

  return {
    MAX_ATTEMPTS,
    DAILY_LIMIT,
    getDailyPuzzle,
    getDailyData,
    recordResult,
    getTodayLabel,
    decadeLabel,
  };
}

export type GuessGame = ReturnType<typeof createGuessGame>;
