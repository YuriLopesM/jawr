import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export const ONE_DAY = 60 * 60 * 24;

export const TZ_COOKIE = 'tz';

export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function getNumberDay(tz?: string) {
  const zone = tz || getUserTimezone();
  return Math.floor(dayjs().tz(zone).startOf('day').unix() / ONE_DAY);
}

export function timeAgo(playedAt: number): string {
  const playedAtDate = dayjs(playedAt * 1000);

  const diffInSeconds = dayjs().diff(playedAtDate, 'second');
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
  return `${Math.floor(diffInSeconds / 3600)}h`;
}
