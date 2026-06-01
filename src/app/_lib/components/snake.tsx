'use client';

import { useT } from 'next-i18next/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TouchEvent } from 'react';
import { shareOrCopy } from '@/app/_lib/helpers/share';

const GRID = 15;
const INITIAL_LEN = 3;
const BASE_SPEED = 100; // ms per tick at start
const MIN_SPEED = 50; // fastest tick
const SPEED_STEP = 3; // ms faster per food eaten
const COPIED_FEEDBACK_MS = 1500;
const SWIPE_THRESHOLD_PX = 16;
const BEST_KEY = 'jawr-snake-best';

type Cell = { x: number; y: number };
type Dir = { x: number; y: number };
type Status = 'idle' | 'playing' | 'paused' | 'over';

const UP: Dir = { x: 0, y: -1 };
const DOWN: Dir = { x: 0, y: 1 };
const LEFT: Dir = { x: -1, y: 0 };
const RIGHT: Dir = { x: 1, y: 0 };

function cellsEqual(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y;
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-medium rounded-sm border border-gray-200 bg-gray-50 text-gray-500 dark:border-white/15 dark:bg-white/5 dark:tk-body font-[inherit]">
      {children}
    </kbd>
  );
}

function isOpposite(a: Dir, b: Dir): boolean {
  return a.x + b.x === 0 && a.y + b.y === 0;
}

function initialSnake(): Cell[] {
  const mid = Math.floor(GRID / 2);
  return Array.from({ length: INITIAL_LEN }, (_, i) => ({
    x: mid - i,
    y: mid,
  }));
}

function randomFood(snake: Cell[]): Cell {
  const free: Cell[] = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const cell = { x, y };
      if (!snake.some((segment) => cellsEqual(segment, cell))) free.push(cell);
    }
  }
  return free[Math.floor(Math.random() * free.length)];
}

