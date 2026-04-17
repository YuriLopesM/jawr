'use client';

import { MusicNoteIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

const API = `${process.env.NEXT_PUBLIC_AZURACAST_URL}/api/nowplaying/jawr`;

type Song = {
  artist?: string;
  title?: string;
};

export function PlayingNow() {
  const [song, setSong] = useState<Song | null>(null);

  useEffect(() => {
    function load() {
      fetch(API)
        .then((r) => r.json())
        .then((d) => {
          const s: Song = (d.now_playing && d.now_playing.song) || {};
          setSong(s);
        })
        .catch(() => {});
    }

    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="w-full h-5 inline-flex items-center justify-center gap-2 text-sm text-gray-500">
      <MusicNoteIcon size={16} />
      tocando agora:
      <span className="text-gray-900">
        {song === null ? '—' : song.artist ? (
          <><strong>{song.artist}</strong>{` - ${song.title}`}</>
        ) : (song.title ?? '—')}
      </span>
    </p>
  );
}
