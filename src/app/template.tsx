import dayjs from 'dayjs';
import { getT } from 'next-i18next/server';
import { LanguageSwitcher, Menu, Nav, ThemeToggle } from './_lib/components';

export default async function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const { lng } = await getT('footer');
  const { t } = await getT('common');

  const year = dayjs().year();

  return (
    <div className="max-w-5xl w-full min-h-screen pt-12 px-4 sm:px-8 mx-auto flex flex-col gap-12 relative">
      <header className="w-full flex flex-wrap items-center justify-between gap-y-2">
        <Nav>
          <Nav.Item href="/">{t('nav_home')}</Nav.Item>
          <Nav.Item href="/listen">{t('nav_listen')}</Nav.Item>
          <Nav.Item href="/blog">{t('nav_blog')}</Nav.Item>
          <Nav.Item href="/curators">{t('nav_curators')}</Nav.Item>
          <Nav.Item href="/more">{t('nav_more')}</Nav.Item>
        </Nav>
        <Menu>
          <Menu.Item>
            <LanguageSwitcher currentLanguage={lng} />
          </Menu.Item>
          <ThemeToggle />
        </Menu>
      </header>
      <div className="w-full">{children}</div>
      <footer className="border-t-gray-100 bg-gray-50 border-t dark:bg-gray-950 dark:border-t-[#2a2a2a]">
        <div className="max-w-5xl w-full mx-auto h-12 flex items-center justify-center px-4 sm:px-8">
          <p className="text-xs text-gray-400 text-center">
            jawr <span className="text-gray-200">| {year}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
