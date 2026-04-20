import dayjs from 'dayjs';
import { getT } from 'next-i18next/server';

export async function Greeting() {
  const { t } = await getT('home');

  function getGreeting(): string {
    const hour = dayjs().hour();
    if (hour >= 5 && hour < 12) return t('greeting_morning');
    if (hour >= 12 && hour < 18) return t('greeting_afternoon');
    return t('greeting_evening');
  }

  return (
    <h1 className="text-base text-gray-800 font-bold dark:text-[#f0f0f0]">{getGreeting()},</h1>
  );
}
