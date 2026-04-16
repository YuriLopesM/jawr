import dayjs from 'dayjs';
import { unstable_cache } from 'next/cache';

import { ONE_DAY } from '../../helpers/date';
import { TemplateCard } from './template-card';

type WikiImage = {
  thumbnail: { source: string };
  description?: { text?: string };
  artist?: { text?: string };
  file_page?: string;
};

async function _fetchImageOfTheDay(
  year: number,
  month: string,
  day: string
): Promise<WikiImage | null> {
  const res = await fetch(
    `https://api.wikimedia.org/feed/v1/wikipedia/pt/featured/${year}/${month}/${day}`,
    { cache: 'no-store', headers: { 'Api-User-Agent': 'jawr-radio/1.0' } }
  );

  if (!res.ok) return null;

  const data = await res.json();
  const img = data.image;
  if (!img) return null;

  return {
    thumbnail: { source: img.thumbnail?.source ?? '' },
    description: { text: img.description?.text },
    artist: { text: img.artist?.text },
    file_page: img.file_page,
  };
}

async function fetchImageOfTheDay(): Promise<WikiImage | null> {
  const now = dayjs();
  const year = now.year();
  const month = now.format('MM');
  const day = now.format('DD');
  const cacheKey = `wiki-image-${year}-${month}-${day}`;

  return unstable_cache(
    () => _fetchImageOfTheDay(year, month, day),
    [cacheKey],
    { revalidate: ONE_DAY }
  )();
}

export async function ImageCard() {
  const image = await fetchImageOfTheDay();

  if (!image?.thumbnail?.source) return null;

  const description = image.description?.text ?? '';
  // const artist = image.artist?.text ?? '';

  return (
    <TemplateCard
      title="imagem do dia"
      image={image.thumbnail.source}
      description={{
        title: description,
        // subtitle: artist,
      }}
      source={[
        {
          name: 'wikipedia',
          url: image.file_page ?? 'https://pt.wikipedia.org',
        },
      ]}
    />
  );
}
