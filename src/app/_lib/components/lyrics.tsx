'use client';

import { useLyrics, type LyricsStatus } from '@/hooks';
import { DEFAULT_OFFSET_MS, useLyricsStore } from '@/stores/lyrics-store';
import { useRadioStore } from '@/stores/radio-store';
import { LrcLine } from '@/app/_lib/helpers/lrc';
import {
  ArrowCounterClockwiseIcon,
  ArrowSquareOutIcon,
  GearSixIcon,
  MusicNotesIcon,
  ScrollIcon,
  XIcon,
} from '@phosphor-icons/react';
import { useT } from 'next-i18next/client';
import { ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { findActiveIndex } from '../helpers/lrc';
import { useRadioContext } from '../context';

const TICK_MS = 250;
const SNAP_POINTS: readonly number[] = [30, 60, 90];
const SECTION_RE = /^\[.+\]$/;
const CLOSE_ANIMATION_NAMES = ['lyrics-slide-down', 'lyrics-slide-right'] as const;

function useNow(active: boolean, intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
  return now;
}

function snapToNearest(vh: number, points: readonly number[]): number {
  let nearest = points[0];
  let bestDelta = Math.abs(vh - nearest);
  for (const p of points) {
    const d = Math.abs(vh - p);
    if (d < bestDelta) {
      nearest = p;
      bestDelta = d;
    }
  }
  return nearest;
}

function useDragResizeVertical(
  currentVh: number,
  onChange: (vh: number) => void,
  onCommit: (vh: number) => void
) {
  return (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startY = e.clientY;
    const startVh = currentVh;
    const vhPx = window.innerHeight / 100;
    let lastVh = startVh;
    const onMove = (ev: PointerEvent) => {
      lastVh = startVh + (startY - ev.clientY) / vhPx;
      onChange(lastVh);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.style.userSelect = '';
      onCommit(lastVh);
    };
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };
}

function SkeletonLines() {
  const widths = ['85%', '70%', '92%', '60%', '78%', '88%', '65%', '80%'];
  return (
    <ul
      className="flex flex-col gap-3 animate-pulse"
      aria-label="loading lyrics"
    >
      {widths.map((w, i) => (
        <li
          key={i}
          className="h-3 rounded bg-gray-200 dark:tk-border"
          style={{ width: w }}
        />
      ))}
    </ul>
  );
}

type LyricsSettingsProps = {
  offsetMs: number;
  autoscroll: boolean;
  onOffsetChange: (ms: number) => void;
  onOffsetReset: () => void;
  onAutoscrollToggle: () => void;
};

function LyricsSettings({
  offsetMs,
  autoscroll,
  onOffsetChange,
  onOffsetReset,
  onAutoscrollToggle,
}: LyricsSettingsProps) {
  const { t } = useT('listen');
  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] uppercase tracking-widest text-gray-500 dark:tk-muted shrink-0">
        {t('lyrics_offset')}
      </label>
      <input
        type="range"
        min={-5}
        max={5}
        step={0.5}
        value={offsetMs / 1000}
        onChange={(e) => onOffsetChange(Number(e.target.value) * 1000)}
        className="flex-1 cursor-pointer"
        style={{ accentColor: 'var(--dk-accent)' }}
        aria-label={t('lyrics_offset')}
      />
      <span className="text-xs text-gray-500 dark:tk-muted tabular-nums w-12 text-right">
        {(offsetMs / 1000).toFixed(1)}s
      </span>
      <button
        onClick={onOffsetReset}
        className="p-1 text-gray-400 dark:tk-muted hover:text-gray-900 dark:hover:tk-heading cursor-pointer"
        aria-label={t('lyrics_offset_reset')}
        title={t('lyrics_offset_reset')}
      >
        <ArrowCounterClockwiseIcon size={14} />
      </button>
      <button
        onClick={onAutoscrollToggle}
        className={
          autoscroll
            ? 'p-1 text-(--dk-accent,#111) cursor-pointer'
            : 'p-1 text-gray-400 dark:tk-muted hover:text-gray-900 dark:hover:tk-heading cursor-pointer'
        }
        aria-label={t('lyrics_autoscroll')}
        aria-pressed={autoscroll}
        title={t('lyrics_autoscroll')}
      >
        <ScrollIcon size={14} weight={autoscroll ? 'fill' : 'regular'} />
      </button>
    </div>
  );
}

