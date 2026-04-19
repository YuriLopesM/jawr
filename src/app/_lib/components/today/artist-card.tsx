import { getMusicOfTheDay } from '../../services/music';

import { TemplateCard } from './template-card';

export async function ArtistCard() {
  const { artist } = await getMusicOfTheDay();

  return (
    <TemplateCard
      title="artista do dia"
      image={artist.image}
      description={{
        title: artist.name,
        subtitle: `${artist.genre}`,
      }}
      source={[
        {
          name: '1001 albums',
          shortName: '1001',
          url: 'https://en.wikipedia.org/wiki/1001_Albums_You_Must_Hear_Before_You_Die',
        },
        {
          name: 'theaudiodb',
          shortName: 'audiodb',
          url: 'https://www.theaudiodb.com/',
        },
      ]}
    />
  );
}
