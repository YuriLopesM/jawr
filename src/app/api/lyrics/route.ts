import { NextRequest, NextResponse } from 'next/server';

type LyricsSource = 'lrclib' | 'genius' | null;

type LyricsResult = {
  synced: string | null;
  plain: string | null;
  instrumental: boolean;
  source: LyricsSource;
  sourceUrl: string | null;
};

const LRCLIB_GET_URL = 'https://lrclib.net/api/get';
const LRCLIB_SEARCH_URL = 'https://lrclib.net/api/search';
const GENIUS_SEARCH_URL = 'https://genius.com/api/search';
const FETCH_TIMEOUT_MS = 6000;
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0';

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

function isHeaderLine(line: string): boolean {
  if (/「.+」\s*歌詞/.test(line)) return true;
  if (/\bLyrics?\s*$/i.test(line) && line.length < 80) return true;
  if (/^\[?Letra\s+de\s+["“”'].+["“”']\]?\s*$/i.test(line) && line.length < 80)
    return true;
  if (/^\d+\s+Contributors?\b/i.test(line)) return true;
  if (/^\d+\s+Colaboradores?\b/i.test(line)) return true;
  if (/^Read More\s*$/i.test(line)) return true;
  if (/^Ler\s+Mais\s*$/i.test(line)) return true;
  return false;
}

function htmlToPlainLyrics(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => !isHeaderLine(l))
    .filter((l, i, arr) => !(l === '' && arr[i - 1] === ''))
    .join('\n')
    .trim();
}

function extractBalancedDiv(
  html: string,
  startIdx: number
): { content: string; endIdx: number } | null {
  const openTagEnd = html.indexOf('>', startIdx);
  if (openTagEnd === -1) return null;
  let depth = 1;
  let i = openTagEnd + 1;
  const divOpen = /<div\b/gi;
  const divClose = /<\/div\s*>/gi;
  while (depth > 0) {
    divOpen.lastIndex = i;
    divClose.lastIndex = i;
    const openMatch = divOpen.exec(html);
    const closeMatch = divClose.exec(html);
    if (!closeMatch) return null;
    if (openMatch && openMatch.index < closeMatch.index) {
      depth += 1;
      i = openMatch.index + openMatch[0].length;
    } else {
      depth -= 1;
      i = closeMatch.index + closeMatch[0].length;
      if (depth === 0) {
        return {
          content: html.slice(openTagEnd + 1, closeMatch.index),
          endIdx: i,
        };
      }
    }
  }
  return null;
}

function stripDivsMatching(html: string, startRe: RegExp): string {
  let out = html;
  let m: RegExpExecArray | null;
  while ((m = startRe.exec(out)) !== null) {
    const block = extractBalancedDiv(out, m.index);
    if (!block) break;
    out = out.slice(0, m.index) + out.slice(block.endIdx);
    startRe.lastIndex = m.index;
  }
  return out;
}

function stripHeaders(html: string): string {
  let out = stripDivsMatching(
    html,
    /<div[^>]*class="[^"]*LyricsHeader[^"]*"[^>]*>/gi
  );
  out = stripDivsMatching(
    out,
    /<div[^>]*data-exclude-from-selection="true"[^>]*>/gi
  );
  return out;
}

function extractLyricsContainers(html: string): string {
  const cleaned = stripHeaders(html);
  const startRe = /<div[^>]*data-lyrics-container="true"[^>]*>/gi;
  const parts: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = startRe.exec(cleaned)) !== null) {
    const block = extractBalancedDiv(cleaned, m.index);
    if (!block) break;
    parts.push(stripHeaders(block.content));
    startRe.lastIndex = block.endIdx;
  }
  return parts.join('<br>');
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
    .split(/[;,&/]|\s+(?:feat\.?|ft\.?|featuring|with)\s+/i)[0]
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

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = new Array<number>(b.length + 1);
  let curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

function similarity(a: string, b: string): number {
  if (!a && !b) return 1;
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  return 1 - levenshtein(a, b) / max;
}

const FUZZY_THRESHOLD = 0.75;
const DURATION_PENALTY_DIVISOR = 600;

function fuzzyMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a.includes(b) || b.includes(a)) return true;
  return similarity(a, b) >= FUZZY_THRESHOLD;
}

type HitScore = { passes: boolean; sim: number };

function scoreHit(
  normArtist: string,
  normTrack: string,
  hitArtist: string,
  hitTrack: string
): HitScore {
  const ha = normalizeForCompare(hitArtist);
  const ht = normalizeForCompare(hitTrack);
  if (!fuzzyMatch(normArtist, ha) || !fuzzyMatch(normTrack, ht)) {
    return { passes: false, sim: 0 };
  }
  return {
    passes: true,
    sim: (similarity(normArtist, ha) + similarity(normTrack, ht)) / 2,
  };
}

