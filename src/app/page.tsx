import { getT } from 'next-i18next/server';
import { cookies } from 'next/headers';
import { Divider, Greeting, PlayingNow, TodayCard } from './_lib/components';

export default async function Home() {
  const { t } = await getT('home');
  const cookieStore = await cookies();

  const lang = cookieStore.get('i18next')?.value || 'en';

  return (
    <main className="w-full h-full flex flex-col gap-5">
      <header>
        <Greeting />
      </header>
      <article className="text-sm text-gray-600 dark:tk-body flex flex-col gap-4">
        <p className="text-sm text-gray-600 dark:tk-body">
          {t('welcome_message')}{' '}
          <em className="text-gray-300 dark:tk-muted">(just another web radio)</em> -{' '}
          {t('welcome_message_2')} <br />
          {t('listen_instruction_1')}{' '}
          <a href="/listen" className="underline">
            {t('listen_instruction_listen')}
          </a>{' '}
          {t('listen_instruction_2')}{' '}
          <a href="/jawr.m3u" download className="underline">
            .m3u
          </a>{' '}
          {t('listen_instruction_3')}
        </p>
        <p>
          {t('collaboration_invite_1')}{' '}
          <a href="/more" className="underline">
            {t('collaboration_invite_read_more')}
          </a>{' '}
          {t('collaboration_invite_2')}
        </p>
      </article>
      <Divider />
      <PlayingNow />
      <Divider />
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <TodayCard.Album />
        <TodayCard.Artist />
        <TodayCard.Color />
        <TodayCard.Image lang={lang} />
      </section>
      {/* <OnThisDay /> */}
      {/* <Divider /> */}
      {/* <ThisOrThat /> */}
    </main>
  );
}
