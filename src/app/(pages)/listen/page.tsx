import { getT } from 'next-i18next/server';
import { Divider, RadioPlayer } from '../../_lib/components';

export default async function Listen() {
  const { t } = await getT('listen');

  return (
    <main className="w-full h-full flex flex-col gap-5">
      <header className="hidden sm:block">
        <h1 className="text-base text-gray-800 font-bold dark:text-[#f0f0f0]">
          {t('listen_title')}
        </h1>
        <Divider />
      </header>
      <RadioPlayer />
      <p className="block sm:hidden mt-3 text-xs text-gray-500 dark:text-[#6e6e6e]">
        {t('listen_mobile_intro')}{' '}
        <a
          href="https://api.jawr.org/listen/jawr/radio.mp3"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-[#b0b0b0] transition-colors"
        >
          {t('listen_mobile_direct_stream')}
        </a>{' '}
        {t('listen_mobile_middle')}{' '}
        <a
          href="/jawr.m3u"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-[#b0b0b0] transition-colors"
        >
          .m3u
        </a>{' '}
        {t('listen_mobile_suffix')}
      </p>
    </main>
  );
}
