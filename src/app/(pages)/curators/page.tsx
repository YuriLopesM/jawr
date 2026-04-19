import { Divider } from '../../_lib/components';

export default function Curators() {
  return (
    <main className="w-full h-full flex flex-col gap-5">
      <header>
        <h1 className="text-base text-gray-800 font-bold">curadores</h1>
        <Divider />
      </header>
      <p className="text-sm text-gray-600">as pessoas por trás da programação da jawr.</p>
      <ul className="flex flex-col gap-4">
        <li className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-800">ernest</span>
          <span className="text-xs text-gray-400">
            <a href="http://instagram.com/prod.ernest" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 transition-colors">instagram</a>
            {' · '}
            <a href="https://last.fm/user/ernestjr" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 transition-colors">last.fm</a>
          </span>
        </li>
        <li className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-800">marina</span>
          <span className="text-xs text-gray-400">
            <a href="#" className="underline hover:text-gray-700 transition-colors">instagram</a>
            {' · '}
            <a href="#" className="underline hover:text-gray-700 transition-colors">last.fm</a>
          </span>
        </li>
        <li className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-800">lúcio</span>
          <span className="text-xs text-gray-400">
            <a href="#" className="underline hover:text-gray-700 transition-colors">soundcloud</a>
            {' · '}
            <a href="#" className="underline hover:text-gray-700 transition-colors">twitter</a>
          </span>
        </li>
        <li className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-800">bea</span>
          <span className="text-xs text-gray-400">
            <a href="#" className="underline hover:text-gray-700 transition-colors">instagram</a>
            {' · '}
            <a href="#" className="underline hover:text-gray-700 transition-colors">bandcamp</a>
          </span>
        </li>
        <li className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-800">theo</span>
          <span className="text-xs text-gray-400">
            <a href="#" className="underline hover:text-gray-700 transition-colors">mixcloud</a>
            {' · '}
            <a href="#" className="underline hover:text-gray-700 transition-colors">last.fm</a>
          </span>
        </li>
        <li className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-800">sil</span>
          <span className="text-xs text-gray-400">
            <a href="#" className="underline hover:text-gray-700 transition-colors">twitter</a>
            {' · '}
            <a href="#" className="underline hover:text-gray-700 transition-colors">spotify</a>
          </span>
        </li>
      </ul>
    </main>
  );
}
