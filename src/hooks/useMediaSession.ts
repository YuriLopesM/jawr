'use client';

import { Song } from '@/app/_types';
import { useEffect } from 'react';

interface Options {
  song: Song | null;
  playing: boolean;
  toggle: () => void;
}

export function useMediaSession({ song, playing, toggle }: Options) {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    if (!song) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title ?? '',
      artist: song.artist ?? '',
      album: 'jawr.',
      artwork: song.art
        ? [
            { src: song.art, sizes: '96x96', type: 'image/jpeg' },
            { src: song.art, sizes: '192x192', type: 'image/jpeg' },
            { src: song.art, sizes: '512x512', type: 'image/jpeg' },
          ]
        : [],
    });
  }, [song?.title, song?.artist, song?.art]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';

    navigator.mediaSession.setActionHandler('play', toggle);
    navigator.mediaSession.setActionHandler('pause', toggle);
    navigator.mediaSession.setActionHandler('stop', () => {
      if (playing) toggle();
    });

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('stop', null);
    };
  }, [playing, toggle]);
}