const sectionLineClass =
  'mt-6 mb-1 pb-1 border-b border-gray-200 dark:tk-border text-[11px] uppercase tracking-widest font-semibold text-gray-600 dark:tk-body first:mt-0';

function PlainLyrics({ plain }: { plain: string }) {
  return (
    <ul className="flex flex-col gap-1">
      {plain.split('\n').map((raw, i) => {
        const line = raw.trim();
        if (line === '') return <li key={i} className="h-3" aria-hidden />;
        const isSection = SECTION_RE.test(line);
        return (
          <li
            key={i}
            className={
              isSection
                ? sectionLineClass
                : 'text-sm text-gray-700 dark:tk-body leading-snug'
            }
          >
            {isSection ? line.slice(1, -1) : line}
          </li>
        );
      })}
    </ul>
  );
}

type SyncedLyricsProps = {
  lines: LrcLine[];
  activeIdx: number;
  lineRefs: RefObject<Array<HTMLLIElement | null>>;
};

function SyncedLyrics({ lines, activeIdx, lineRefs }: SyncedLyricsProps) {
  return (
    <ul className="flex flex-col gap-2">
      {lines.map((line, i) => {
        const isActive = i === activeIdx;
        const text = line.text.trim();
        const isSection = SECTION_RE.test(text);
        return (
          <li
            key={`${line.timeMs}-${i}`}
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
            className={
              isSection
                ? sectionLineClass
                : isActive
                  ? 'text-base font-semibold text-(--dk-accent,#111) transition-colors'
                  : 'text-sm text-gray-500 dark:tk-muted transition-colors'
            }
          >
            {isSection ? text.slice(1, -1) : line.text || ' '}
          </li>
        );
      })}
    </ul>
  );
}

