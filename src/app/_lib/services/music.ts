// services/musicOfTheDay.ts
import { getNumberDay } from '@/app/_lib/helpers/date';
import { Album, AlbumsMap } from '@/app/_types';

import albumsData from '@/app/_lib/assets/1001albums.json';

const ONE_DAY = 60 * 60 * 24;

export function pickAlbum(entries: Album[], day: number): Album {
  return entries[day % entries.length];
}

export function pickArtistSeed(entries: Album[], day: number): Album {
  return entries[(day + 500) % entries.length];
}

export function getBestImage(images: Album['images']) {
  return images.find((i) => Math.abs(i.width - 300) < 150);
}

export async function getMusicOfTheDay() {
  const day = getNumberDay();

  const data = albumsData as AlbumsMap;
  const entries = Object.values(data);

  const album = pickAlbum(entries, day);

  const albumArtist = album.artists?.[0]?.name ?? '';
  const albumYear = album.release_date?.slice(0, 4) ?? '';
  const albumImage = getBestImage(album.images)?.url ?? '';

  const artistSeed = pickArtistSeed(entries, day);
  const artistName = artistSeed.artists?.[0]?.name;

  let artistData: any = null;

  if (artistName) {
    try {
      const res = await fetch(
        `https://www.theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(
          artistName
        )}`,
        { next: { revalidate: ONE_DAY } }
      );

      const json = await res.json();
      artistData = json.artists?.[0] ?? null;
    } catch (error) {
      console.log(error);
    }
  }

  return {
    album: {
      title: album.name,
      artist: albumArtist,
      year: albumYear,
      image: albumImage,
    },
    artist: {
      name: artistData?.strArtist ?? artistName ?? 'Unknown',
      genre: artistData?.strGenre ?? '',
      image: artistData?.strArtistThumb || artistData?.strArtistWideThumb || '',
    },
  };
}
