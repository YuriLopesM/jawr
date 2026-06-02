'use client';

import { useT } from 'next-i18next/client';
import { useEffect, useRef, useState } from 'react';
import { shareOrCopy } from '@/app/_lib/helpers/share';
import type { Puzzle, GuessGame as GuessGameInstance } from '@/app/_lib/services/guess-game';

// Valid Next image widths (images.imageSizes/deviceSizes). Reveal walks up
// these resolutions to animate the depixelation, ending sharp. Only the current
// step is rendered so the browser never fetches a sharper image than the player
// has earned, keeping the answer out of the DOM and network until reveal.
const PIXEL_STEPS = [32, 64, 128, 256];
const STEP_MS = 180;
const FADE_MS = 250;
const COPIED_FEEDBACK_MS = 1500;

function pixelSrc(image: string, w: number): string {
  return `/_next/image?url=${encodeURIComponent(image)}&w=${w}&q=75`;
}

function resultSquares(results: boolean[]): string {
  return results.map((r) => (r ? '🟩' : '⬛')).join('');
}

type Translate = (key: string, opts?: Record<string, unknown>) => string;

function resultMessage(t: Translate, prefix: string, results: boolean[]): string {
  const correct = results.filter(Boolean).length;
  const total = results.length;
  if (correct === 0) return t(`${prefix}_result_none`);
  if (correct === total) return t(`${prefix}_result_perfect`, { total });
  return t(`${prefix}_result`, { correct, total });
}

type Props = {
  game: GuessGameInstance;
  i18nPrefix: string;
  imageClassName: string;
  shareLine: string;
};

