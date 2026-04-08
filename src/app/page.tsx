import { Divider, OnThisDay, PlayingNow, TodayCard } from './_lib/components';

export default function Home() {
  return (
    <main className="w-full h-full flex flex-col gap-5">
      <header>
        <h1 className="text-base text-gray-800 font-bold">olá,</h1>
      </header>
      <article className="text-sm text-gray-600 flex flex-col gap-4">
        <p>
          bem-vindo à <strong>jawr</strong>{' '}
          <em className="text-gray-300">(just another web radio)</em> - tocamos
          a música que a gente gosta. 24/7. <br />
          sintonize pela página ouvir ou baixe o .m3u para o seu reprodutor de
          áudio.
        </p>
        <p>
          DJs, curadores e artistas estão convidados, leia mais se quiser
          participar.
        </p>
      </article>
      <Divider />
      <PlayingNow />
      <Divider />
      <section className="flex justify-between flex-wrap gap-y-3">
        <TodayCard.Album />
        <TodayCard.Artist />
        <TodayCard.Color />
      </section>
      <OnThisDay />
    </main>
  );
}
