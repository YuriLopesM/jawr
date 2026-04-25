'use client';

import { Song } from '@/app/_types';
import { useEffect } from 'react';

interface Options {
  song: Song | null;
  playing: boolean;
  toggle: () => void;
}

const ARTWORK_SIZES = ['96x96', '192x192', '512x512'] as const;
const ALBUM_NAME = 'jawr.';

function buildArtwork(art: string | undefined) {
  if (!art) return [];
  return ARTWORK_SIZES.map((sizes) => ({
    src: art,
    sizes,
    type: 'image/jpeg',
  }));
}

export function useMediaSession({ song, playing, toggle }: Options) {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    if (!song) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title ?? '',
      artist: song.artist ?? '',
      album: ALBUM_NAME,
      artwork: buildArtwork(song.art),
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
