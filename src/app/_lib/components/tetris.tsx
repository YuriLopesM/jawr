'use client';

import { useT } from 'next-i18next/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TouchEvent } from 'react';
import { shareOrCopy } from '@/app/_lib/helpers/share';

const COLS = 10;
const ROWS = 20;
const BASE_SPEED = 800; // gravity tick (ms) at level 1
const MIN_SPEED = 100;
const SPEED_STEP = 70; // ms faster per level
const LINES_PER_LEVEL = 5;
const SOFT_DROP_MS = 35; // cell step while Down is held
const DAS_MS = 160; // delay before a held left/right auto-shifts
const ARR_MS = 40; // cell step once auto-shift starts
const LINE_CLEAR_MS = 180;
const LOCK_DELAY_MS = 400;
const MAX_LOCK_RESETS = 8; // guideline cap on lock-delay resets
const COPIED_FEEDBACK_MS = 1500;
const SWIPE_THRESHOLD_PX = 24;
const BEST_KEY = 'jawr-tetris-best';
// Rotation kick offsets [dx, dy] tried in order: in-place, then shift off a
// side wall, then lift off the floor, then larger shifts for the I piece.
const KICKS: readonly (readonly [number, number])[] = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [0, -1],
  [-1, -1],
  [1, -1],
  [-2, 0],
  [2, 0],
];

type Cell = number; // 0 = empty, 1..7 = piece id
type Board = Cell[][];
type Point = { x: number; y: number };
type Status = 'idle' | 'playing' | 'paused' | 'over';

// Per piece, the [x, y] cell offsets for each rotation state, precomputed so
// rotation is a lookup rather than trig.
const SHAPES: Point[][][] = [
  // I
  [
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
    ],
    [
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
    ],
  ],
  // O
  [
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  ],
  // T
  [
    [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
    [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
  ],
  // S
  [
    [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ],
  ],
  // Z
  [
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    [
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
  ],
  // J
  [
    [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
  ],
  // L
  [
    [
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
    ],
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
  ],
];

const CELL_COLORS = [
  'bg-white dark:tk-bg',
  'bg-cyan-400 dark:bg-cyan-500',
  'bg-yellow-400 dark:bg-yellow-500',
  'bg-purple-400 dark:bg-purple-500',
  'bg-green-400 dark:bg-green-500',
  'bg-red-400 dark:bg-red-500',
  'bg-blue-400 dark:bg-blue-500',
  'bg-orange-400 dark:bg-orange-500',
];

type Piece = {
  id: number; // 1..7
  rotation: number;
  x: number;
  y: number;
};

type TimerHandle = ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>;

// Clear a timeout or interval held in a ref and null it out; no-op if unset.
function clearTimerRef(
  ref: React.MutableRefObject<TimerHandle | null>
): void {
  if (ref.current === null) return;
  clearTimeout(ref.current);
  clearInterval(ref.current);
  ref.current = null;
}

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0));
}

// Ids are 1..SHAPES.length (0 is the empty cell) so bag and shape lookup stay
// in sync if a piece is added or removed.
const PIECE_IDS = SHAPES.map((_, i) => i + 1);

