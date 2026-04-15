import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const ONE_DAY = 60 * 60 * 24;

export function getNumberDay() {
  return dayjs().utc().startOf('day').unix() / ONE_DAY;
}

export function timeAgo(playedAt: number): string {
  const playedAtDate = dayjs(playedAt * 1000);

  const diffInSeconds = dayjs().diff(playedAtDate, 'second');
  if (diffInSeconds < 60) return `${diffInSeconds}s atrás`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atrás`;
  return `${Math.floor(diffInSeconds / 3600)}h atrás`;
}