async function fetchGenius(
  artist: string,
  track: string
): Promise<LyricsResult> {
  const t = withTimeout(FETCH_TIMEOUT_MS);
  try {
    const queryArtist = cleanArtist(artist);
    const queryTrack = cleanTrack(track);
    const searchUrl = `${GENIUS_SEARCH_URL}?q=${encodeURIComponent(`${queryArtist} ${queryTrack}`)}`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': BROWSER_UA },
      signal: t.signal,
    });

    if (!searchRes.ok) return EMPTY;
    const ct = searchRes.headers.get('content-type') ?? '';
    if (!ct.includes('json')) return EMPTY;

    const searchData = (await searchRes.json()) as {
      response?: {
        hits?: Array<{
          type?: string;
          result?: {
            url?: string;
            title?: string;
            primary_artist?: { name?: string };
          };
        }>;
      };
    };

    const normArtist = normalizeForCompare(queryArtist);
    const normTrack = normalizeForCompare(queryTrack);
    let pageUrl: string | undefined;
    let bestSim = -Infinity;
    for (const hit of searchData.response?.hits ?? []) {
      if (hit.type !== 'song' || !hit.result?.url) continue;
      const { passes, sim } = scoreHit(
        normArtist,
        normTrack,
        hit.result.primary_artist?.name ?? '',
        hit.result.title ?? ''
      );
      if (!passes) continue;
      if (sim > bestSim) {
        bestSim = sim;
        pageUrl = hit.result.url;
        if (sim === 1) break;
      }
    }
    if (!pageUrl) return EMPTY;

    const pageRes = await fetch(pageUrl, {
      headers: { 'User-Agent': BROWSER_UA },
      signal: t.signal,
    });
    if (!pageRes.ok) return EMPTY;

    const html = await pageRes.text();
    const inner = extractLyricsContainers(html);
    if (!inner) return EMPTY;

    const plain = htmlToPlainLyrics(inner);
    if (!plain) return EMPTY;

    return {
      synced: null,
      plain,
      instrumental: false,
      source: 'genius',
      sourceUrl: pageUrl,
    };
  } catch {
    return EMPTY;
  } finally {
    t.clear();
  }
}

// Returns null when lrclib failed (network/timeout). Returns EMPTY when lrclib
// responded but had no usable synced lyrics. Distinction matters: null skips
// caching to allow retry; EMPTY falls through to Genius and gets cached.
async function fetchLrclibSynced(
  artist: string,
  track: string,
  duration: string | null
): Promise<LyricsResult | null> {
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
      headers: { 'User-Agent': BROWSER_UA },
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
      if (data.syncedLyrics) {
        return {
          synced: data.syncedLyrics,
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
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        signal: t.signal,
      }
    );

    if (!searchRes.ok) return null;

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
    let bestScore = -Infinity;
    for (const h of hits) {
      if (!h.syncedLyrics) continue;
      const { passes, sim } = scoreHit(
        normArtist,
        normTrack,
        h.artistName ?? '',
        h.trackName ?? ''
      );
      if (!passes) continue;
      const delta =
        targetDur !== null && h.duration !== undefined
          ? Math.abs(h.duration - targetDur)
          : 0;
      const score = sim - delta / DURATION_PENALTY_DIVISOR;
      if (score > bestScore) {
        best = h;
        bestScore = score;
      }
    }

    if (!best?.syncedLyrics) return EMPTY;
    return {
      synced: best.syncedLyrics,
      plain: best.plainLyrics ?? null,
      instrumental: false,
      source: 'lrclib',
      sourceUrl: best.id ? `https://lrclib.net/lyrics/${best.id}` : null,
    };
  } catch {
    return null;
  } finally {
    t.clear();
  }
}

async function fetchLyrics(
  artist: string,
  track: string,
  duration: string | null
): Promise<LyricsResult> {
  const lrclib = await fetchLrclibSynced(artist, track, duration);
  if (lrclib === null) {
    const genius = await fetchGenius(artist, track);
    if (genius.plain) return genius;
    throw new Error('lyrics fetch failed');
  }
  if (lrclib.synced || lrclib.instrumental) return lrclib;
  const genius = await fetchGenius(artist, track);
  if (genius.plain) return genius;
  throw new Error('lyrics not found');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const artist = searchParams.get('artist')?.trim();
  const track = searchParams.get('track')?.trim();
  const duration = searchParams.get('duration')?.trim() || null;

  if (!artist || !track) {
    return NextResponse.json(EMPTY, { status: 400 });
  }

  try {
    const result = await fetchLyrics(artist, track, duration);
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=2592000',
      },
    });
  } catch {
    return NextResponse.json(EMPTY, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
