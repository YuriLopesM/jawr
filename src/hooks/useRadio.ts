import { getVolumeCookie, setVolumeCookie } from '@/app/_lib/actions/volume';
import { radioAPI } from '@/app/_lib/services/api/radio';
import { HistoryItem, Song } from '@/app/_types';
import { useEffect, useRef, useState } from 'react';

export function useRadio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [playing, setPlaying] = useState(false);

  const [volume, setVolume] = useState({
    value: 0.5,
    isMuted: false,
  });

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

  // Debounce volume state persistence to cookie
  useEffect(() => {
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

  // API polling
  useEffect(() => {
    async function load() {
      try {
        const { data } = await radioAPI.get('/nowplaying/jawk');
        setSong(data.now_playing.song || null);
        setHistory((data.song_history as HistoryItem[]) || []);
      } catch (error) {
        console.error('Failed to load radio data', error);
      }
    }

    load();
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    if (!playing) {
      audio.src = `${process.env.NEXT_PUBLIC_AZURACAST_URL}/listen/jawk/radio.mp3`;
      setPlaying(true);
      audio.play().catch(() => {
        setPlaying(false);
        audio.src = '';
      });
      return;
    }
  }

  function changeVolume(v: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = v;
    setVolume({ ...volume, value: v });
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setVolume({ ...volume, isMuted: audio.muted });
  }

  return {
    playing,
    volume,
    nowPlaying,
    artist,
    history,
    art,
    toggle,
    toggleMute,
    changeVolume,
  };
}
