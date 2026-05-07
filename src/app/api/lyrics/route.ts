import { NextRequest, NextResponse } from 'next/server';

type LyricsResult = {
  synced: string | null;
  plain: string | null;
  instrumental: boolean;
  source: 'lrclib' | null;
  sourceUrl: string | null;
};

const LRCLIB_GET_URL = 'https://lrclib.net/api/get';
const LRCLIB_SEARCH_URL = 'https://lrclib.net/api/search';
const FETCH_TIMEOUT_MS = 8000;

const EMPTY: LyricsResult = {
  synced: null,
  plain: null,
  instrumental: false,
  source: null,
  sourceUrl: null,
};

function withTimeout(ms: number) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(id) };
}

function normalizeForCompare(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim();
}

function cleanArtist(artist: string): string {
  return artist
    .split(/[;,]|\s+(?:feat\.?|ft\.?|featuring|with)\s+/i)[0]
    .trim();
}

const TRACK_NOISE_KEYWORDS = [
  'remaster(?:ed)?',
  'remix',
  'live',
  'acoustic',
  'version',
  'edit',
  'mix',
  'mono',
  'stereo',
  'explicit',
  'clean',
  'deluxe',
  'bonus',
  'demo',
  'instrumental',
  'radio',
  'extended',
  'single',
  'album',
  'edition',
  'anniversary',
  'expanded',
  'reissue',
  'feat\\.?',
  'ft\\.?',
  'featuring',
  'with',
];

const HYPHEN_NOISE_KEYWORDS = [
  'remaster(?:ed)?',
  'live',
  'acoustic',
  'version',
  'edit',
  'mix',
  'mono',
  'stereo',
  'demo',
  'instrumental',
  'radio',
  'extended',
];

const BRACKETED_NOISE_RE = new RegExp(
  `\\s*[([][^()\\[\\]]*\\b(?:${TRACK_NOISE_KEYWORDS.join('|')})\\b[^()\\[\\]]*[)\\]]`,
  'gi'
);

const HYPHEN_NOISE_RE = new RegExp(
  `\\s+-\\s+(?:\\d{4}\\s+)?(?:${HYPHEN_NOISE_KEYWORDS.join('|')})\\b.*$`,
  'gi'
);

function cleanTrack(track: string): string {
  return track
    .replace(BRACKETED_NOISE_RE, '')
    .replace(HYPHEN_NOISE_RE, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function matchesHit(
  normArtist: string,
  normTrack: string,
  hitArtist: string,
  hitTrack: string
): boolean {
  return (
    normalizeForCompare(hitArtist) === normArtist &&
    normalizeForCompare(hitTrack) === normTrack
  );
}

async function fetchLrclib(
  artist: string,
  track: string,
  duration: string | null
): Promise<LyricsResult> {
  const t = withTimeout(FETCH_TIMEOUT_MS);
  try {
    const queryArtist = cleanArtist(artist);
    const queryTrack = cleanTrack(track);
    const params = new URLSearchParams({
      artist_name: queryArtist,
      track_name: queryTrack,
    });
    if (duration) params.set('duration', duration);

    const res = await fetch(`${LRCLIB_GET_URL}?${params.toString()}`, {
      signal: t.signal,
    });

    if (res.ok) {
      const data = (await res.json()) as {
        id?: number;
        syncedLyrics?: string | null;
        plainLyrics?: string | null;
        instrumental?: boolean;
      };

      if (data.instrumental) {
        return {
          synced: null,
          plain: null,
          instrumental: true,
          source: 'lrclib',
          sourceUrl: data.id ? `https://lrclib.net/lyrics/${data.id}` : null,
        };
      }
      if (data.syncedLyrics || data.plainLyrics) {
        return {
          synced: data.syncedLyrics ?? null,
          plain: data.plainLyrics ?? null,
          instrumental: false,
          source: 'lrclib',
          sourceUrl: data.id ? `https://lrclib.net/lyrics/${data.id}` : null,
        };
      }
    }

    const searchParams = new URLSearchParams({
      artist_name: queryArtist,
      track_name: queryTrack,
    });
    const searchRes = await fetch(
      `${LRCLIB_SEARCH_URL}?${searchParams.toString()}`,
      { signal: t.signal }
    );

    if (!searchRes.ok) return EMPTY;

    const hits = (await searchRes.json()) as Array<{
      id?: number;
      syncedLyrics?: string | null;
      plainLyrics?: string | null;
      instrumental?: boolean;
      duration?: number;
      artistName?: string;
      trackName?: string;
    }>;

    const targetDur = duration ? Number(duration) : null;
    const normArtist = normalizeForCompare(queryArtist);
    const normTrack = normalizeForCompare(queryTrack);
    let best: (typeof hits)[number] | null = null;
    let bestDelta = Infinity;
    for (const h of hits) {
      if (!h.syncedLyrics && !h.plainLyrics) continue;
      if (
        !matchesHit(normArtist, normTrack, h.artistName ?? '', h.trackName ?? '')
      )
        continue;
      const delta =
        targetDur !== null && h.duration !== undefined
          ? Math.abs(h.duration - targetDur)
          : 0;
      if (delta < bestDelta) {
        best = h;
        bestDelta = delta;
      }
    }

    if (!best || (!best.syncedLyrics && !best.plainLyrics)) return EMPTY;
    return {
      synced: best.syncedLyrics ?? null,
      plain: best.plainLyrics ?? null,
      instrumental: false,
      source: 'lrclib',
      sourceUrl: best.id ? `https://lrclib.net/lyrics/${best.id}` : null,
    };
  } catch {
    return EMPTY;
  } finally {
    t.clear();
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const artist = searchParams.get('artist')?.trim();
  const track = searchParams.get('track')?.trim();
  const duration = searchParams.get('duration')?.trim() || null;

  if (!artist || !track) {
    return NextResponse.json(EMPTY, { status: 400 });
  }

  const result = await fetchLrclib(artist, track, duration);
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': result.source
        ? 'public, max-age=86400, s-maxage=2592000'
        : 'public, max-age=300, s-maxage=3600',
    },
  });
}