export function Lyrics() {
  const { song, playing } = useRadioContext();
  const { duration, songStartedAt } = useRadioStore(
    useShallow((s) => ({
      duration: s.duration,
      songStartedAt: s.songStartedAt,
    }))
  );
  const {
    enabled,
    offsetMs,
    autoscroll,
    mobileHeightVh,
    setEnabled,
    setOffsetMs,
    setAutoscroll,
    setMobileHeightVh,
  } = useLyricsStore(
    useShallow((s) => ({
      enabled: s.enabled,
      offsetMs: s.offsetMs,
      autoscroll: s.autoscroll,
      mobileHeightVh: s.mobileHeightVh,
      setEnabled: s.setEnabled,
      setOffsetMs: s.setOffsetMs,
      setAutoscroll: s.setAutoscroll,
      setMobileHeightVh: s.setMobileHeightVh,
    }))
  );
  const { t } = useT('listen');

  const { status, lines, plain, source, sourceUrl } = useLyrics(
    song,
    duration,
    enabled
  );

  const lineRefs = useRef<Array<HTMLLIElement | null>>([]);
  const lastIdxRef = useRef(-1);
  const [showSettings, setShowSettings] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
  };

  const handleAnimationEnd = (event: React.AnimationEvent<HTMLElement>) => {
    if (!closing) return;
    if (!CLOSE_ANIMATION_NAMES.includes(event.animationName as typeof CLOSE_ANIMATION_NAMES[number])) return;
    setEnabled(false);
    setClosing(false);
  };

  const tickActive =
    enabled && playing && status === 'found' && songStartedAt !== null;
  const now = useNow(tickActive, TICK_MS);

  const positionMs =
    songStartedAt !== null ? now - songStartedAt + offsetMs : 0;
  const activeIdx =
    status === 'found' ? findActiveIndex(lines, positionMs) : -1;

  useEffect(() => {
    if (!autoscroll) return;
    if (activeIdx < 0 || activeIdx === lastIdxRef.current) return;
    lastIdxRef.current = activeIdx;
    const el = lineRefs.current[activeIdx];
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeIdx, autoscroll]);

  const startResizeHeight = useDragResizeVertical(
    mobileHeightVh,
    setMobileHeightVh,
    (vh) => setMobileHeightVh(snapToNearest(vh, SNAP_POINTS))
  );

  if (!enabled) return null;

  const statusContent: Partial<Record<LyricsStatus, ReactNode>> = {
    loading: <SkeletonLines />,
    missing: (
      <p className="text-sm text-gray-400 dark:tk-muted">
        {t('lyrics_missing')}
      </p>
    ),
    instrumental: (
      <p className="flex items-center gap-2 text-sm text-gray-400 dark:tk-muted">
        <MusicNotesIcon size={18} weight="fill" />
        {t('lyrics_instrumental')}
      </p>
    ),
    'plain-only': plain ? <PlainLyrics plain={plain} /> : null,
    found: (
      <SyncedLyrics lines={lines} activeIdx={activeIdx} lineRefs={lineRefs} />
    ),
  };

  const sourceLabel =
    source === 'lrclib' ? 'lrclib' : source === 'genius' ? 'genius' : null;
  const sourceHref =
    source === 'lrclib'
      ? 'https://lrclib.net/'
      : (sourceUrl ?? 'https://genius.com/');

  return (
    <aside
      className={`lyrics-panel${closing ? ' is-closing' : ''} fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:top-0 sm:bottom-0 z-40 flex flex-col bg-(--dk-surface,#fafafa) border-t sm:border-t-0 sm:border-l border-gray-200 dark:tk-border h-(--lyrics-h) sm:h-full sm:w-80 shadow-lg font-sans transition-[height] duration-150 ease-out sm:transition-none`}
      style={
        {
          ['--lyrics-h' as string]: `${mobileHeightVh}vh`,
        } as React.CSSProperties
      }
      aria-label={t('lyrics_panel_label')}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        onPointerDown={startResizeHeight}
        className="sm:hidden flex items-center justify-center h-4 cursor-ns-resize touch-none shrink-0"
        aria-hidden
      >
        <span className="block w-10 h-1 rounded-full bg-gray-300 dark:tk-border" />
      </div>
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:tk-border shrink-0">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:tk-muted">
          {t('lyrics_label')}
        </p>
        <div className="flex items-center gap-1">
          {status === 'found' && (
            <button
              onClick={() => setShowSettings((s) => !s)}
              className={
                showSettings
                  ? 'p-1 text-(--dk-accent,#111) cursor-pointer'
                  : 'p-1 text-gray-500 dark:tk-muted hover:text-gray-900 dark:hover:tk-heading cursor-pointer'
              }
              aria-label={t('lyrics_settings')}
              aria-expanded={showSettings}
              title={t('lyrics_settings')}
            >
              <GearSixIcon size={18} weight={showSettings ? 'fill' : 'regular'} />
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-1 text-gray-500 dark:tk-muted hover:text-gray-900 dark:hover:tk-heading cursor-pointer shrink-0"
            aria-label={t('lyrics_close')}
          >
            <XIcon size={18} />
          </button>
        </div>
      </header>

      {status === 'found' && showSettings && (
        <div className="px-4 py-2 border-b border-gray-200 dark:tk-border shrink-0">
          <LyricsSettings
            offsetMs={offsetMs}
            autoscroll={autoscroll}
            onOffsetChange={setOffsetMs}
            onOffsetReset={() => setOffsetMs(DEFAULT_OFFSET_MS)}
            onAutoscrollToggle={() => setAutoscroll(!autoscroll)}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto pl-4 pr-8 py-6">
        {song?.title && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:tk-heading leading-tight">
              {song.title}
            </h2>
            {song.artist && (
              <p className="mt-1 text-sm text-gray-500 dark:tk-muted">
                {song.artist}
              </p>
            )}
          </div>
        )}
        {statusContent[status]}
      </div>

      {sourceLabel && (
        <footer className="flex items-center px-4 py-2 border-t border-gray-200 dark:tk-border shrink-0">
          <a
            href={sourceHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gray-400 dark:tk-muted hover:text-gray-900 dark:hover:tk-heading transition-colors"
          >
            via {sourceLabel}
            <ArrowSquareOutIcon size={12} />
          </a>
        </footer>
      )}
    </aside>
  );
}
