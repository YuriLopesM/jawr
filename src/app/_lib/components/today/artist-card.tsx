import { getT } from 'next-i18next/server';
import { getMusicOfTheDay } from '../../services/music';

import { TemplateCard } from './template-card';

export async function ArtistCard() {
  const { t } = await getT('home');
  const { artist } = await getMusicOfTheDay();

  return (
    <TemplateCard
      title={t('artist_of_the_day')}
      image={artist.image}
      description={{
        title: artist.name,
        subtitle: `${artist.genre}`,
      }}
      source={[
        {
          name: '1001 albums',
          url: 'https://en.wikipedia.org/wiki/1001_Albums_You_Must_Hear_Before_You_Die',
        },
        {
          name: 'theaudiodb',
          url: 'https://www.theaudiodb.com/',
        },
      ]}
    />
  );
}
