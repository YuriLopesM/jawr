import { getMusicOfTheDay } from '../../services/music';

import { TemplateCard } from './template-card';

export async function AlbumCard() {
  const { album } = await getMusicOfTheDay();

  return (
    <TemplateCard
      title="álbum do dia"
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
