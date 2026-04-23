import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { getT } from 'next-i18next/server';
import { cookies } from 'next/headers';

dayjs.extend(utc);

import { getNumberDay, TZ_COOKIE } from '../../helpers/date';
import { TemplateCard } from './template-card';

export const ONE_DAY = 60 * 60 * 24;

function getColorFromDay(tz?: string) {
  const day = getNumberDay(tz);

  const h = (day * 137) % 360;
  const s = 45 + (day % 30);
  const l = 40 + (day % 20);

  return { h, s, l };
}

export async function ColorCard() {
  const { t } = await getT('home');
  const tz = (await cookies()).get(TZ_COOKIE)?.value;
  const { h, s, l } = getColorFromDay(tz);

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
      title={t('color_of_the_day')}
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