// 7-bag: shuffle every id then deal the whole bag before refilling, bounding
// droughts/floods (guideline Random Generator).
function newBag(): number[] {
  const bag = [...PIECE_IDS];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

function drawFromBag(bag: number[]): number {
  if (bag.length === 0) bag.push(...newBag());
  return bag.shift()!;
}

function spawnPiece(id: number): Piece {
  return { id, rotation: 0, x: 3, y: 0 };
}

function cellsOf(piece: Piece): Point[] {
  const states = SHAPES[piece.id - 1];
  const offsets = states[piece.rotation % states.length];
  return offsets.map((o) => ({ x: o.x + piece.x, y: o.y + piece.y }));
}

function collides(board: Board, piece: Piece): boolean {
  return cellsOf(piece).some(
    ({ x, y }) => x < 0 || x >= COLS || y >= ROWS || (y >= 0 && board[y][x] !== 0)
  );
}

function merge(board: Board, piece: Piece): Board {
  const next = board.map((row) => [...row]);
  for (const { x, y } of cellsOf(piece)) {
    if (y >= 0) next[y][x] = piece.id;
  }
  return next;
}

function fullRows(board: Board): number[] {
  const rows: number[] = [];
  board.forEach((row, y) => {
    if (row.every((cell) => cell !== 0)) rows.push(y);
  });
  return rows;
}

function clearLines(board: Board): { board: Board; cleared: number } {
  const kept = board.filter((row) => row.some((cell) => cell === 0));
  const cleared = ROWS - kept.length;
  const empty = Array.from({ length: cleared }, () =>
    Array<Cell>(COLS).fill(0)
  );
  return { board: [...empty, ...kept], cleared };
}

// Guideline line-clear values (single/double/triple/tetris) scaled by level.
function scoreForLines(cleared: number, level: number): number {
  const base = [0, 100, 300, 500, 800][cleared] ?? 0;
  return base * level;
}

function speedFor(level: number): number {
  return Math.max(MIN_SPEED, BASE_SPEED - (level - 1) * SPEED_STEP);
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

const START_BUTTON_CLASS =
  'mt-1 px-4 py-1.5 text-[11px] font-semibold rounded border border-gray-300 text-gray-700 dark:border-white/20 dark:tk-body hover:border-gray-500 hover:text-gray-900 dark:hover:border-white/40 dark:hover:tk-heading transition-colors';

const HELP_ROWS: { keys: string[]; label: string }[] = [
  { keys: ['←', '→'], label: 'tetris_move' },
  { keys: ['↑'], label: 'tetris_rotate' },
  { keys: ['↓'], label: 'tetris_soft_drop' },
  { keys: ['space'], label: 'tetris_hard_drop' },
  { keys: ['P'], label: 'tetris_pause' },
];

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-medium rounded-sm border border-gray-200 bg-gray-50 text-gray-500 dark:border-white/15 dark:bg-white/5 dark:tk-body font-[inherit]">
      {children}
    </kbd>
  );
}

