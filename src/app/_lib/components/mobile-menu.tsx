'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { NavItem } from './nav-item';
import type { NavItemDef } from './nav';

type MobileMenuProps = {
  items: NavItemDef[];
};

export function MobileMenu({ items }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <div className="sm:hidden relative">
      <button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex flex-col justify-center items-center w-8 h-8 gap-1.5 text-gray-400 hover:text-gray-600 dark:tk-muted dark:hover:tk-accent transition-colors"
      >
        <span
          className={`block w-5 h-0.5 bg-current transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`}
        />
        <span
          className={`block w-5 h-0.5 bg-current transition-opacity ${open ? 'opacity-0' : ''}`}
        />
        <span
          className={`block w-5 h-0.5 bg-current transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded shadow-lg min-w-40">
          {items.map((item) => (
            <NavItem key={item.href} href={item.href}>
              {item.label}
            </NavItem>
          ))}
        </div>
      )}
    </div>
  );
}
