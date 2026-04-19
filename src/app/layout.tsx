import type { Metadata } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'jawr.',
  description: 'Just another web radio.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexMono.className} h-full antialiased bg-gray-50`}
    >
      <body className="h-full flex flex-col">
        {children}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
        `}</Script>
      </body>
    </html>
  );
}
