'use client';

import dayjs from 'dayjs';

import { useEffect, useState } from 'react';
import { getImageOfTheDay } from '../../services/api/wikipedia';
import { TemplateCard } from './template-card';

type WikiImage = {
  thumbnail: { source: string };
  description?: { text?: string };
  artist?: { text?: string };
  file_page?: string;
};

export function ImageCard() {
  const [image, setImage] = useState<WikiImage | null>(null);

  useEffect(() => {
    const now = dayjs();
    const year = now.year();
    const month = now.format('MM');
    const day = now.format('DD');

    async function fetchImage() {
      try {
        const res = await getImageOfTheDay({ year, month, day });
        setImage(res);
      } catch (error) {
        console.error('Failed to fetch image of the day', error);
      }
    }

    fetchImage();
  }, []);

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
