'use client';

import { Song } from '@/app/_types';
import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'jawr_notifications';

function loadPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

function savePreference(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {}
}

function initialPermission(): NotificationPermission {
  if (typeof Notification === 'undefined') return 'default';
  return Notification.permission;
}

function initialEnabled(): boolean {
  if (typeof Notification === 'undefined') return false;
  return Notification.permission === 'granted' ? loadPreference() : false;
}

export function useNotifications(song: Song | null, playing: boolean) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [permission, setPermission] = useState<NotificationPermission>(initialPermission);
  const prevSongRef = useRef<Song | null>(null);

  useEffect(() => {
    const prev = prevSongRef.current;
    prevSongRef.current = song;

    if (!enabled || !playing || !song) return;
    if (!prev) return;
    if (song.title === prev.title && song.artist === prev.artist) return;

    const message = song.artist ? `${song.artist} - ${song.title}` : (song.title ?? '');
    new Notification('jawr', {
      body: message,
      icon: song.art ?? undefined,
    });
  }, [song?.title, song?.artist]);

  async function toggle() {
    if (typeof Notification === 'undefined') return;

    if (permission !== 'granted') {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') return;
      setEnabled(true);
      savePreference(true);
      return;
    }

    const next = !enabled;
    setEnabled(next);
    savePreference(next);
  }

  return { enabled, permission, toggle };
}
