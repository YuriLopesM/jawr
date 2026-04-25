import type { MetadataRoute } from 'next';

const ICON_SOURCES = [
  { src: '/icon', sizes: '192x192' },
  { src: '/icon0', sizes: '512x512' },
] as const;

const ICON_PURPOSES = ['any', 'maskable'] as const;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'jawr.',
    short_name: 'jawr',
    description: 'Just another web radio.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#030712',
    theme_color: '#030712',
    icons: ICON_SOURCES.flatMap(({ src, sizes }) =>
      ICON_PURPOSES.map((purpose) => ({
        src,
        sizes,
        type: 'image/png',
        purpose,
      }))
    ),
  };
}
