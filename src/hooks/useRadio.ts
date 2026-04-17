import { getVolumeCookie, setVolumeCookie } from '@/app/_lib/actions/volume';
import { radioAPI } from '@/app/_lib/services/api/radio';
import { HistoryItem, Song } from '@/app/_types';
import { useEffect, useRef, useState } from 'react';

export function useRadio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [playing, setPlaying] = useState(false);

  const [volume, setVolume] = useState<{ value: number; isMuted: boolean } | null>(null);

  const [song, setSong] = useState<Song | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const nowPlaying =
    song === null
      ? '—'
      : song?.artist
        ? `${song.artist} - ${song.title}`
        : (song?.title ?? '—');

  const artist = song?.artist;
  const art = song?.art;

  // Audio element init
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Load volume state from cookie
  useEffect(() => {
    async function loadVolumeState() {
      try {
        const savedState = await getVolumeCookie();
        setVolume(savedState);
        const audio = audioRef.current;
        if (audio) {
          audio.volume = savedState.value;
          audio.muted = savedState.isMuted;
        }
      } catch (error) {
        console.error('Failed to load volume state from cookie', error);
      }
    }
    loadVolumeState();
  }, []);

  // Debounce volume state persistence to cookie — skip until loaded from cookie
  useEffect(() => {
    if (volume === null) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setVolumeCookie(volume).catch((error) => {
        console.error('Failed to save volume state to cookie', error);
      });
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [volume]);

  // Initial REST fetch for instant data
  useEffect(() => {
    radioAPI.get('/nowplaying/jawk').then(({ data }) => {
      setSong(data.now_playing?.song ?? null);
      setHistory((data.song_history as HistoryItem[]) ?? []);
    }).catch(() => {});
  }, []);

  // WebSocket now-playing
  useEffect(() => {
    const wsUrl = `${process.env.NEXT_PUBLIC_AZURACAST_URL?.replace(/^http/, 'ws')}/api/live/nowplaying/websocket`;
    let ws: WebSocket | null = null;
    let reconnectDelay = 1000;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    function parseMessage(raw: string) {
      try {
        const msg = JSON.parse(raw);

        if (msg.connect?.data) {
          for (const item of msg.connect.data) {
            if (item.channel === 'station:jawk' && item.data?.np) {
              const np = item.data.np;
              setSong(np.now_playing?.song ?? null);
              setHistory(np.song_history ?? []);
            }
          }
          return;
        }

        if (msg.channel === 'station:jawk' && msg.pub?.data?.np) {
          const np = msg.pub.data.np;
          setSong(np.now_playing?.song ?? null);
          setHistory(np.song_history ?? []);
        }
      } catch {
        // malformed message — ignore
      }
    }

    function connect() {
      if (destroyed) return;

      const socket = new WebSocket(wsUrl);
      ws = socket;

      socket.onopen = () => {
        reconnectDelay = 1000;
        socket.send(JSON.stringify({ subs: { 'station:jawk': {} } }));
      };

      socket.onmessage = (event) => {
        parseMessage(event.data as string);
      };

      socket.onclose = () => {
        if (destroyed) return;
        reconnectTimer = setTimeout(() => {
          reconnectDelay = Math.min(reconnectDelay * 2, 30000);
          connect();
        }, reconnectDelay);
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connect();

    return () => {
      destroyed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    audio.src = `${process.env.NEXT_PUBLIC_AZURACAST_URL}/listen/jawk/radio.mp3`;
    setPlaying(true);
    audio.play().catch(() => {
      setPlaying(false);
      audio.src = '';
    });
  }

  function changeVolume(v: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = v;
    setVolume((prev) => ({ ...(prev ?? { value: v, isMuted: false }), value: v }));
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    const muted = audio.muted;
    setVolume((prev) => ({ ...(prev ?? { value: audio.volume, isMuted: muted }), isMuted: muted }));
  }

  return {
    playing,
    volume: volume ?? { value: 0.5, isMuted: false },
    nowPlaying,
    artist,
    history,
    art,
    toggle,
    toggleMute,
    changeVolume,
  };
}
