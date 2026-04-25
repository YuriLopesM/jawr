'use client';

import { useLastfm, useNotifications } from '@/hooks';
import { useRadioContext } from './radio-provider';
import {
  DownloadSimpleIcon,
  PauseIcon,
  PlayIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  XIcon,
} from '@phosphor-icons/react';
import { useT } from 'next-i18next/client';
import { useEffect, useRef, useState } from 'react';

import { timeAgo } from '../helpers/date';
import { SongRequestModal } from './song-request-modal';

export function RadioPlayer() {
  const { playing, history, volume, song, toggle, toggleMute, changeVolume } =
    useRadioContext();
  const { enabled: notificationsEnabled, permission: notificationPermission, toggle: toggleNotifications } = useNotifications(song, playing);
  const {
    session,
    pending,
    connect,
    confirm,
    disconnect,
    nowPlaying,
    scrobbleTrack,
  } = useLastfm();
  const { t } = useT('listen');

  const [showRequest, setShowRequest] = useState(false);
  const scrobbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (scrobbleTimer.current) clearTimeout(scrobbleTimer.current);
    scrobbleTimer.current = null;
    if (!session || !song?.artist || !song?.title || !playing) return;

    nowPlaying(song.artist, song.title).catch(() => {});

    const timestamp = Math.floor(Date.now() / 1000);
    scrobbleTimer.current = setTimeout(() => {
      scrobbleTrack(song.artist!, song.title!, timestamp).catch(() => {});
      scrobbleTimer.current = null;
    }, 60_000);

    return () => {
      if (scrobbleTimer.current) clearTimeout(scrobbleTimer.current);
    };
  }, [song?.title, song?.artist, playing, session?.name]);

  return (
    <div className="flex flex-col gap-6">
      {/* Live indicator */}
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full bg-red-700"
            style={{ animation: 'pulse 2s ease-in-out infinite' }}
          />
          <span className="text-xs font-bold text-red-700 tracking-widest uppercase">
            {t('live_indicator')}
          </span>
        </p>
        {notificationPermission !== 'denied' && (
          <button
            onClick={toggleNotifications}
            className="text-xs text-gray-400 underline hover:text-gray-700 transition-colors cursor-pointer"
          >
            {notificationsEnabled ? t('notifications_disable') : t('notifications_enable')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[5fr_4fr] relative gap-8 items-start">
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
          <div className="flex items-center h-11 border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-gray-900">
            {/* Play/Pause */}
            <button
              onClick={toggle}
              className="flex items-center justify-center w-11 h-full border-r border-gray-200 dark:border-[#2a2a2a] text-gray-600 dark:text-[#b0b0b0] hover:text-gray-900 dark:hover:text-[#f0f0f0] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer shrink-0"
              aria-label={playing ? t('player_pause') : t('player_play')}
            >
              {playing ? <PauseIcon /> : <PlayIcon weight="fill" />}
            </button>

            {/* EQ bars / label */}
            <span className="flex-1 px-3 flex justify-between items-center gap-2 text-xs text-gray-500 dark:text-gray-100">
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
                      className="w-1 h-3.5 bg-gray-500 dark:bg-[#6e6e6e]"
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
              className="flex items-center justify-center w-10 h-full border-l border-gray-200 dark:border-[#2a2a2a] text-gray-400 dark:text-[#6e6e6e] hover:text-gray-900 dark:hover:text-[#f0f0f0] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer shrink-0"
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
            <div className="hidden sm:flex items-center gap-2 px-3 border-l border-gray-200 dark:border-[#2a2a2a] shrink-0">
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
              <span className="text-xs text-gray-400 dark:text-[#6e6e6e] w-7 text-right tabular-nums">
                {Math.round(volume.value * 100)}%
              </span>
            </div>

            {/* Download M3U */}
            <a
              href="/jawr.m3u"
              download
              className="flex items-center justify-center w-10 h-full border-l border-gray-200 dark:border-[#2a2a2a] text-gray-400 dark:text-[#6e6e6e] hover:text-gray-900 dark:hover:text-[#f0f0f0] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors shrink-0"
              aria-label={t('player_download_m3u')}
            >
              <DownloadSimpleIcon weight="fill" />
            </a>
          </div>

          {/* Now playing */}
          <div className="flex flex-col gap-3 mb-2 mt-6 text-sm">
            <p className="text-gray-600 dark:text-[#6e6e6e] text-[10px] uppercase tracking-widest">
              {t('now_label')}
            </p>
            <p className="text-gray-900 dark:text-[#f0f0f0]">
              {song?.artist} - {song?.title}
            </p>
            {song?.artist && (
              <p className="text-xs text-gray-400 dark:text-[#6e6e6e] flex gap-2">
                <a
                  href={`https://www.last.fm/music/${encodeURIComponent(song.artist)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-600 dark:hover:text-[#b0b0b0] transition-colors"
                >
                  [last.fm]
                </a>
                <a
                  href={`https://www.discogs.com/search/?q=${encodeURIComponent(song.artist)}&type=artist`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-600 dark:hover:text-[#b0b0b0] transition-colors"
                >
                  [discogs]
                </a>
              </p>
            )}
          </div>

          {/* Recently played */}
          <div className="flex flex-col gap-3 mt-6">
            <p className="text-gray-600 dark:text-[#6e6e6e] text-[10px] uppercase tracking-widest">
              {t('recently_label')}
            </p>
            <ul className="flex flex-col text-xs text-gray-600 dark:text-[#b0b0b0]">
              {history.length === 0 && (
                <li className="text-gray-300 dark:text-[#3a3a3a]">—</li>
              )}
              {history.map(({ song, played_at }, i) => {
                if (!song) return null;

                const text = song.artist
                  ? `${song.artist} - ${song.title}`
                  : (song.title ?? '-');
                const ago = played_at
                  ? `${timeAgo(played_at)} ${t('played_ago')}`
                  : '';

                return (
                  <li
                    key={i}
                    className="flex items-center gap-2 py-1.5 border-b border-gray-100 dark:border-[#2a2a2a] overflow-hidden"
                  >
                    <span className="flex-1 truncate">{text}</span>
                    {ago && (
                      <span className="text-gray-300 dark:text-[#3a3a3a] shrink-0">
                        {ago}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Song request + Last.fm buttons */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setShowRequest(true)}
              className="self-start text-xs text-gray-400 underline hover:text-gray-700 transition-colors cursor-pointer"
            >
              {t('song_request_button')}
            </button>

            {session ? (
              <span className="text-xs text-gray-600 dark:text-[#b0b0b0] flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                {session.name}
                <button
                  onClick={disconnect}
                  className="text-[10px] text-gray-400 dark:text-[#6e6e6e] hover:text-gray-900 dark:hover:text-[#f0f0f0] transition-colors cursor-pointer"
                  aria-label={t('lastfm_disconnect')}
                >
                  <XIcon />
                </button>
              </span>
            ) : pending ? (
              <span className="text-xs text-gray-400 dark:text-[#6e6e6e] flex items-center gap-1.5">
                {t('lastfm_pending')}
                <button
                  onClick={confirm}
                  className="underline hover:text-gray-900 dark:hover:text-[#f0f0f0] transition-colors cursor-pointer"
                >
                  {t('lastfm_confirm')}
                </button>
              </span>
            ) : (
              <button
                onClick={connect}
                className="text-xs text-gray-400 dark:text-[#6e6e6e] underline hover:text-gray-900 dark:hover:text-[#f0f0f0] transition-colors cursor-pointer"
              >
                {t('lastfm_connect')}
              </button>
            )}
          </div>
        </div>
      </div>

      {showRequest && (
        <SongRequestModal onClose={() => setShowRequest(false)} />
      )}
    </div>
  );
}
