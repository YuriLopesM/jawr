import { Divider, RadioPlayer } from '../../_lib/components';

export default function Listen() {
  return (
    <main className="w-full h-full flex flex-col gap-5">
      <header>
        <h1 className="text-base text-gray-800 font-bold">ouvir</h1>
      </header>
      <Divider />
      <RadioPlayer />
      <p className="text-xs text-gray-500">
        no celular? abra o{' '}
        <a
          href="https://152.67.35.182/listen/jawk/radio.mp3"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 transition-colors"
        >
          stream direto
        </a>{' '}
        em nova aba ou baixe o{' '}
        <a
          href="/jawr.m3u"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 transition-colors"
        >
          .m3u
        </a>{' '}
        para o seu reprodutor de áudio.
      </p>
    </main>
  );
}
