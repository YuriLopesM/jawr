'use client';

import { useRadioStore } from '@/stores/radio-store';
import { useT } from 'next-i18next/client';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

function toTitleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function DynamicPageTitle() {
  const pathname = usePathname();
  const { t } = useT('common');
  const { song, playing } = useRadioStore(
    useShallow((store) => ({
      song: store.song,
      playing: store.playing,
    }))
  );

  const pageTitle = useMemo(() => {
    const routeTitles: Record<string, string> = {
      '/': t('nav_home'),
      '/listen': t('nav_listen'),
      '/blog': t('nav_blog'),
      '/curators': t('nav_curators'),
      '/more': t('nav_more'),
      '/extension': t('nav_extension'),
    };

    if (routeTitles[pathname]) {
      return routeTitles[pathname];
    }

    const firstSegment = pathname.split('/').filter(Boolean)[0] ?? '';

    if (!firstSegment) {
      return t('nav_home');
    }

    return toTitleCase(firstSegment.replace(/-/g, ' '));
  }, [pathname, t]);

  const baseTitle = `jawr | ${pageTitle}`;
  const trackTitle = ['🎵', song?.artist, song?.title]
    .filter(Boolean)
    .join(' - ');
  const shouldAlternate = playing && Boolean(trackTitle);

  useLayoutEffect(() => {
    document.title = baseTitle;

    if (!shouldAlternate) {
      return;
    }

    let showTrack = false;
    const interval = setInterval(() => {
      showTrack = !showTrack;
      document.title = showTrack ? trackTitle : baseTitle;
    }, 5000);

    return () => {
      clearInterval(interval);
      document.title = baseTitle;
    };
  }, [baseTitle, shouldAlternate, trackTitle]);

  return null;
}
