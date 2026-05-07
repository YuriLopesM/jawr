import { LrcLine, parseLrc } from '@/app/_lib/helpers/lrc';
import { Song } from '@/app/_types';
import { useEffect, useState } from 'react';

export type LyricsStatus =
  | 'idle'
  | 'loading'
  | 'found'
  | 'plain-only'
  | 'instrumental'
  | 'missing';

export type LyricsSource = 'lrclib' | 'genius' | null;

type LyricsState = {
  status: LyricsStatus;
  lines: LrcLine[];
  plain: string | null;
  source: LyricsSource;
  sourceUrl: string | null;
};

type LyricsApiResponse = {
  synced: string | null;
  plain: string | null;
  instrumental: boolean;
  source: LyricsSource;
  sourceUrl: string | null;
};

const EMPTY_API_RESPONSE: LyricsApiResponse = {
  synced: null,
  plain: null,
  instrumental: false,
  source: null,
  sourceUrl: null,
};

function emptyState(status: LyricsStatus): LyricsState {
  return {
    status,
    lines: [],
    plain: null,
    source: null,
    sourceUrl: null,
  };
}

const IDLE = emptyState('idle');
const LOADING = emptyState('loading');

const moduleCache = new Map<string, LyricsState>();

function makeKey(artist: string, title: string) {
  return `${artist.toLowerCase()}|${title.toLowerCase()}`;
}

function initialFor(key: string): LyricsState {
  if (!key) return IDLE;
  return moduleCache.get(key) ?? LOADING;
}

export function useLyrics(
  song: Song | null,
  duration: number | null,
  enabled = true
) {
  const artist = song?.artist?.trim() ?? '';
  const title = song?.title?.trim() ?? '';
  const key = enabled && artist && title ? makeKey(artist, title) : '';

  const [trackedKey, setTrackedKey] = useState(key);
  const [state, setState] = useState<LyricsState>(() => initialFor(key));

  let renderState = state;
  if (key !== trackedKey) {
    renderState = initialFor(key);
    setTrackedKey(key);
    setState(renderState);
  }

  useEffect(() => {
    if (!key) return;
    if (moduleCache.has(key)) return;

    let cancelled = false;
    const params = new URLSearchParams({ artist, track: title });
    if (duration && Number.isFinite(duration)) {
      params.set('duration', String(Math.round(duration)));
    }

    fetch(`/api/lyrics?${params.toString()}`)
      .then((r) => (r.ok ? (r.json() as Promise<LyricsApiResponse>) : EMPTY_API_RESPONSE))
      .then((data: LyricsApiResponse) => {
        if (cancelled) return;
        const lines = data.synced ? parseLrc(data.synced) : [];
        const base = { source: data.source, sourceUrl: data.sourceUrl };
        const next: LyricsState =
          lines.length > 0
            ? { status: 'found', lines, plain: data.plain, ...base }
            : data.plain
              ? { status: 'plain-only', lines: [], plain: data.plain, ...base }
              : data.instrumental
                ? { status: 'instrumental', lines: [], plain: null, ...base }
                : { status: 'missing', lines: [], plain: null, ...base };
        moduleCache.set(key, next);
        setState(next);
      })
      .catch(() => {
        if (cancelled) return;
        const next = emptyState('missing');
        moduleCache.set(key, next);
        setState(next);
      });

    return () => {
      cancelled = true;
    };
  }, [key, artist, title, duration]);

  return renderState;
}
