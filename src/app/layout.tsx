import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

import { getResources, getT, initServerI18next } from 'next-i18next/server';
import i18nConfig from '../../i18n.config';

import { I18nProvider } from 'next-i18next/client';
import { IBM_Plex_Mono } from 'next/font/google';

import {
  RadioProvider,
  SwRegister,
  ThemeProvider,
  TzSetter,
} from './_lib/components';
import './globals.css';

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  description: 'Just another web radio.',
  appleWebApp: {
    capable: true,
    title: 'jawr.',
    statusBarStyle: 'black-translucent',
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

  return (
    <html
      lang={lng}
      className={`${ibmPlexMono.className} h-full antialiased bg-gray-50 dark:bg-gray-950`}
    >
      <head>
        <Script id="initial-page-title" strategy="beforeInteractive">
          {`(function(){
            var path = window.location.pathname || '/';
            var routeMap = {
              '/': 'home',
              '/listen': 'listen',
              '/blog': 'blog',
              '/curators': 'curators',
              '/more': 'more',
              '/extension': 'extension'
            };

            var page = routeMap[path];
            if (!page) {
              var firstSegment = path.split('/').filter(Boolean)[0] || 'home';
              page = firstSegment.replace(/-/g, ' ');
            }

            document.title = 'jawr | ' + page;
          })();`}
        </Script>
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
        <ThemeProvider>
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
