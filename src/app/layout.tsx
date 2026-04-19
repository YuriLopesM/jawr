import type { Metadata } from 'next';

import { getResources, getT, initServerI18next } from 'next-i18next/server';
import i18nConfig from '../../i18n.config';

import { I18nProvider } from 'next-i18next/client';
import { IBM_Plex_Mono } from 'next/font/google';

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
  const { i18n, lng } = await getT();
  const resources = getResources(i18n);

  return (
    <html
      lang={lng}
      className={`${ibmPlexMono.className} h-full antialiased bg-gray-50`}
    >
      <body className="h-full flex flex-col">
        <I18nProvider language={lng} resources={resources}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
