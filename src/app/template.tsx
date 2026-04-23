import { cookies } from 'next/headers';

import { getT } from 'next-i18next/server';
import {
  Footer,
  LanguageSwitcher,
  Menu,
  Nav,
  ThemeToggle,
} from './_lib/components';

export default async function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const lang = cookieStore.get('i18next')?.value || 'en';
  const { t } = await getT('common');

  return (
    <div className="max-w-5xl w-full min-h-screen pt-12 px-4 sm:px-8 mx-auto flex flex-col gap-12 relative">
      <header className="w-full flex flex-wrap items-center justify-between gap-y-2">
        <Nav>
          <Nav.Item href="/">{t('nav_home')}</Nav.Item>
          <Nav.Item href="/listen">{t('nav_listen')}</Nav.Item>
          <Nav.Item href="/blog">{t('nav_blog')}</Nav.Item>
          <Nav.Item href="/curators">{t('nav_curators')}</Nav.Item>
          <Nav.Item href="/more">{t('nav_more')}</Nav.Item>
          <Nav.Item href="/extension">{t('nav_extension')}</Nav.Item>
        </Nav>
        <Menu>
          <Menu.Item>
            <LanguageSwitcher currentLanguage={lang} />
          </Menu.Item>
          <ThemeToggle />
        </Menu>
      </header>
      <div className="w-full">{children}</div>
      <Footer />
    </div>
  );
}