export function GuessGame({ game, i18nPrefix, imageClassName, shareLine }: Props) {
  const { t } = useT('home');
  const { MAX_ATTEMPTS, DAILY_LIMIT, getDailyPuzzle, getDailyData, recordResult, getTodayLabel, decadeLabel } = game;

  const [initial] = useState(getDailyData);
  const [open, setOpen] = useState(false);
  const [played, setPlayed] = useState(initial.count);
  const [results, setResults] = useState<boolean[]>(initial.results);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(
    initial.count >= DAILY_LIMIT ? null : getDailyPuzzle(initial.count)
  );
  const [attempts, setAttempts] = useState(0);
  const [guess, setGuess] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [done, setDone] = useState(false);
  const [pixelStep, setPixelStep] = useState(0);
  const [hint, setHint] = useState(false);
  const [fading, setFading] = useState(false);
  const [copied, setCopied] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const limitReached = played >= DAILY_LIMIT;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function animateReveal() {
    clearTimers();
    for (let i = 1; i < PIXEL_STEPS.length; i++) {
      timers.current.push(setTimeout(() => setPixelStep(i), STEP_MS * i));
    }
  }

  function finish(didSolve: boolean) {
    setSolved(didSolve);
    setDone(true);
    animateReveal();
    const data = recordResult(didSolve);
    setPlayed(data.count);
    setResults(data.results);
  }

  function handleGuess(name: string) {
    if (!puzzle || done) return;
    setGuess(name);

    if (name === puzzle.answer) {
      finish(true);
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (nextAttempts >= MAX_ATTEMPTS) finish(false);
  }

  function handleNext() {
    clearTimers();
    const nextIndex = getDailyData().count;
    setFading(true);
    timers.current.push(
      setTimeout(() => {
        setPuzzle(nextIndex >= DAILY_LIMIT ? null : getDailyPuzzle(nextIndex));
        setAttempts(0);
        setGuess(null);
        setSolved(false);
        setDone(false);
        setPixelStep(0);
        setHint(false);
        setFading(false);
      }, FADE_MS)
    );
  }

  function handleSeeResult() {
    clearTimers();
    setPuzzle(null);
  }

  async function handleShare() {
    const squares = resultSquares(results);
    const correct = results.filter(Boolean).length;
    const text = `${shareLine} · ${getTodayLabel()}\n\n${squares} ${correct}/${results.length}`;
    const didCopy = await shareOrCopy(text);
    if (!didCopy) return;
    setCopied(true);
    timers.current.push(
      setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS)
    );
  }

  return (
    <section className="flex flex-col gap-4 items-center">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-[12px] font-semibold text-gray-600 hover:text-gray-900 dark:tk-body dark:hover:tk-heading transition-colors"
      >
        {t(`${i18nPrefix}_title`)} {open ? '↑' : '↓'}
      </button>

      {open && (
        <div className="flex flex-col gap-4 items-center w-full max-w-sm">
          {!puzzle && limitReached && (
            <div className="flex flex-col items-center gap-4 text-center">
              {results.length > 0 && (
                <>
                  <span className="text-2xl tracking-[0.2em] leading-none">
                    {resultSquares(results)}
                  </span>
                  <p className="text-[11px] text-gray-600 dark:tk-body">
                    {resultMessage(t, i18nPrefix, results)}
                  </p>
                  <button
                    onClick={handleShare}
                    className="text-[11px] font-semibold text-gray-700 dark:tk-body hover:text-gray-900 dark:hover:tk-heading underline underline-offset-2 transition-colors"
                  >
                    {copied ? t(`${i18nPrefix}_copied`) : t(`${i18nPrefix}_share`)}
                  </button>
                </>
              )}
              <p className="text-[10px] text-gray-400 dark:tk-muted">
                {t(`${i18nPrefix}_tomorrow`)}
              </p>
            </div>
          )}

          {puzzle && (
            <>
              <div className={imageClassName}>
                {!puzzle.image ? (
                  <div className="w-full h-full bg-gray-100 dark:bg-white/5" />
                ) : (
                  <div
                    className="absolute inset-0 transition-opacity"
                    style={{
                      opacity: fading ? 0 : 1,
                      transitionDuration: `${FADE_MS}ms`,
                    }}
                  >
                    {PIXEL_STEPS.slice(0, pixelStep + 1).map((w, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={w}
                        src={pixelSrc(puzzle.image, w)}
                        alt={done && i === pixelStep ? puzzle.subtitle : ''}
                        aria-hidden={i !== pixelStep}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
                        style={{
                          imageRendering: w < 256 ? 'pixelated' : 'auto',
                          opacity: i <= pixelStep ? 1 : 0,
                          zIndex: i,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 w-full">
                {puzzle.options.map((name) => {
                  const isCorrect = name === puzzle.answer;
                  const isWrongPick = name === guess && !isCorrect;

                  if (!done) {
                    return (
                      <button
                        key={name}
                        onClick={() => handleGuess(name)}
                        className="text-[11px] px-2 py-2 border border-gray-200 dark:border-white/10 text-gray-700 dark:tk-body hover:border-gray-400 dark:hover:border-white/30 cursor-pointer transition-colors leading-tight"
                      >
                        {name}
                      </button>
                    );
                  }

                  return (
                    <div
                      key={name}
                      className={[
                        'text-[11px] px-2 py-2 border leading-tight text-center transition-transform',
                        isCorrect
                          ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 scale-[1.03]'
                          : isWrongPick
                            ? 'border-rose-400 text-rose-600 dark:text-rose-400 line-through'
                            : 'border-gray-100 dark:border-white/5 text-gray-300 dark:tk-muted',
                      ].join(' ')}
                    >
                      {name}
                    </div>
                  );
                })}
              </div>

              {!done &&
                (hint ? (
                  <span className="text-[10px] text-gray-400 dark:tk-muted">
                    {[decadeLabel(puzzle.year), puzzle.genre]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                ) : (
                  <button
                    onClick={() => setHint(true)}
                    className="text-[9px] lowercase text-gray-200 dark:text-white/15 hover:text-gray-500 dark:hover:tk-muted transition-colors"
                  >
                    {t(`${i18nPrefix}_hint`)}
                  </button>
                ))}

              {done && (
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <span className="text-xs text-gray-500 dark:tk-body">
                    {puzzle.subtitle} · {puzzle.year}
                  </span>
                  <span
                    className={[
                      'text-[11px] mt-1',
                      solved
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-500 dark:text-rose-400',
                    ].join(' ')}
                  >
                    {solved ? t(`${i18nPrefix}_correct`) : t(`${i18nPrefix}_wrong`)}
                  </span>
                  <button
                    onClick={limitReached ? handleSeeResult : handleNext}
                    className="text-[10px] text-gray-300 hover:text-gray-600 dark:tk-muted dark:hover:tk-body transition-colors mt-1 underline"
                  >
                    {limitReached
                      ? t(`${i18nPrefix}_see_result`)
                      : t(`${i18nPrefix}_next`)}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
