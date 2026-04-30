'use client';

import dayjs from 'dayjs';
import { useT } from 'next-i18next/client';

import { useEffect, useState } from 'react';
import { getImageOfTheDay } from '../../services/api/wikipedia';
import { TemplateCard } from './template-card';

type WikiImage = {
  thumbnail: { source: string };
  description?: { text?: string };
  artist?: { text?: string };
  file_page?: string;
};

export function ImageCard({ lang }: { lang: string }) {
  const { t: tHome } = useT('home');
  const [image, setImage] = useState<WikiImage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = dayjs();
    const year = now.year();
    const month = now.format('MM');
    const day = now.format('DD');

    async function fetchImage() {
      try {
        const res = await getImageOfTheDay({ year, month, day, lang });
        setImage(res);
      } catch (error) {
        console.error('Failed to fetch image of the day', error);
      } finally {
        setLoading(false);
      }
    }

    fetchImage();
  }, [lang]);

  if (loading) {
    return (
      <div className="w-full max-w-60 aspect-square border border-gray-100 dark:tk-border p-6 flex flex-col gap-4">
        <div className="h-3 w-24 bg-gray-100 dark:tk-surface animate-pulse" />
        <div className="w-full h-full bg-gray-100 dark:tk-surface animate-pulse" />
        <div className="h-2 w-16 bg-gray-100 dark:tk-surface animate-pulse self-end" />
      </div>
    );
  }

  if (!image?.thumbnail?.source) return null;

  const description = image.description?.text ?? '';
  // const artist = image.artist?.text ?? '';

  return (
    <TemplateCard
      title={tHome('image_of_the_day')}
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
