import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LyricsStore = {
  enabled: boolean;
  offsetMs: number;
  autoscroll: boolean;
  mobileHeightVh: number;
  setEnabled: (enabled: boolean) => void;
  setOffsetMs: (offsetMs: number) => void;
  setAutoscroll: (autoscroll: boolean) => void;
  setMobileHeightVh: (vh: number) => void;
  toggle: () => void;
};

export const DEFAULT_OFFSET_MS = -1000;
export const DEFAULT_HEIGHT_VH = 60;

const HEIGHT_MIN_VH = 25;
const HEIGHT_MAX_VH = 90;

function clampHeight(v: number) {
  return Math.max(HEIGHT_MIN_VH, Math.min(HEIGHT_MAX_VH, v));
}

const OFFSET_MIN = -5000;
const OFFSET_MAX = 5000;

function clampOffset(v: number) {
  return Math.max(OFFSET_MIN, Math.min(OFFSET_MAX, v));
}

export const useLyricsStore = create<LyricsStore>()(
  persist(
    (set, get) => ({
      enabled: false,
      offsetMs: DEFAULT_OFFSET_MS,
      autoscroll: true,
      mobileHeightVh: DEFAULT_HEIGHT_VH,
      setEnabled: (enabled) => set({ enabled }),
      setOffsetMs: (offsetMs) => set({ offsetMs: clampOffset(offsetMs) }),
      setAutoscroll: (autoscroll) => set({ autoscroll }),
      setMobileHeightVh: (vh) => set({ mobileHeightVh: clampHeight(vh) }),
      toggle: () => set({ enabled: !get().enabled }),
    }),
    {
      name: 'jawr-lyrics',
      partialize: (s) => ({
        enabled: s.enabled,
        offsetMs: s.offsetMs,
        autoscroll: s.autoscroll,
        mobileHeightVh: s.mobileHeightVh,
      }),
    }
  )
);
