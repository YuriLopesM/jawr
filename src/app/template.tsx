import dayjs from 'dayjs';
import { getT } from 'next-i18next/server';
import { LanguageSwitcher, Menu, Nav } from './_lib/components';

export default async function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const { lng } = await getT('footer');
  const { t } = await getT('common');

  const year = dayjs().year();

  return (
    <div className="w-5xl min-h-screen pt-12 mx-auto flex flex-col gap-12 relative">
      <header className="w-full flex items-center justify-between">
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
          <Menu.Item>{t('theme_dark')}</Menu.Item>
        </Menu>
      </header>
      <div className="w-full">{children}</div>
      <footer className="border-t-gray-100 bg-gray-50 border-t">
        <div className="w-5xl mx-auto h-12 flex items-center justify-center">
          <p className="text-xs text-gray-400 text-center">
            jawr <span className="text-gray-200">| {year}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
