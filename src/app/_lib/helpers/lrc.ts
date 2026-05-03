export type LrcLine = {
  timeMs: number;
  text: string;
};

const TIMESTAMP_RE = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
const METADATA_TAGS = new Set([
  'ar',
  'ti',
  'al',
  'au',
  'by',
  'la',
  'length',
  'offset',
  're',
  've',
]);

export function parseLrc(raw: string): LrcLine[] {
  if (!raw) return [];

  const lines: LrcLine[] = [];

  for (const rawLine of raw.split(/\r?\n/)) {
    const metaMatch = rawLine.match(/^\[([a-zA-Z]+):/);
    if (metaMatch && METADATA_TAGS.has(metaMatch[1].toLowerCase())) continue;

    const stamps: number[] = [];
    let lastIndex = 0;
    TIMESTAMP_RE.lastIndex = 0;
    let m: RegExpExecArray | null;

    while ((m = TIMESTAMP_RE.exec(rawLine)) !== null) {
      const min = Number(m[1]);
      const sec = Number(m[2]);
      const fracRaw = m[3] ?? '0';
      const frac = Number(fracRaw.padEnd(3, '0').slice(0, 3));
      stamps.push(min * 60_000 + sec * 1000 + frac);
      lastIndex = m.index + m[0].length;
    }

    if (stamps.length === 0) continue;

    const text = rawLine.slice(lastIndex).trim();

    for (const timeMs of stamps) {
      lines.push({ timeMs, text });
    }
  }

  lines.sort((a, b) => a.timeMs - b.timeMs);
  return lines;
}

export function findActiveIndex(lines: LrcLine[], positionMs: number): number {
  if (lines.length === 0 || positionMs < lines[0].timeMs) return -1;

  let lo = 0;
  let hi = lines.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >>> 1;
    if (lines[mid].timeMs <= positionMs) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}