export function Tetris() {
  const { t } = useT('home');
  const [open, setOpen] = useState(false);
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [piece, setPiece] = useState<Piece | null>(null);
  // Built once via a lazy initializer so the bag ref is never read during render.
  const [{ initialBag, initialNext }] = useState(() => {
    const bag = newBag();
    return { initialNext: drawFromBag(bag), initialBag: bag };
  });
  const bagRef = useRef<number[]>(initialBag);
  const [nextId, setNextId] = useState(initialNext);
  const [status, setStatus] = useState<Status>('idle');
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [best, setBest] = useState(readBest);
  const [isNewBest, setIsNewBest] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const level = Math.floor(lines / LINES_PER_LEVEL) + 1;

  const prevBestRef = useRef(best);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Live refs the gravity tick reads without restarting its timer each render.
  const boardRef = useRef(board);
  const pieceRef = useRef(piece);
  const nextIdRef = useRef(nextId);
  const levelRef = useRef(level);
  const scoreRef = useRef(score);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockResets = useRef(0);
  const softDropTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const dasDir = useRef<-1 | 1 | 0>(0);
  const dasTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arrTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the gravity-loop's refs current; runs every render (no dep array).
  useEffect(() => {
    boardRef.current = board;
    pieceRef.current = piece;
    nextIdRef.current = nextId;
    levelRef.current = level;
  });

  useEffect(
    () => () => {
      clearTimerRef(copiedTimer);
      clearTimerRef(lockTimer);
      clearTimerRef(softDropTimer);
      clearTimerRef(dasTimer);
      clearTimerRef(arrTimer);
      clearTimerRef(clearTimer);
    },
    []
  );

  async function handleShare() {
    const didCopy = await shareOrCopy(
      `🎮 jawr · tetris\n\n🏆 ${score} pts\n📊 ${lines} lines · lvl ${level}\n⏱️ ${formatTime(elapsed)}\n\n@radiojawr`
    );
    if (!didCopy) return;
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  }

  const cancelLockTimer = useCallback(() => clearTimerRef(lockTimer), []);

  const grounded = useCallback((p: Piece): boolean => {
    return collides(boardRef.current, { ...p, y: p.y + 1 });
  }, []);

  const reset = useCallback(() => {
    const startBoard = emptyBoard();
    bagRef.current = newBag();
    const first = spawnPiece(drawFromBag(bagRef.current));
    prevBestRef.current = readBest();
    setIsNewBest(false);
    cancelLockTimer();
    clearTimerRef(clearTimer);
    setClearingRows([]);
    lockResets.current = 0;
    boardRef.current = startBoard;
    pieceRef.current = first;
    nextIdRef.current = drawFromBag(bagRef.current);
    setBoard(startBoard);
    setPiece(first);
    setNextId(nextIdRef.current);
    scoreRef.current = 0;
    setScore(0);
    setLines(0);
    setElapsed(0);
    setStatus('playing');
  }, [cancelLockTimer]);

  const spawnNext = useCallback((board: Board) => {
    const spawned = spawnPiece(nextIdRef.current);
    if (collides(board, spawned)) {
      pieceRef.current = null;
      setPiece(null);
      setStatus('over');
      const finalScore = scoreRef.current;
      setBest((currentBest) => Math.max(currentBest, finalScore));
      setIsNewBest(finalScore > prevBestRef.current);
      return;
    }
    pieceRef.current = spawned;
    nextIdRef.current = drawFromBag(bagRef.current);
    setPiece(spawned);
    setNextId(nextIdRef.current);
  }, []);

  // Completed rows flash for LINE_CLEAR_MS before collapsing; during that window
  // the active piece is null so gravity/input are effectively suspended.
  const lockPiece = useCallback(() => {
    if (!pieceRef.current) return;
    cancelLockTimer();
    lockResets.current = 0;
    const locked = merge(boardRef.current, pieceRef.current);
    const rows = fullRows(locked);

    if (rows.length === 0) {
      boardRef.current = locked;
      setBoard(locked);
      spawnNext(locked);
      return;
    }

    boardRef.current = locked;
    setBoard(locked);
    pieceRef.current = null;
    setPiece(null);
    setClearingRows(rows);
    scoreRef.current += scoreForLines(rows.length, levelRef.current);
    setScore(scoreRef.current);
    setLines((l) => l + rows.length);

    clearTimer.current = setTimeout(() => {
      clearTimer.current = null;
      const { board: collapsed } = clearLines(locked);
      boardRef.current = collapsed;
      setBoard(collapsed);
      setClearingRows([]);
      spawnNext(collapsed);
    }, LINE_CLEAR_MS);
  }, [cancelLockTimer, spawnNext]);

  const scheduleLock = useCallback(() => {
    cancelLockTimer();
    lockTimer.current = setTimeout(() => {
      const p = pieceRef.current;
      if (p && grounded(p)) lockPiece();
    }, LOCK_DELAY_MS);
  }, [cancelLockTimer, grounded, lockPiece]);

  // After a move/rotate: airborne cancels the lock timer; grounded re-arms it
  // within the reset budget so a piece can be nudged before it locks.
  const refreshLock = useCallback(
    (movedWhileGrounded: boolean) => {
      const p = pieceRef.current;
      if (!p) return;
      if (!grounded(p)) {
        lockResets.current = 0;
        cancelLockTimer();
        return;
      }
      if (movedWhileGrounded) {
        if (lockResets.current >= MAX_LOCK_RESETS) return;
        lockResets.current++;
      }
      scheduleLock();
    },
    [grounded, cancelLockTimer, scheduleLock]
  );

  const tryMove = useCallback(
    (dx: number, dy: number): boolean => {
      const current = pieceRef.current;
      if (!current) return false;
      const moved = { ...current, x: current.x + dx, y: current.y + dy };
      if (collides(boardRef.current, moved)) return false;
      const wasGrounded = grounded(current);
      pieceRef.current = moved;
      setPiece(moved);
      refreshLock(wasGrounded);
      return true;
    },
    [grounded, refreshLock]
  );

  const rotate = useCallback(() => {
    const current = pieceRef.current;
    if (!current) return;
    const states = SHAPES[current.id - 1];
    const rotated = {
      ...current,
      rotation: (current.rotation + 1) % states.length,
    };
    // Accept the first kick offset that fits (not full SRS, but kicks off walls
    // and the floor).
    for (const [dx, dy] of KICKS) {
      const shifted = { ...rotated, x: rotated.x + dx, y: rotated.y + dy };
      if (!collides(boardRef.current, shifted)) {
        const wasGrounded = grounded(current);
        pieceRef.current = shifted;
        setPiece(shifted);
        refreshLock(wasGrounded);
        return;
      }
    }
  }, [grounded, refreshLock]);

  // A grounded piece arms the lock timer rather than locking instantly, so the
  // lock delay applies to gravity landings. Drops don't score — only line
  // clears do, so the score reflects clearing skill, not drop spam.
  const softDrop = useCallback(() => {
    if (tryMove(0, 1)) return;
    const p = pieceRef.current;
    if (p && grounded(p) && !lockTimer.current) scheduleLock();
  }, [tryMove, grounded, scheduleLock]);

  const stopSoftDrop = useCallback(() => clearTimerRef(softDropTimer), []);

  // No-op if already running, so OS key auto-repeat doesn't stack intervals.
  const startSoftDrop = useCallback(() => {
    if (softDropTimer.current) return;
    softDrop();
    softDropTimer.current = setInterval(softDrop, SOFT_DROP_MS);
  }, [softDrop]);

  const stopDAS = useCallback(() => {
    dasDir.current = 0;
    clearTimerRef(dasTimer);
    clearTimerRef(arrTimer);
  }, []);

  // Delayed Auto-Shift: move once, then after DAS_MS auto-repeat at ARR_MS while
  // held. No-op if the same direction is already active (filters OS repeat).
  const startDAS = useCallback(
    (dir: -1 | 1) => {
      if (dasDir.current === dir) return;
      stopDAS();
      dasDir.current = dir;
      tryMove(dir, 0);
      dasTimer.current = setTimeout(() => {
        arrTimer.current = setInterval(() => tryMove(dir, 0), ARR_MS);
      }, DAS_MS);
    },
    [stopDAS, tryMove]
  );

  const hardDrop = useCallback(() => {
    const current = pieceRef.current;
    if (!current) return;
    let drop = 0;
    while (!collides(boardRef.current, { ...current, y: current.y + drop + 1 }))
      drop++;
    pieceRef.current = { ...current, y: current.y + drop };
    setPiece(pieceRef.current);
    lockPiece();
  }, [lockPiece]);

  const togglePause = useCallback(() => {
    setStatus((current) => (current === 'playing' ? 'paused' : 'playing'));
  }, []);

  useEffect(() => {
    if (status !== 'playing') {
      cancelLockTimer();
      stopSoftDrop();
      stopDAS();
      return;
    }
    let id: ReturnType<typeof setTimeout>;
    const loop = () => {
      softDrop();
      id = setTimeout(loop, speedFor(levelRef.current));
    };
    id = setTimeout(loop, speedFor(levelRef.current));
    return () => clearTimeout(id);
  }, [status, softDrop, cancelLockTimer, stopSoftDrop, stopDAS]);

  useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status === 'over') writeBest(best);
  }, [status, best]);

  // While the game is running, claim the shared key-capture flag so the global
  // radio shortcuts (space/arrows) don't fire from Tetris controls.
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        if (status === 'playing' || status === 'paused') {
          e.preventDefault();
          togglePause();
        }
        return;
      }
      if (status === 'idle') {
        const startKeys = [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          ' ',
        ];
        if (startKeys.includes(e.key)) {
          e.preventDefault();
          reset();
        }
        return;
      }
      if (status !== 'playing') return;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          startDAS(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          startDAS(1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          startSoftDrop();
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') stopSoftDrop();
      if (e.key === 'ArrowLeft' && dasDir.current === -1) stopDAS();
      if (e.key === 'ArrowRight' && dasDir.current === 1) stopDAS();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
      stopSoftDrop();
      stopDAS();
    };
  }, [
    open,
    status,
    reset,
    togglePause,
    tryMove,
    softDrop,
    startSoftDrop,
    stopSoftDrop,
    startDAS,
    stopDAS,
    rotate,
    hardDrop,
  ]);

  const touchStart = useRef<Point | null>(null);

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
    touchStart.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX && Math.abs(dy) < SWIPE_THRESHOLD_PX) {
      rotate();
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      tryMove(dx > 0 ? 1 : -1, 0);
    } else if (dy > 0) {
      hardDrop();
    } else {
      rotate();
    }
  };

  const display = board.map((row) => [...row]);
  const ghostKeys = new Set<number>();
  if (piece) {
    // Ghost: where the piece would land, outlined by the render.
    let drop = 0;
    while (!collides(board, { ...piece, y: piece.y + drop + 1 })) drop++;
    if (drop > 0) {
      for (const { x, y } of cellsOf({ ...piece, y: piece.y + drop })) {
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) ghostKeys.add(y * COLS + x);
      }
    }
    for (const { x, y } of cellsOf(piece)) {
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
        display[y][x] = piece.id;
        ghostKeys.delete(y * COLS + x);
      }
    }
  }

  const clearingSet = new Set(clearingRows);
  const cellClass = (i: number, cell: Cell): string => {
    if (clearingSet.has(Math.floor(i / COLS))) return 'bg-white dark:bg-white animate-pulse';
    if (cell === 0 && ghostKeys.has(i)) return 'bg-gray-200/60 dark:bg-white/10';
    return CELL_COLORS[cell];
  };

  // Normalize the preview piece to the top-left of its box so it left-aligns
  // under the label.
  const rawNext = cellsOf({ id: nextId, rotation: 0, x: 0, y: 0 });
  const minX = Math.min(...rawNext.map((c) => c.x));
  const minY = Math.min(...rawNext.map((c) => c.y));
  const nextKeys = new Set(rawNext.map((c) => (c.y - minY) * 4 + (c.x - minX)));

  return (
    <section className="flex flex-col gap-4 items-center">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-[12px] font-semibold text-gray-600 hover:text-gray-900 dark:tk-body dark:hover:tk-heading transition-colors"
      >
        {t('tetris_title')} {open ? '↑' : '↓'}
      </button>

      {open && (
        <div className="flex flex-col gap-3 items-center w-full max-w-xs">
          <div className="relative flex justify-center w-full">
            <div className="relative">
              <div
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                className="grid w-40 border border-gray-200 gap-px bg-gray-100 dark:tk-border dark:tk-surface touch-none"
                style={{
                  aspectRatio: `${COLS} / ${ROWS}`,
                  gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                }}
              >
                {display.flat().map((cell, i) => (
                  <div key={i} className={cellClass(i, cell)} />
                ))}
              </div>

              {status === 'paused' && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/50">
                  <span className="text-[11px] font-semibold text-gray-700 dark:tk-heading">
                    {t('tetris_paused')}
                  </span>
                </div>
              )}

              {/* Preview floats just right of the board (out of flow) so the
                  board itself stays centered in the container. */}
              <div className="absolute left-full top-0 ml-4 flex w-12 flex-col items-start gap-1">
                {(status === 'playing' || status === 'paused') && (
                  <>
                    <span className="text-[9px] uppercase tracking-wide text-gray-400 dark:tk-muted">
                      {t('tetris_next')}
                    </span>
                    <div
                      className="grid w-12 gap-px"
                      style={{
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gridTemplateRows: 'repeat(4, 1fr)',
                      }}
                    >
                      {Array.from({ length: 16 }, (_, i) => (
                        <div
                          key={i}
                          className={`aspect-square ${
                            nextKeys.has(i) ? CELL_COLORS[nextId] : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex flex-col items-center gap-0.5 text-[11px] text-gray-500 dark:tk-body">
              <span className="whitespace-nowrap">
                {t('tetris_score')}: {score} · {t('tetris_lines')}: {lines}
              </span>
              <span className="whitespace-nowrap">
                {t('tetris_level')}: {level} · {t('tetris_time')}:{' '}
                {formatTime(elapsed)} · {t('tetris_best')}: {best}
              </span>
            </span>

            {status === 'idle' && (
              <button onClick={() => reset()} className={START_BUTTON_CLASS}>
                {t('tetris_play')}
              </button>
            )}

            {(status === 'playing' || status === 'paused') && (
              <button
                onClick={togglePause}
                className="text-[10px] text-gray-300 hover:text-gray-600 transition-colors underline"
              >
                {status === 'paused' ? t('tetris_resume') : t('tetris_pause')}
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
                  {isNewBest ? t('tetris_new_best') : t('tetris_game_over')}
                </span>
                <button onClick={() => reset()} className={START_BUTTON_CLASS}>
                  {t('tetris_again')}
                </button>
                <button
                  onClick={handleShare}
                  className="text-[10px] text-gray-300 hover:text-gray-600 dark:tk-muted dark:hover:tk-body transition-colors underline"
                >
                  {copied ? t('tetris_copied') : t('tetris_share')}
                </button>
              </>
            )}

            <div className="group relative mt-1">
              <button
                onClick={() => setShowHelp((h) => !h)}
                aria-label={t('tetris_controls')}
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
                {HELP_ROWS.map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="flex gap-1.5">
                      {row.keys.map((k) => (
                        <Key key={k}>{k}</Key>
                      ))}
                    </span>
                    <span className="text-[9px] uppercase tracking-wide">
                      {t(row.label)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
