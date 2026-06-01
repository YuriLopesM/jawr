import moviesData from '@/app/_lib/assets/movies.json';
import { createGuessGame } from '@/app/_lib/services/guess-game';

type MovieEntry = {
  title: string;
  year: string;
  poster: string;
  genre: string;
};

export const movieGame = createGuessGame<MovieEntry>({
  entries: moviesData as MovieEntry[],
  storageKey: 'jawr-guess-movie-daily',
  getAnswer: (e) => e.title,
  getImage: (e) => e.poster,
  getSubtitle: (e) => e.title,
  getYear: (e) => e.year,
  getGenre: (e) => e.genre,
});
