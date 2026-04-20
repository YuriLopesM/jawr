import { getT } from 'next-i18next/server';
import { Divider, SocialIcon } from '../../_lib/components';

export default async function Curators() {
  const { t } = await getT('curators');

  return (
    <main className="w-full h-full flex flex-col gap-5">
      <header>
        <h1 className="text-base text-gray-800 font-bold dark:text-[#f0f0f0]">{t('curators_title')}</h1>
        <Divider />
      </header>
      <p className="text-sm text-gray-600 dark:text-[#b0b0b0]">{t('curators_description')}</p>
      <ul className="flex flex-col gap-6">
        <li className="flex flex-col gap-2">
          <span className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800 dark:text-[#f0f0f0]">ernest</span>
            <span className="text-xs px-1 py-px rounded border-[0.5px] border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400">{t('role_curator')}</span>
            <span className="text-xs px-1 py-px rounded border-[0.5px] border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400">{t('role_dev')}</span>
          </span>
          <span className="flex items-center gap-3 text-gray-400 dark:text-[#6e6e6e]">
            <a href="http://instagram.com/prod.ernest" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-[#f0f0f0] transition-colors"><SocialIcon network="instagram" /></a>
            <a href="https://ernessst.bandcamp.com/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-[#f0f0f0] transition-colors"><SocialIcon network="bandcamp" /></a>
            <a href="https://soundcloud.com/prodernest" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-[#f0f0f0] transition-colors"><SocialIcon network="soundcloud" /></a>
            <a href="https://github.com/xrnst" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-[#f0f0f0] transition-colors"><SocialIcon network="github" /></a>
          </span>
        </li>
        <li className="flex flex-col gap-2">
          <span className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800 dark:text-[#f0f0f0]">L1mit</span>
            <span className="text-xs px-1 py-px rounded border-[0.5px] border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400">{t('role_curator')}</span>
            <span className="text-xs px-1 py-px rounded border-[0.5px] border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400">{t('role_dev')}</span>
          </span>
          <span className="flex items-center gap-3 text-gray-400 dark:text-[#6e6e6e]">
            <a href="https://www.instagram.com/yurilopesm/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-[#f0f0f0] transition-colors"><SocialIcon network="instagram" /></a>
            <a href="https://x.com/L1mitt" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-[#f0f0f0] transition-colors"><SocialIcon network="twitter" /></a>
            <a href="https://www.last.fm/user/l1mitt" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-[#f0f0f0] transition-colors"><SocialIcon network="lastfm" /></a>
            <a href="https://github.com/YuriLopesM" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-[#f0f0f0] transition-colors"><SocialIcon network="github" /></a>
          </span>
        </li>
      </ul>
    </main>
  );
}
