import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

import { getNumberDay } from '../../helpers/date';
import { TemplateCard } from './template-card';

export const ONE_DAY = 60 * 60 * 24;

function getColorFromDay() {
  const day = getNumberDay();

  const h = (day * 137) % 360;
  const s = 45 + (day % 30);
  const l = 40 + (day % 20);

  return { h, s, l };
}

export async function ColorCard() {
  const { h, s, l } = getColorFromDay();

  const res = await fetch(
    `https://www.thecolorapi.com/id?hsl=${h},${s}%25,${l}%25`,
    {
      next: { revalidate: ONE_DAY },
    }
  );

  const data = await res.json();

  const colorName = data.name.value; // e.g. "Medium Aquamarine"
  const hex = data.hex.value; // e.g. "#66CDAA"

  const image = `https://singlecolorimage.com/get/${hex.replace('#', '')}/400x400`;

  return (
    <TemplateCard
      title="cor do dia"
      image={image}
      description={{
        title: colorName,
        subtitle: hex,
      }}
      source={[
        {
          name: 'thecolorapi',
          url: 'https://www.thecolorapi.com/',
        },
      ]}
    />
  );
}
