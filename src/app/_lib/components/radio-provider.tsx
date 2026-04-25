'use client';

import { useKeyboardShortcuts, useMediaSession, useRadio } from '@/hooks';
import { HistoryItem, Song } from '@/app/_types';
import { createContext, useContext } from 'react';

interface RadioContextValue {
  playing: boolean;
  volume: { value: number; isMuted: boolean };
  song: Song | null;
  history: HistoryItem[];
  toggle: () => void;
  toggleMute: () => void;
  changeVolume: (v: number) => void;
}

const RadioContext = createContext<RadioContextValue | null>(null);

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const radio = useRadio();
  useKeyboardShortcuts({
    toggle: radio.toggle,
    toggleMute: radio.toggleMute,
    changeVolume: radio.changeVolume,
    volume: radio.volume.value,
  });
  useMediaSession({
    song: radio.song,
    playing: radio.playing,
    toggle: radio.toggle,
  });
  return <RadioContext.Provider value={radio}>{children}</RadioContext.Provider>;
}

export function useRadioContext(): RadioContextValue {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('useRadioContext must be used inside RadioProvider');
  return ctx;
}
