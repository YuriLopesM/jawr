'use client';

import { useEffect, useRef, useState } from 'react';

const STREAM = 'https://152.67.35.182/listen/jawk/radio.mp3';
const API = 'https://152.67.35.182/api/nowplaying/jawk';

type Song = {
  artist?: string;
  title?: string;
  art?: string;
};

type NowPlaying = {
  song?: Song;
  played_at?: number;
};

type HistoryItem = {
  song?: { artist?: string; title?: string };
  played_at?: number;
};

function timeAgo(playedAt: number): string {
  const diff = Math.floor(Date.now() / 1000) - playedAt;
  if (diff < 60) return `${diff}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  return `${Math.floor(diff / 3600)}h atrás`;
}


export function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [song, setSong] = useState<Song | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

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

  // API polling
  useEffect(() => {
    function load() {
      fetch(API)
        .then((r) => r.json())
        .then((d) => {
          const np: NowPlaying = d.now_playing || {};
          setSong(np.song || {});
          setHistory((d.song_history as HistoryItem[]) || []);
        })
        .catch(() => {});
    }
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);


  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      audio.src = '';
      setPlaying(false);
    } else {
      audio.src = STREAM;
      setPlaying(true);
      audio.play().catch(() => {
        setPlaying(false);
        audio.src = '';
      });
    }
  }

  function changeVolume(v: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = v;
    setVolume(v);
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  }

  const npText =
    song === null
      ? '—'
      : song?.artist
        ? `${song.artist} - ${song.title}`
        : (song?.title ?? '—');

  const artist = song?.artist;
  const art = song?.art;
  const recentItems = history.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      {/* Live indicator */}
      <p className="flex items-center gap-2">
        <span
          className="inline-block w-2 h-2 rounded-full bg-red-700"
          style={{ animation: 'pulse-dot 2s ease-in-out infinite' }}
        />
        <span className="text-xs font-bold text-red-700 tracking-widest uppercase">ao vivo</span>
      </p>

      <div className="grid grid-cols-[3fr_2fr] gap-8 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-5">

          {/* Player bar */}
          <div className="flex items-center h-11 border border-gray-200 bg-gray-50">
            {/* Play/Pause */}
            <button
              onClick={toggle}
              className="flex items-center justify-center w-11 h-full border-r border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
              aria-label={playing ? 'pausar' : 'tocar'}
            >
              {playing ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* EQ bars / label */}
            <span className="flex-1 px-3 flex items-center gap-2 text-xs text-gray-500">
              {playing ? (
                <>
                  <span className="inline-flex gap-0.5 items-end shrink-0" style={{ height: '14px' }}>
                    <span className="w-1 bg-gray-500" style={{ animation: 'eq 0.8s ease-in-out infinite 0s', height: '40%' }} />
                    <span className="w-1 bg-gray-500" style={{ animation: 'eq 0.8s ease-in-out infinite 0.2s', height: '70%' }} />
                    <span className="w-1 bg-gray-500" style={{ animation: 'eq 0.8s ease-in-out infinite 0.4s', height: '55%' }} />
                  </span>
                </>
              ) : (
                'jawr.mp3'
              )}
            </span>

            {/* Mute */}
            <button
              onClick={toggleMute}
              className="flex items-center justify-center w-10 h-full border-l border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
              aria-label={muted ? 'desmutar' : 'mutar'}
            >
              {muted ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="18" viewBox="0 0 24 24" width="18">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="18" viewBox="0 0 24 24" width="18">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </button>

            {/* Volume slider + % */}
            <div className="flex items-center gap-2 px-3 border-l border-gray-200 shrink-0">
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                className="w-20 accent-gray-600 cursor-pointer"
                aria-label="volume"
              />
              <span className="text-xs text-gray-400 w-7 text-right tabular-nums">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Download M3U */}
            <a
              href="/jawr.m3u"
              download
              className="flex items-center justify-center w-10 h-full border-l border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
              aria-label="baixar .m3u"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="18" viewBox="0 0 24 24" width="18">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
            </a>
          </div>


          {/* Now playing */}
          <div className="flex flex-col gap-1.5 text-sm">
            <p className="text-gray-600 font-bold">agora:</p>
            <p className="text-gray-900">{npText}</p>
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

          {/* Recently played */}
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-600 font-bold">tocadas recentemente</p>
            <ul className="flex flex-col text-xs text-gray-600">
              {recentItems.length === 0 && <li className="text-gray-300">—</li>}
              {recentItems.map((item, i) => {
                const s = item.song || {};
                const text = s.artist ? `${s.artist} - ${s.title}` : (s.title ?? '—');
                const ago = item.played_at ? timeAgo(item.played_at) : '';
                return (
                  <li key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-100 overflow-hidden">
                    <span className="flex-1 truncate">{text}</span>
                    {ago && <span className="text-gray-300 shrink-0">{ago}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Right column: album art */}
        {art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={art}
            alt="capa"
            className="w-full aspect-square object-cover border border-gray-200"
          />
        ) : (
          <div className="w-full aspect-square border border-gray-100 bg-gray-50" />
        )}
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes eq {
          0% { height: 3px; }
          50% { height: 14px; }
          100% { height: 3px; }
        }
      `}</style>
    </div>
  );
}
