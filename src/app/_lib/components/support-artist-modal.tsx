'use client';

import { XIcon } from '@phosphor-icons/react';
import { useT } from 'next-i18next/client';

export function SupportArtistModal({
  artist,
  onClose,
}: {
  artist: string;
  onClose: () => void;
}) {
  const { t } = useT('listen');
  const q = encodeURIComponent(artist);
  const links = [
    { label: 'bandcamp', href: `https://bandcamp.com/search?q=${q}&item_type=b` },
    { label: 'soundcloud', href: `https://soundcloud.com/search/people?q=${q}` },
    { label: 'spotify', href: `https://open.spotify.com/search/${q}/artists` },
    { label: 'apple music', href: `https://music.apple.com/search?term=${q}` },
    { label: 'youtube music', href: `https://music.youtube.com/search?q=${q}` },
    { label: 'deezer', href: `https://www.deezer.com/search/${q}/artist` },
    { label: 'discogs', href: `https://www.discogs.com/search/?q=${q}&type=artist` },
    { label: 'last.fm', href: `https://www.last.fm/music/${q}` },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] w-full max-w-sm mx-4 flex flex-col gap-5 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-[#f0f0f0]">
            {t('support_artist_title')} {artist}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-[#f0f0f0] transition-colors cursor-pointer"
          >
            <XIcon />
          </button>
        </div>

        <ul className="grid grid-cols-2 gap-2">
          {links.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 text-xs text-gray-800 dark:text-[#f0f0f0] border border-gray-200 dark:border-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
