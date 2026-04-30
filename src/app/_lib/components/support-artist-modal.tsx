'use client';

import {
  AppleLogoIcon,
  EqualizerIcon,
  LastfmLogoIcon,
  ParallelogramIcon,
  SoundcloudLogoIcon,
  SpotifyLogoIcon,
  VinylRecordIcon,
  XIcon,
  YoutubeLogoIcon,
} from '@phosphor-icons/react';
import { useT } from 'next-i18next/client';
import { useState } from 'react';

export function SupportArtistModal({
  artist,
  onClose,
}: {
  artist: string;
  onClose: () => void;
}) {
  const { t } = useT('listen');
  const artists = artist.split(';').map((a) => a.trim());
  const [activeTab, setActiveTab] = useState(artists[0]);
  const q = encodeURIComponent(activeTab);

  const links = [
    {
      label: 'bandcamp',
      href: `https://bandcamp.com/search?q=${q}&item_type=b`,
      icon: ParallelogramIcon,
    },
    {
      label: 'soundcloud',
      href: `https://soundcloud.com/search/people?q=${q}`,
      icon: SoundcloudLogoIcon,
    },
    {
      label: 'spotify',
      href: `https://open.spotify.com/search/${q}/artists`,
      icon: SpotifyLogoIcon,
    },
    {
      label: 'apple music',
      href: `https://music.apple.com/search?term=${q}`,
      icon: AppleLogoIcon,
    },
    {
      label: 'youtube music',
      href: `https://music.youtube.com/search?q=${q}`,
      icon: YoutubeLogoIcon,
    },
    {
      label: 'deezer',
      href: `https://www.deezer.com/search/${q}/artist`,
      icon: EqualizerIcon,
    },
    {
      label: 'discogs',
      href: `https://www.discogs.com/search/?q=${q}&type=artist`,
      icon: VinylRecordIcon,
    },
    {
      label: 'last.fm',
      href: `https://www.last.fm/music/${q}`,
      icon: LastfmLogoIcon,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-[var(--dk-bg,#ffffff)] border border-gray-200 dark:tk-border w-full max-w-sm mx-4 flex flex-col gap-5 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:tk-heading">
            {t('support_artist_title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:tk-muted hover:text-gray-700 dark:hover:tk-heading transition-colors cursor-pointer"
          >
            <XIcon />
          </button>
        </div>

        {artists.length > 1 && (
          <section className="flex gap-3">
            {artists.map((a) => (
              <button
                key={a}
                onClick={() => setActiveTab(a)}
                className={`px-3 py-1 text-xs cursor-pointer ${activeTab === a ? 'bg-gray-100 text-gray-500 ring ring-inset ring-gray-200 dark:text-gray-50 dark:bg-gray-400 dark:ring-gray-50' : 'bg-gray-200 text-gray-700 dark:tk-border dark:tk-heading hover:bg-gray-100 dark:hover:tk-surface'} transition-colors`}
              >
                {a}
              </button>
            ))}
          </section>
        )}

        <ul className="grid grid-cols-2 gap-2">
          {links.map(({ label, href, icon: Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between w-full px-3 py-2 text-xs text-gray-800 dark:tk-heading border border-gray-200 dark:tk-border hover:bg-gray-100 dark:hover:tk-surface transition-colors"
              >
                {label}
                <Icon className="text-base text-gray-300 dark:tk-muted" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
