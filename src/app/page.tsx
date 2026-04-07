import { Divider, OnThisDay, PlayingNow, TodayCard } from './_lib/components';

export default function Home() {
  return (
    <main className="w-full h-full flex flex-col gap-5">
      <header>
        <h1 className="text-base text-gray-800 font-bold">olá,</h1>
        <Divider />
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
      <section className="flex justify-between">
        {new Array(4).fill(0).map((_, i) => (
          <TodayCard
            key={i}
            title="álbum do dia"
            image={'/cover.png'}
            description={{
              title: 'Descrição do álbum do dia',
              subtitle: i % 2 === 0 ? 'Subtítulo do álbum do dia' : undefined,
            }}
            source={[
              {
                name: '1001 albums',
                url: 'https://en.wikipedia.org/wiki/1001_Albums_You_Must_Hear_Before_You_Die',
              },
            ]}
          />
        ))}
      </section>
      <OnThisDay />

      <footer className="w-full border-t-gray-100 border-t pt-2 mt-auto">
        <p className="text-xs text-gray-400 text-center">
          jawr <span className="text-gray-200">| 2026</span>
        </p>
      </footer>
    </main>
  );
}
