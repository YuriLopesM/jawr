import { NextResponse } from 'next/server';
import { ArtistInfo } from '@/app/_lib/services/this-or-that';

const API_KEY = process.env.LASTFM_API_KEY!;
const ONE_DAY = 60 * 60 * 24;

// Cache em memória no servidor — persiste entre requisições no mesmo processo
let artistCache: ArtistInfo[] = [];
let cacheExpiresAt = 0;
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 horas

async function fetchTopArtists(): Promise<string[]> {
  const page = Math.floor(Math.random() * 5) + 1;
  const res = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=${API_KEY}&format=json&limit=50&page=${page}`,
    { next: { revalidate: ONE_DAY } }
  );
  const json = await res.json();
  return (json.artists?.artist ?? []).map((a: { name: string }) => a.name).filter(Boolean);
}

async function fetchArtistInfo(name: string): Promise<ArtistInfo> {
  try {
    const res = await fetch(
      `https://www.theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(name)}`,
      { next: { revalidate: ONE_DAY } }
    );
    const json = await res.json();
    const data = json.artists?.[0] ?? null;
    return { name, image: data?.strArtistThumb || data?.strArtistWideThumb || '' };
  } catch {
    return { name, image: '' };
  }
}

async function getArtistPool(): Promise<ArtistInfo[]> {
  if (artistCache.length > 0 && Date.now() < cacheExpiresAt) {
    return artistCache;
  }

  const names = await fetchTopArtists();
  const infos: ArtistInfo[] = [];
  for (let i = 0; i < names.length; i += 25) {
    const batch = names.slice(i, i + 25);
    const results = await Promise.all(batch.map(fetchArtistInfo));
    infos.push(...results);
    if (i + 25 < names.length) await new Promise((r) => setTimeout(r, 2000));
  }

  artistCache = infos.filter((a) => a.image);
  cacheExpiresAt = Date.now() + CACHE_TTL;
  return artistCache;
}

function pickPair(artists: ArtistInfo[]): [ArtistInfo, ArtistInfo] {
  const i = Math.floor(Math.random() * artists.length);
  let j = Math.floor(Math.random() * (artists.length - 1));
  if (j >= i) j++;
  return [artists[i], artists[j]];
}

export async function GET() {
  const pool = await getArtistPool();
  const [a, b] = pickPair(pool);
  return NextResponse.json({ a, b });
}
