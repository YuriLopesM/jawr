'use client';

import { useEffect } from 'react';
import { getUserTimezone, TZ_COOKIE } from '../helpers/date';

export function TzSetter() {
  useEffect(() => {
    const tz = getUserTimezone();
    const current = document.cookie
      .split('; ')
      .find((c) => c.startsWith(`${TZ_COOKIE}=`))
      ?.split('=')[1];

    if (current === tz) return;

    document.cookie = `${TZ_COOKIE}=${encodeURIComponent(tz)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;

    if (!current) {
      window.location.reload();
    }
  }, []);

  return null;
}
