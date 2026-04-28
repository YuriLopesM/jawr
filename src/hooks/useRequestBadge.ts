'use client';

import { useEffect, useState } from 'react';

const POLL_INTERVAL_MS = 10_000;

export function useRequestBadge(songTitle: string | undefined, artist?: string) {
  const [isRequest, setIsRequest] = useState(false);

  useEffect(() => {
    setIsRequest(false);
    if (!songTitle) return;

    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function check() {
      if (cancelled) return;
      try {
        const params = new URLSearchParams({ title: songTitle! });
        if (artist) params.set('artist', artist);
        const res = await fetch(`/api/pedido?${params}`);
        const data = await res.json();
        if (!cancelled && data.isRequest) {
          setIsRequest(true);
          if (interval) clearInterval(interval);
        }
      } catch {
        // ignore
      }
    }

    check();
    interval = setInterval(check, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [songTitle, artist]);

  return isRequest;
}
