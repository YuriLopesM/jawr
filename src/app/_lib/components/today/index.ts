export * from './template-card';

import { AlbumCard } from './album-card';
import { ArtistCard } from './artist-card';
import { ColorCard } from './color-card';
import { ImageCard } from './image-card';

export const TodayCard = {
  Album: AlbumCard,
  Artist: ArtistCard,
  Color: ColorCard,
  Image: ImageCard,
};
