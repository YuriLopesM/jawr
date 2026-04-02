'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItemProps = {
  children: React.ReactNode;
  href: string;
};

export function NavItem({ children, href }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`text-sm cursor-pointer transition-colors ${
        isActive
          ? 'text-gray-900 font-semibold'
          : 'text-gray-400 hover:text-gray-600 hover:font-medium'
      }`}
    >
      [{children}]
    </Link>
  );
}
