import { ONE_DAY } from '../../helpers/date';

export const getImageOfTheDay = async ({
  year,
  month,
  day,
}: {
  year: number;
  month: string;
  day: string;
}) => {
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
};
