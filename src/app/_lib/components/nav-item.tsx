'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import i18nConfig from '../../../../i18n.config';

type NavItemProps = {
  children: React.ReactNode;
  href: string;
};

export function NavItem({ children, href }: NavItemProps) {
  const pathname = usePathname();
  const pathnameWithoutLocale = pathname
    .split('/')
    .filter(Boolean)
    .filter((segment, index) => {
      if (index !== 0) return true;
      return !i18nConfig.supportedLngs.includes(segment);
    })
    .join('/');
  const normalizedPathname =
    `/${pathnameWithoutLocale}`.replace(/\/$/, '') || '/';
  const isActive = normalizedPathname === href;

  return (
    <Link
      href={href}
      // aria-current={isActive ? 'page' : undefined}
      className={`text-sm cursor-pointer transition-colors ${
        isActive
          ? 'text-gray-900 font-semibold dark:text-[#f0f0f0]'
          : 'text-gray-400 hover:text-gray-600 hover:font-medium dark:text-[#6e6e6e] dark:hover:text-[#f0f0f0]'
      }`}
    >
      [{children}]
    </Link>
  );
}
