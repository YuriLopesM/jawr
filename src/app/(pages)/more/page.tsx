import { Divider } from '../../_lib/components';

const SCHEDULE = [
  { day: 'segunda', time: '—', show: 'em breve', desc: '—' },
  { day: 'terça', time: '—', show: 'em breve', desc: '—' },
  { day: 'quarta', time: '—', show: 'em breve', desc: '—' },
  { day: 'quinta', time: '—', show: 'em breve', desc: '—' },
  { day: 'sexta', time: '—', show: 'em breve', desc: '—' },
  { day: 'sábado', time: '—', show: 'em breve', desc: '—' },
  { day: 'domingo', time: '—', show: 'em breve', desc: '—' },
];

const EMAIL = 'contato@jawr.org';

export default function More() {
  return (
    <main className="w-full h-full flex flex-col gap-8">
      <header>
        <h1 className="text-base text-gray-800 font-bold">mais</h1>
        <Divider />
      </header>

      <section className="flex flex-col gap-3">
        <p className="text-sm font-bold text-gray-800">programação</p>
        <p className="text-sm text-gray-600">nossa programação, atualizada conforme as coisas evoluem.</p>
        <table className="text-xs text-gray-600 border-collapse w-full">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="pr-6 pb-2 font-normal">dia</th>
              <th className="pr-6 pb-2 font-normal">horário</th>
              <th className="pr-6 pb-2 font-normal">programa</th>
              <th className="pb-2 font-normal">descrição</th>
            </tr>
          </thead>
          <tbody>
            {SCHEDULE.map(({ day, time, show, desc }) => (
              <tr key={day} className="border-t border-gray-100">
                <td className="pr-6 py-1">{day}</td>
                <td className="pr-6 py-1 text-gray-400">{time}</td>
                <td className="pr-6 py-1">{show}</td>
                <td className="py-1 text-gray-400">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-sm font-bold text-gray-800">seja um dj, curador ou artista</p>
        <p className="text-sm text-gray-600">
          a jawr está aberta a DJs, curadores de playlists e artistas. tem autoral? queremos ouvir.
        </p>
        <p className="text-sm text-gray-600">
          não precisa de nada especial, só manda o que você tem e resolvemos o resto.
        </p>
        <p className="text-sm">
          <a href={`mailto:${EMAIL}`} className="underline hover:text-gray-700 transition-colors">
            enviar →
          </a>
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-sm font-bold text-gray-800">fale conosco</p>
        <p className="text-sm text-gray-600">
          entre em contato pelo{' '}
          <a href={`mailto:${EMAIL}`} className="underline hover:text-gray-700 transition-colors">
            {EMAIL}
          </a>{' '}
          por qualquer motivo. perguntas, sugestões e feedback são bem-vindos.
        </p>
      </section>
    </main>
  );
}
