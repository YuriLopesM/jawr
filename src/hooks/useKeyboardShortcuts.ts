'use client';

import { useEffect } from 'react';

interface Options {
  toggle: () => void;
  toggleMute: () => void;
  changeVolume: (v: number) => void;
  volume: number;
}

const VOLUME_STEP = 0.05;
const VOLUME_MIN = 0;
const VOLUME_MAX = 1;

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts({
  toggle,
  toggleMute,
  changeVolume,
  volume,
}: Options) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          toggle();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(Math.min(VOLUME_MAX, volume + VOLUME_STEP));
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(Math.max(VOLUME_MIN, volume - VOLUME_STEP));
          break;
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle, toggleMute, changeVolume, volume]);
}
