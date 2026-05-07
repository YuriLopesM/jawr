import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import Script from 'next/script';

import { getResources, getT, initServerI18next } from 'next-i18next/server';
import i18nConfig from '../../i18n.config';

import { I18nProvider } from 'next-i18next/client';
import { IBM_Plex_Mono } from 'next/font/google';

import { SwRegister, TzSetter } from './_lib/components';
import { RadioProvider, ThemeProvider } from './_lib/context';
import type { Theme } from './_types';

import './globals.css';

function readThemeCookie(themeCookie?: string): Theme {
  if (!themeCookie) return 'dark';

  const allowedThemes: Theme[] = [
    'light',
    'dark',
    'amoled',
    'nord',
    'city-lights',
    'dracula',
    'catppuccin',
    'gruvbox',
    'everforest',
  ];

  if (allowedThemes.includes(themeCookie as Theme)) {
    return themeCookie as Theme;
  }
  return 'dark';
}

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'jawr.',
  description: 'Just another web radio.',
  metadataBase: new URL('https://jawr.org'),
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      {
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    title: 'jawr.',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    siteName: 'jawr.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9fafb' },
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
  ],
};

initServerI18next(i18nConfig);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { i18n, lng } = await getT([
    'common',
    'home',
    'listen',
    'blog',
    'curators',
    'more',
  ]);
  const resources = getResources(i18n);
  const clarityId = process.env.NEXT_PUBLIC_MICROSOFT_CLARITY_ID;
  const cookieStore = await cookies();
  const initialTheme = readThemeCookie(cookieStore.get('theme')?.value);

  return (
    <html
      lang={lng}
      className={`${ibmPlexMono.className} h-full antialiased bg-(--dk-bg,#f9f9f9) ${initialTheme}`}
    >
      <head>
        {clarityId && process.env.NODE_ENV === 'production' && (
          <Script id="microsoft-clarity" strategy="beforeInteractive">
            {`(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");`}
          </Script>
        )}
      </head>
      <body className="h-full flex flex-col">
        <ThemeProvider initialTheme={initialTheme}>
          <I18nProvider language={lng} resources={resources}>
            <RadioProvider>
              <TzSetter />
              <SwRegister />
              {children}
            </RadioProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
