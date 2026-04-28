const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

type Entry = { request: string; expiresAt: number };

const queue: Entry[] = [];

function purgeExpired() {
  const now = Date.now();
  for (let i = queue.length - 1; i >= 0; i--) {
    if (queue[i].expiresAt <= now) queue.splice(i, 1);
  }
}

export function enqueue(request: string) {
  purgeExpired();
  const norm = normalize(request);
  const alreadyQueued = queue.some((e) => normalize(e.request) === norm);
  if (!alreadyQueued) queue.push({ request, expiresAt: Date.now() + THREE_HOURS_MS });
}

export function checkAndRemove(artist: string, title: string): boolean {
  purgeExpired();
  const idx = queue.findIndex((e) => matches(e.request, artist, title));
  if (idx === -1) return false;
  queue.splice(idx, 1);
  return true;
}

function matches(request: string, artist: string, title: string): boolean {
  const normArtist = normalize(artist);
  const normTitle = normalize(title);

  if (request.includes('-')) {
    const sepIdx = request.indexOf('-');
    const reqArtist = normalize(request.slice(0, sepIdx));
    const reqTitle = normalize(request.slice(sepIdx + 1));
    return fuzzyMatch(reqArtist, normArtist) && fuzzyMatch(reqTitle, normTitle);
  }

  return fuzzyMatch(normalize(request), normTitle);
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function fuzzyMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const tokensA = a.split(' ');
  const tokensB = b.split(' ');
  const longer = tokensA.length >= tokensB.length ? tokensA : tokensB;
  const shorter = tokensA.length < tokensB.length ? tokensA : tokensB;
  const matched = shorter.filter((t) => t.length > 2 && longer.some((u) => u.includes(t) || t.includes(u)));
  return matched.length >= Math.ceil(shorter.length * 0.6);
}
