import albumsData from '@/app/_lib/assets/albums.json';
import { createGuessGame } from '@/app/_lib/services/guess-game';

type AlbumEntry = {
  artist: string;
  album: string;
  year: string;
  cover: string;
  genre: string;
};

export const albumGame = createGuessGame<AlbumEntry>({
  entries: albumsData as AlbumEntry[],
  storageKey: 'jawr-guess-album-daily',
  getAnswer: (e) => e.artist,
  getImage: (e) => e.cover,
  getSubtitle: (e) => e.album,
  getYear: (e) => e.year,
  getGenre: (e) => e.genre,
});
