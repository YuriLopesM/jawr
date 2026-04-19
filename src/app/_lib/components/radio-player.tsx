'use client';

import { useRadio } from '@/hooks';
import {
  DownloadSimpleIcon,
  PauseIcon,
  PlayIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
} from '@phosphor-icons/react';
import { useT } from 'next-i18next/client';

import { timeAgo } from '../helpers/date';

export function RadioPlayer() {
  const { playing, history, volume, song, toggle, toggleMute, changeVolume } =
    useRadio();
  const { t } = useT('listen');

  return (
    <div className="flex flex-col gap-6">
      {/* Live indicator */}
      <p className="flex items-center gap-2">
        <span
          className="inline-block w-2 h-2 rounded-full bg-red-700"
          style={{ animation: 'pulse 2s ease-in-out infinite' }}
        />
        <span className="text-xs font-bold text-red-700 tracking-widest uppercase">
          {t('live_indicator')}
        </span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-[3fr_2fr] relative gap-8 items-start">
        {/* Album art — first in DOM = first on mobile, column 2 on desktop */}
        {song?.art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={song.art}
            alt={t('album_art_alt')}
            className="w-full aspect-square object-cover border border-gray-200 sm:col-start-2"
          />
        ) : (
          <div className="w-full aspect-square border border-gray-200 bg-gray-50 sm:col-start-2" />
        )}

        {/* Left column — column 1, row 1 on desktop */}
        <div className="flex flex-col justify-between h-full sm:col-start-1 sm:row-start-1">
          {/* Player bar */}
          <div className="flex items-center h-11 border border-gray-200 bg-gray-50">
            {/* Play/Pause */}
            <button
              onClick={toggle}
              className="flex items-center justify-center w-11 h-full border-r border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
              aria-label={playing ? t('player_pause') : t('player_play')}
            >
              {playing ? <PauseIcon /> : <PlayIcon weight="fill" />}
            </button>

            {/* EQ bars / label */}
            <span className="flex-1 px-3 flex justify-between items-center gap-2 text-xs text-gray-500">
              <span>jawr.mp3</span>
              {playing && (
                <span className="inline-flex gap-0.5 items-end shrink-0">
                  {(
                    [
                      ['eq-a', '0.65s', '0s'],
                      ['eq-c', '0.9s', '0.1s'],
                      ['eq-b', '0.5s', '0.3s'],
                      ['eq-a', '0.75s', '0.05s'],
                      ['eq-c', '0.8s', '0.2s'],
                    ] as const
                  ).map(([kf, dur, delay], i) => (
                    <span
                      key={i}
                      className="w-1 h-3.5 bg-gray-500"
                      style={{
                        animation: `${kf} ${dur} ease-in-out infinite ${delay}`,
                        transformOrigin: 'bottom',
                      }}
                    />
                  ))}
                </span>
              )}
            </span>

            {/* Mute */}
            <button
              onClick={toggleMute}
              className="flex items-center justify-center w-10 h-full border-l border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
              aria-label={
                volume.isMuted ? t('player_unmute') : t('player_mute')
              }
            >
              {volume.isMuted ? (
                <SpeakerSlashIcon weight="fill" />
              ) : (
                <SpeakerHighIcon weight="fill" />
              )}
            </button>

            {/* Volume slider + % */}
            <div className="hidden sm:flex items-center gap-2 px-3 border-l border-gray-200 shrink-0">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume.value}
                onChange={(e) => changeVolume(Number(e.target.value))}
                className="w-20 accent-gray-600 cursor-pointer"
                aria-label={t('player_volume')}
              />
              <span className="text-xs text-gray-400 w-7 text-right tabular-nums">
                {Math.round(volume.value * 100)}%
              </span>
            </div>

            {/* Download M3U */}
            <a
              href="/jawr.m3u"
              download
              className="flex items-center justify-center w-10 h-full border-l border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
              aria-label={t('player_download_m3u')}
            >
              <DownloadSimpleIcon weight="fill" />
            </a>
          </div>

          {/* Now playing */}
          <div className="flex flex-col gap-3 mb-2 text-sm">
            <p className="text-gray-600 font-bold">{t('now_label')}</p>
            <p className="text-gray-900">
              {song?.artist} - {song?.title}
            </p>
            {song?.artist && (
              <p className="text-xs text-gray-400 flex gap-2">
                <a
                  href={`https://www.last.fm/music/${encodeURIComponent(song.artist)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-600 transition-colors"
                >
                  [last.fm]
                </a>
                <a
                  href={`https://www.discogs.com/search/?q=${encodeURIComponent(song.artist)}&type=artist`}
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
            <p className="text-sm text-gray-600 font-bold">
              {t('recently_label')}
            </p>
            <ul className="flex flex-col text-xs text-gray-600">
              {history.length === 0 && <li className="text-gray-300">—</li>}
              {history.map(({ song, played_at }, i) => {
                if (!song) return null;

                const text = song.artist
                  ? `${song.artist} - ${song.title}`
                  : (song.title ?? '-');
                const ago = played_at ? timeAgo(played_at) : '';

                return (
                  <li
                    key={i}
                    className="flex items-center gap-2 py-1.5 border-b border-gray-100 overflow-hidden"
                  >
                    <span className="flex-1 truncate">{text}</span>
                    {ago && (
                      <span className="text-gray-300 shrink-0">{ago}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
