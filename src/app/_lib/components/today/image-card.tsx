import dayjs from 'dayjs';

import { ONE_DAY } from '../../helpers/date';
import { TemplateCard } from './template-card';

type WikiImage = {
  thumbnail: { source: string };
  description?: { text?: string };
  artist?: { text?: string };
  file_page?: string;
};

async function fetchImageOfTheDay(
  year: number,
  month: string,
  day: string
): Promise<WikiImage | null> {
  const res = await fetch(
    `https://api.wikimedia.org/feed/v1/wikipedia/pt/featured/${year}/${month}/${day}`,
    { next: { revalidate: ONE_DAY } }
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

export async function ImageCard() {
  const now = dayjs();

  const image = await fetchImageOfTheDay(
    now.year(),
    now.format('MM'),
    now.format('DD')
  );

  if (!image?.thumbnail?.source) return null;

  // const description = image.description?.text ?? '';
  // const artist = image.artist?.text ?? '';

  return (
    <TemplateCard
      title="imagem do dia"
      image={image.thumbnail.source}
      description={{
        title: now.format('D [de] MMMM [de] YYYY, [às] HH:mm'),
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
