import { LastfmPublicSession } from '@/app/_types';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

type StartAuthResponse = {
  token: string;
  authUrl: string;
};

type SessionResponse = {
  session: LastfmPublicSession | null;
};

export function useLastfm() {
  const [session, setSession] = useState<LastfmPublicSession | null>(null);
  const [pending, setPending] = useState(false);
  const pendingToken = useRef<string | null>(null);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    axios.get<SessionResponse>('/api/lastfm/session')
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null));
  }, []);

  function stopPolling() {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
  }

  async function connect() {
    const { data } = await axios.post<StartAuthResponse>('/api/lastfm/start');

    pendingToken.current = data.token;
    setPending(true);
    window.open(data.authUrl, '_blank');

    pollInterval.current = setInterval(async () => {
      try {
        await confirmToken(true);
      } catch {
        // user hasn't authorized yet — keep polling
      }
    }, 3000);
  }

  async function confirmToken(silent = false) {
    if (!pendingToken.current) return;

    try {
      const { data } = await axios.post<SessionResponse>('/api/lastfm/confirm', {
        token: pendingToken.current,
      });

      stopPolling();
      pendingToken.current = null;
      setPending(false);
      setSession(data.session);
    } catch (error) {
      if (!silent) {
        throw error;
      }
    }
  }

  async function confirm() {
    await confirmToken(false);
  }

  async function disconnect() {
    await axios.post<{ ok: true }>('/api/lastfm/disconnect');
    stopPolling();
    pendingToken.current = null;
    setPending(false);
    setSession(null);
  }

  async function nowPlaying(artist: string, track: string) {
    if (!session) return;
    await axios.post<{ ok: true }>('/api/lastfm/now-playing', { artist, track });
  }

  async function scrobbleTrack(artist: string, track: string, timestamp: number) {
    if (!session) return;
    await axios.post<{ ok: true }>('/api/lastfm/scrobble', { artist, track, timestamp });
  }

  useEffect(() => () => stopPolling(), []);

  return { session, pending, connect, confirm, disconnect, nowPlaying, scrobbleTrack };
}
