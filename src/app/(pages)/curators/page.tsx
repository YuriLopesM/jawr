import { Divider, SocialIcon } from '../../_lib/components';

export default function Curators() {
  return (
    <main className="w-full h-full flex flex-col gap-5">
      <header>
        <h1 className="text-base text-gray-800 font-bold">curadores</h1>
        <Divider />
      </header>
      <p className="text-sm text-gray-600">as pessoas por trás da programação da jawr.</p>
      <ul className="flex flex-col gap-6">
        <li className="flex flex-col gap-2">
          <span className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">ernest</span>
            <span className="text-xs px-1 py-px rounded border-[0.5px] border-emerald-600 text-emerald-700">curador</span>
            <span className="text-xs px-1 py-px rounded border-[0.5px] border-blue-600 text-blue-700">dev</span>
          </span>
          <span className="flex items-center gap-3 text-gray-400">
            <a href="http://instagram.com/prod.ernest" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors"><SocialIcon network="instagram" /></a>
            <a href="https://ernessst.bandcamp.com/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors"><SocialIcon network="bandcamp" /></a>
            <a href="https://soundcloud.com/prodernest" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors"><SocialIcon network="soundcloud" /></a>
            <a href="https://github.com/xrnst" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors"><SocialIcon network="github" /></a>
          </span>
        </li>
        <li className="flex flex-col gap-2">
          <span className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">L1mit</span>
            <span className="text-xs px-1 py-px rounded border-[0.5px] border-emerald-600 text-emerald-700">curador</span>
            <span className="text-xs px-1 py-px rounded border-[0.5px] border-blue-600 text-blue-700">dev</span>
          </span>
          <span className="flex items-center gap-3 text-gray-400">
            <a href="https://www.instagram.com/yurilopesm/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors"><SocialIcon network="instagram" /></a>
            <a href="https://x.com/L1mitt" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors"><SocialIcon network="twitter" /></a>
            <a href="https://github.com/YuriLopesM" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors"><SocialIcon network="github" /></a>
            <a href="https://www.last.fm/user/l1mitt" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors"><SocialIcon network="lastfm" /></a>
          </span>
        </li>
      </ul>
    </main>
  );
}
