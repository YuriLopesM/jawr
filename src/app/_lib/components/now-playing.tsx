'use client';

import { useEffect, useState } from 'react';

const API = 'https://152.67.35.182/api/nowplaying/jawk';

type Song = {
  artist?: string;
  title?: string;
};

export function NowPlaying() {
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

  const text =
    song === null
      ? '—'
      : song.artist
        ? `${song.artist} ― ${song.title}`
        : (song.title ?? '—');

  const artist = song?.artist;

  return (
    <div className="flex flex-col gap-1 text-sm">
      <p className="text-gray-600">
        <strong>tocando agora:</strong>{' '}
        <span className="text-gray-900">{text}</span>
      </p>
      {artist && (
        <p className="text-xs text-gray-400 flex gap-2">
          <a
            href={`https://www.last.fm/music/${encodeURIComponent(artist)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 transition-colors"
          >
            [last.fm]
          </a>
          <a
            href={`https://www.discogs.com/search/?q=${encodeURIComponent(artist)}&type=artist`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 transition-colors"
          >
            [discogs]
          </a>
        </p>
      )}
    </div>
  );
}
