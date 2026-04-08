import { NextResponse } from 'next/server';

type ArtistInfo = {
  name: string;
  image: string;
};

const API_KEY = process.env.LASTFM_API_KEY!;

// Cache em memória no servidor — persiste entre requisições no mesmo processo
let artistCache: ArtistInfo[] = [];
let cacheExpiresAt = 0;
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 horas

async function fetchTopArtists(): Promise<string[]> {
  const res = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=${API_KEY}&format=json&limit=50&page=1`,
    { next: { revalidate: 86400 } }
  );
  const json = await res.json();
  return (json.artists?.artist ?? []).map((a: { name: string }) => a.name).filter(Boolean);
}

async function fetchArtistInfo(name: string): Promise<ArtistInfo> {
  try {
    const res = await fetch(
      `https://www.theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(name)}`,
      { next: { revalidate: 86400 } }
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
  const infos = await Promise.all(names.map(fetchArtistInfo));

  artistCache = infos;
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
