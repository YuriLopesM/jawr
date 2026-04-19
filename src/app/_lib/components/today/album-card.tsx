import { getT } from 'next-i18next/server';
import { getMusicOfTheDay } from '../../services/music';

import { TemplateCard } from './template-card';

export async function AlbumCard() {
  const { t } = await getT('home');
  const { album } = await getMusicOfTheDay();

  return (
    <TemplateCard
      title={t('album_of_the_day')}
      image={album.image}
      description={{
        title: album.title,
        subtitle: `${album.artist} (${album.year})`,
      }}
      source={[
        {
          name: '1001 albums',
          url: 'https://en.wikipedia.org/wiki/1001_Albums_You_Must_Hear_Before_You_Die',
        },
      ]}
    />
  );
}
