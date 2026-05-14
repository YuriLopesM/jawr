import { getT } from 'next-i18next/server';
import {
  DynamicPageTitle,
  Footer,
  JawrLogoExtended,
  LanguageSwitcher,
  Menu,
  MiniPlayer,
  MobileMenu,
  Nav,
  ThemeToggle,
} from './_lib/components';

export default async function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, lng } = await getT('common');

  const navItems = [
    { href: '/listen', label: t('nav_listen') },
    { href: '/blog', label: t('nav_blog') },
    { href: '/curators', label: t('nav_curators') },
    { href: '/extension', label: t('nav_extension'), hideOnMobile: true },
    { href: '/more', label: t('nav_more') },
  ];
  const mobileNavItems = navItems.filter((item) => !item.hideOnMobile);

  return (
    <div className="max-w-5xl w-full min-h-screen pt-12 px-4 sm:px-8 mx-auto flex flex-col gap-12 relative">
      <DynamicPageTitle />
      <header className="w-full flex flex-wrap items-center justify-between gap-y-2">
        <Nav
          logo={{
            href: '/',
            content: (
              <JawrLogoExtended className="w-32 h-auto fill-current text-gray-900 dark:tk-accent" />
            ),
          }}
          items={navItems}
        />
        <Menu>
          <Menu.Item>
            <LanguageSwitcher currentLanguage={lng} />
          </Menu.Item>
          <ThemeToggle />
          <MobileMenu items={mobileNavItems} />
        </Menu>
      </header>
      <div className="w-full">{children}</div>
      <Footer />
      <MiniPlayer />
    </div>
  );
}