function speedFor(score: number): number {
  return Math.max(MIN_SPEED, BASE_SPEED - score * SPEED_STEP);
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function readBest(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeBest(score: number): void {
  try {
    localStorage.setItem(BEST_KEY, String(score));
  } catch {}
}

export function Snake() {
  const { t } = useT('home');
  const [open, setOpen] = useState(false);
  const [snake, setSnake] = useState<Cell[]>(initialSnake);
  const [food, setFood] = useState<Cell>(() => randomFood(initialSnake()));
  const [status, setStatus] = useState<Status>('idle');
  const [best, setBest] = useState(readBest);
  const [isNewBest, setIsNewBest] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const score = snake.length - INITIAL_LEN;
  const prevBestRef = useRef(best);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // turnQueue buffers up to two pending turns so fast inputs aren't dropped;
  // each is validated against the previous direction so a 180° reversal can't be
  // enqueued. The tick consumes one turn per frame.
  const dirRef = useRef<Dir>(RIGHT);
  const turnQueue = useRef<Dir[]>([]);
  const foodRef = useRef(food);
  const snakeRef = useRef(snake);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    },
    []
  );

  async function handleShare() {
    const didCopy = await shareOrCopy(
      `🐍 jawr · snake\n\n🏆 ${score} pts\n⏱️ ${formatTime(elapsed)}`
    );
    if (!didCopy) return;
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  }

  const reset = useCallback((startDir: Dir = RIGHT) => {
    const startSnake = initialSnake();
    const dir = isOpposite(RIGHT, startDir) ? RIGHT : startDir;
    prevBestRef.current = readBest();
    setIsNewBest(false);
    snakeRef.current = startSnake;
    setSnake(startSnake);
    setFood(randomFood(startSnake));
    dirRef.current = dir;
    turnQueue.current = [];
    setElapsed(0);
    setStatus('playing');
  }, []);

  // Reads the latest snake via ref so the setSnake updater stays pure and safe
  // under React Strict Mode's double-invoke.
  const step = useCallback(() => {
    const prev = snakeRef.current;
    const direction = turnQueue.current.shift() ?? dirRef.current;
    dirRef.current = direction;
    const head = {
      x: (prev[0].x + direction.x + GRID) % GRID,
      y: (prev[0].y + direction.y + GRID) % GRID,
    };

    if (prev.some((segment) => cellsEqual(segment, head))) {
      const finalScore = prev.length - INITIAL_LEN;
      setStatus('over');
      setBest((currentBest) => Math.max(currentBest, finalScore));
      setIsNewBest(finalScore > prevBestRef.current);
      return;
    }

    const ate = cellsEqual(head, foodRef.current);
    const next = ate ? [head, ...prev] : [head, ...prev.slice(0, -1)];
    snakeRef.current = next;
    if (ate) setFood(randomFood(next));
    setSnake(next);
  }, []);

  const turn = useCallback((nextDir: Dir) => {
    const queue = turnQueue.current;
    if (queue.length >= 2) return;
    const last = queue.length ? queue[queue.length - 1] : dirRef.current;
    if (isOpposite(last, nextDir) || cellsEqual(last, nextDir)) return;
    queue.push(nextDir);
  }, []);

  const togglePause = useCallback(() => {
    setStatus((current) => (current === 'playing' ? 'paused' : 'playing'));
  }, []);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status !== 'playing') return;
    let id: ReturnType<typeof setTimeout>;
    const loop = () => {
      step();
      const currentScore = snakeRef.current.length - INITIAL_LEN;
      id = setTimeout(loop, speedFor(currentScore));
    };
    id = setTimeout(loop, speedFor(snakeRef.current.length - INITIAL_LEN));
    return () => clearTimeout(id);
  }, [status, step]);

  useEffect(() => {
    if (status === 'over') {
      writeBest(best);
    }
  }, [status, best]);

  // While playing, claim the shared key-capture flag so the global radio
  // shortcuts (space/arrows) don't fire from snake controls.
  useEffect(() => {
    const capturing = status === 'playing' || status === 'paused';
    window.__gameCapturingKeys = capturing;
    return () => {
      window.__gameCapturingKeys = false;
    };
  }, [status]);

  useEffect(() => {
    const onHide = () => {
      if (document.hidden)
        setStatus((current) => (current === 'playing' ? 'paused' : current));
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  useEffect(() => {
    if (!open) return;
    const map: Record<string, Dir> = {
      ArrowUp: UP,
      ArrowDown: DOWN,
      ArrowLeft: LEFT,
      ArrowRight: RIGHT,
      w: UP,
      s: DOWN,
      a: LEFT,
      d: RIGHT,
      W: UP,
      S: DOWN,
      A: LEFT,
      D: RIGHT,
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        if (status === 'playing' || status === 'paused') {
          e.preventDefault();
          togglePause();
        }
        return;
      }

      const next = map[e.key];
      if (!next) return;
      e.preventDefault();

      if (status === 'idle') {
        reset(next);
        return;
      }
      if (status === 'playing') turn(next);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, status, turn, reset, togglePause]);

  const touchStart = useRef<Cell | null>(null);

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (status !== 'playing') return;
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    if (!start) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX && Math.abs(dy) < SWIPE_THRESHOLD_PX)
      return;
    if (Math.abs(dx) > Math.abs(dy)) {
      turn(dx > 0 ? RIGHT : LEFT);
    } else {
      turn(dy > 0 ? DOWN : UP);
    }
    touchStart.current = null;
  };

  return (
    <section className="flex flex-col gap-4 items-center">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-[12px] font-semibold text-gray-600 hover:text-gray-900 dark:tk-body dark:hover:tk-heading transition-colors"
      >
        {t('snake_title')} {open ? '↑' : '↓'}
      </button>

      {open && (
        <div className="flex flex-col gap-3 items-center w-full max-w-xs">
          <div className="relative">
            <div
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              className="grid w-64 aspect-square border border-gray-200 gap-px bg-gray-100 dark:tk-border dark:tk-surface touch-none"
              style={{
                gridTemplateColumns: `repeat(${GRID}, 1fr)`,
                gridTemplateRows: `repeat(${GRID}, 1fr)`,
              }}
            >
              {Array.from({ length: GRID * GRID }, (_, i) => {
                const cell = { x: i % GRID, y: Math.floor(i / GRID) };
                const isHead = cellsEqual(snake[0], cell);
                const isBody =
                  !isHead && snake.some((segment) => cellsEqual(segment, cell));
                const isFood = cellsEqual(food, cell);
                const cellClass = isHead
                  ? 'bg-gray-900 dark:tk-bg-accent'
                  : isBody
                    ? 'bg-gray-500 dark:tk-bg-muted'
                    : isFood
                      ? 'bg-gray-300 dark:tk-bg-accent-alt'
                      : 'bg-white dark:tk-bg';
                return <div key={i} className={cellClass} />;
              })}
            </div>

            {status === 'paused' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/50">
                <span className="text-[11px] font-semibold text-gray-700 dark:tk-heading">
                  {t('snake_paused')}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-[11px] text-gray-500 dark:tk-body">
              {t('snake_score')}: {score} · {t('snake_time')}:{' '}
              {formatTime(elapsed)} · {t('snake_best')}: {best}
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase tracking-wide text-gray-400 dark:tk-muted">
                {t('snake_speed')}
              </span>
              <span className="flex h-1.5 w-24 overflow-hidden rounded-full bg-gray-100 dark:tk-surface">
                <span
                  className="h-full bg-gray-500 dark:tk-bg-accent transition-all"
                  style={{
                    width: `${Math.round(
                      ((BASE_SPEED - speedFor(score)) /
                        (BASE_SPEED - MIN_SPEED)) *
                        100
                    )}%`,
                  }}
                />
              </span>
            </div>

            {status === 'idle' && (
              <button
                onClick={() => reset()}
                className="mt-1 px-4 py-1.5 text-[11px] font-semibold rounded border border-gray-300 text-gray-700 dark:border-white/20 dark:tk-body hover:border-gray-500 hover:text-gray-900 dark:hover:border-white/40 dark:hover:tk-heading transition-colors"
              >
                {t('snake_play')}
              </button>
            )}

            {(status === 'playing' || status === 'paused') && (
              <button
                onClick={togglePause}
                className="text-[10px] text-gray-300 hover:text-gray-600 transition-colors underline"
              >
                {status === 'paused' ? t('snake_resume') : t('snake_pause')}
              </button>
            )}

            {status === 'over' && (
              <>
                <span
                  className={[
                    'text-[11px]',
                    isNewBest
                      ? 'text-gray-700 dark:tk-heading font-semibold'
                      : 'text-gray-400',
                  ].join(' ')}
                >
                  {isNewBest ? t('snake_new_best') : t('snake_game_over')}
                </span>
                <button
                  onClick={() => reset()}
                  className="mt-1 px-4 py-1.5 text-[11px] font-semibold rounded border border-gray-300 text-gray-700 dark:border-white/20 dark:tk-body hover:border-gray-500 hover:text-gray-900 dark:hover:border-white/40 dark:hover:tk-heading transition-colors"
                >
                  {t('snake_again')}
                </button>
                <button
                  onClick={handleShare}
                  className="text-[10px] text-gray-300 hover:text-gray-600 dark:tk-muted dark:hover:tk-body transition-colors underline"
                >
                  {copied ? t('snake_copied') : t('snake_share')}
                </button>
              </>
            )}
            <div className="group relative mt-1">
              <button
                onClick={() => setShowHelp((h) => !h)}
                aria-label={t('snake_controls')}
                className="w-4 h-4 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/15 text-[9px] text-gray-400 dark:tk-muted hover:border-gray-400 dark:hover:border-white/30 transition-colors"
              >
                ?
              </button>

              <div
                className={[
                  'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10',
                  'flex flex-col items-center gap-3 px-4 py-3 whitespace-nowrap',
                  'rounded border border-gray-200 dark:border-white/15 bg-white dark:tk-surface shadow-sm',
                  'text-gray-400 dark:tk-muted transition-opacity',
                  showHelp
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <span className="flex gap-1.5">
                    <Key>W</Key>
                    <Key>A</Key>
                    <Key>S</Key>
                    <Key>D</Key>
                  </span>
                  <span className="text-[9px] uppercase tracking-wide">
                    {t('snake_move')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex gap-1.5">
                    <Key>↑</Key>
                    <Key>↓</Key>
                    <Key>←</Key>
                    <Key>→</Key>
                  </span>
                  <span className="text-[9px] uppercase tracking-wide">
                    {t('snake_move')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Key>P</Key>
                  <span className="text-[9px] uppercase tracking-wide">
                    {t('snake_pause')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
