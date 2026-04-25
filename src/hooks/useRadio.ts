import { getVolumeCookie, setVolumeCookie } from '@/app/_lib/actions/volume';
import { radioAPI } from '@/app/_lib/services/api/radio';
import { HistoryItem, Song } from '@/app/_types';
import { useEffect, useRef, useState } from 'react';

const RECONNECT_INITIAL_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15000;
const RECONNECT_MAX_ATTEMPTS = 10;
const STREAM_URL = `${process.env.NEXT_PUBLIC_AZURACAST_URL}/listen/jawr/radio.mp3`;
const DROP_EVENTS = ['error', 'stalled', 'ended'] as const;

export function useRadio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldPlayRef = useRef(false);

  const [playing, setPlaying] = useState(false);

  const [volume, setVolume] = useState<{
    value: number;
    isMuted: boolean;
  } | null>(null);

  const [song, setSong] = useState<Song | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  function clearReconnectTimer() {
    if (!reconnectTimerRef.current) return;
    clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = null;
  }

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;

    function scheduleReconnect() {
      if (!shouldPlayRef.current) return;
      if (reconnectAttemptsRef.current >= RECONNECT_MAX_ATTEMPTS) {
        shouldPlayRef.current = false;
        setPlaying(false);
        return;
      }

      const delay = Math.min(
        RECONNECT_INITIAL_DELAY_MS * 2 ** reconnectAttemptsRef.current,
        RECONNECT_MAX_DELAY_MS
      );
      reconnectAttemptsRef.current += 1;

      clearReconnectTimer();
      reconnectTimerRef.current = setTimeout(() => {
        if (!shouldPlayRef.current) return;
        audio.src = STREAM_URL;
        audio.play().catch(scheduleReconnect);
      }, delay);
    }

    function handleDrop() {
      if (!shouldPlayRef.current) return;
      scheduleReconnect();
    }

    function handlePlaying() {
      reconnectAttemptsRef.current = 0;
      clearReconnectTimer();
    }

    DROP_EVENTS.forEach((evt) => audio.addEventListener(evt, handleDrop));
    audio.addEventListener('playing', handlePlaying);

    return () => {
      clearReconnectTimer();
      DROP_EVENTS.forEach((evt) => audio.removeEventListener(evt, handleDrop));
      audio.removeEventListener('playing', handlePlaying);
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
    radioAPI
      .get('/nowplaying/jawr')
      .then(({ data }) => {
        setSong(data.now_playing?.song ?? null);
        setHistory((data.song_history as HistoryItem[]) ?? []);
      })
      .catch(() => {});
  }, []);

  // WebSocket now-playing
  useEffect(() => {
    const wsUrl = `${process.env.NEXT_PUBLIC_AZURACAST_URL_WS}/api/live/nowplaying/websocket`;
    let ws: WebSocket | null = null;
    let reconnectDelay = 1000;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    function parseMessage(raw: string) {
      try {
        const msg = JSON.parse(raw);

        if (msg.connect?.data) {
          for (const item of msg.connect.data) {
            if (item.channel === 'station:jawr' && item.data?.np) {
              const np = item.data.np;
              setSong(np.now_playing?.song ?? null);
              setHistory(np.song_history ?? []);
            }
          }
          return;
        }

        if (msg.channel === 'station:jawr' && msg.pub?.data?.np) {
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
        socket.send(JSON.stringify({ subs: { 'station:jawr': {} } }));
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

    reconnectAttemptsRef.current = 0;
    clearReconnectTimer();

    if (playing) {
      shouldPlayRef.current = false;
      audio.pause();
      setPlaying(false);
      return;
    }

    shouldPlayRef.current = true;
    audio.src = STREAM_URL;
    setPlaying(true);
    audio.play().catch(() => {
      shouldPlayRef.current = false;
      setPlaying(false);
      audio.src = '';
    });
  }

  function changeVolume(v: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = v;
    setVolume((prev) => ({
      ...(prev ?? { value: v, isMuted: false }),
      value: v,
    }));
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    const muted = audio.muted;
    setVolume((prev) => ({
      ...(prev ?? { value: audio.volume, isMuted: muted }),
      isMuted: muted,
    }));
  }

  return {
    playing,
    volume: volume ?? { value: 0.5, isMuted: false },
    song,
    history,
    toggle,
    toggleMute,
    changeVolume,
  };
}
