import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export type ArtistInfo = {
  name: string;
  image: string;
};

export type ArtistVotes = Record<string, number>;

export type DailyData = { date: string; count: number };

export const DAILY_LIMIT = 10;

export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function getTodayStr() {
  return dayjs().tz(getUserTimezone()).format('YYYY-MM-DD');
}

export function getDailyData(): DailyData {
  try {
    const stored = localStorage.getItem('jawr-this-or-that-daily');
    if (!stored) return { date: getTodayStr(), count: 0 };
    const data: DailyData = JSON.parse(stored);
    if (data.date !== getTodayStr()) return { date: getTodayStr(), count: 0 };
    return data;
  } catch {
    return { date: getTodayStr(), count: 0 };
  }
}

export function incrementDailyCount(): DailyData {
  try {
    const data = getDailyData();
    const updated = { ...data, count: data.count + 1 };
    localStorage.setItem('jawr-this-or-that-daily', JSON.stringify(updated));
    return updated;
  } catch {
    return { date: getTodayStr(), count: 0 };
  }
}

export async function fetchPair(): Promise<[ArtistInfo, ArtistInfo]> {
  const res = await fetch('/api/this-or-that');
  const json = await res.json();
  return [json.a, json.b];
}
