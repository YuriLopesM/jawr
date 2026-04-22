import {
  buildAuthUrl,
  getSession,
  getToken,
  LastfmSession,
  scrobble,
  updateNowPlaying,
} from '@/app/_lib/services/lastfm';
import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'jawr_lastfm_session';

function loadSession(): LastfmSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LastfmSession) : null;
  } catch {
    return null;
  }
}

function saveSession(session: LastfmSession | null) {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useLastfm() {
  const [session, setSession] = useState<LastfmSession | null>(null);
  const [pending, setPending] = useState(false);
  const pendingToken = useRef<string | null>(null);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSession(loadSession());
  }, []);

  function stopPolling() {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
  }

  async function connect() {
    const token = await getToken();
    pendingToken.current = token;
    setPending(true);
    window.open(buildAuthUrl(token), '_blank');

    pollInterval.current = setInterval(async () => {
      try {
        const s = await getSession(pendingToken.current!);
        stopPolling();
        pendingToken.current = null;
        setPending(false);
        setSession(s);
        saveSession(s);
      } catch {
        // user hasn't authorized yet — keep polling
      }
    }, 3000);
  }

  async function confirm() {
    if (!pendingToken.current) return;
    const s = await getSession(pendingToken.current);
    stopPolling();
    pendingToken.current = null;
    setPending(false);
    setSession(s);
    saveSession(s);
  }

  function disconnect() {
    stopPolling();
    pendingToken.current = null;
    setPending(false);
    setSession(null);
    saveSession(null);
  }

  async function nowPlaying(artist: string, track: string) {
    if (!session) return;
    await updateNowPlaying(session.key, artist, track);
  }

  async function scrobbleTrack(artist: string, track: string, timestamp: number) {
    if (!session) return;
    await scrobble(session.key, artist, track, timestamp);
  }

  useEffect(() => () => stopPolling(), []);

  return { session, pending, connect, confirm, disconnect, nowPlaying, scrobbleTrack };
}
