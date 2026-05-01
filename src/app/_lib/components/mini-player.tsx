'use client';

import { PauseIcon, PlayIcon, SpeakerHighIcon, SpeakerSlashIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRadioContext } from '../context';

export function MiniPlayer() {
  const { playing, song, volume, toggle, toggleMute } = useRadioContext();
  const pathname = usePathname();

  if (pathname === '/listen') return null;
  if (!playing) return null;

  const label = song?.artist && song?.title
    ? `${song.artist} - ${song.title}`
    : (song?.title ?? '');

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-white dark:tk-surface border border-gray-200 dark:tk-border shadow-sm text-xs text-gray-700 dark:tk-body max-w-[280px]">
      {song?.art && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={song.art} alt="" className="w-10 h-10 object-cover shrink-0" />
      )}

      <div className="flex items-center gap-2 px-2 py-2 min-w-0">
        <button
          onClick={toggle}
          className="shrink-0 text-gray-600 dark:tk-body hover:text-gray-900 dark:hover:tk-accent transition-colors cursor-pointer"
          aria-label={playing ? 'pause' : 'play'}
        >
          {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} weight="fill" />}
        </button>

        <Link
          href="/listen"
          className="truncate hover:text-gray-900 dark:hover:tk-accent transition-colors"
        >
          {label || 'jawr'}
        </Link>

        <button
          onClick={toggleMute}
          className="shrink-0 text-gray-400 dark:tk-muted hover:text-gray-900 dark:hover:tk-accent transition-colors cursor-pointer"
          aria-label={volume.isMuted ? 'unmute' : 'mute'}
        >
          {volume.isMuted ? <SpeakerSlashIcon size={14} weight="fill" /> : <SpeakerHighIcon size={14} weight="fill" />}
        </button>
      </div>
    </div>
  );
}
