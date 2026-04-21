import type { Metadata } from 'next';
import Script from 'next/script';

import { getResources, getT, initServerI18next } from 'next-i18next/server';
import i18nConfig from '../../i18n.config';

import { I18nProvider } from 'next-i18next/client';
import { IBM_Plex_Mono } from 'next/font/google';

import { ThemeProvider } from './_lib/components';
import './globals.css';

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'jawr.',
  description: 'Just another web radio.',
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
        {clarityId && process.env.NODE_ENV === 'production' && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${clarityId}");`}
          </Script>
        )}
      </head>
      <body className="h-full flex flex-col">
        <ThemeProvider>
          <I18nProvider language={lng} resources={resources}>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
