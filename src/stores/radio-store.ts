import { HistoryItem, Song } from '@/app/_types';
import { create } from 'zustand';

type VolumeState = {
  value: number;
  isMuted: boolean;
};

type RadioStore = {
  playing: boolean;
  volume: VolumeState;
  song: Song | null;
  history: HistoryItem[];
  setPlaying: (playing: boolean) => void;
  setVolume: (volume: VolumeState) => void;
  setSong: (song: Song | null) => void;
  setHistory: (history: HistoryItem[]) => void;
};

export const useRadioStore = create<RadioStore>((set) => ({
  playing: false,
  volume: { value: 0.5, isMuted: false },
  song: null,
  history: [],
  setPlaying: (playing) => set({ playing }),
  setVolume: (volume) => set({ volume }),
  setSong: (song) => set({ song }),
  setHistory: (history) => set({ history }),
}));
