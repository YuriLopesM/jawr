import { NavItem } from './nav-item';

export type NavItemDef = {
  href: string;
  label: React.ReactNode;
  hideOnMobile?: boolean;
};

type NavProps = {
  logo: { href: string; content: React.ReactNode };
  items: NavItemDef[];
};

export function Nav({ logo, items }: NavProps) {
  return (
    <nav className="flex items-center gap-x-2 gap-y-1">
      <NavItem href={logo.href} className="mr-4">
        {logo.content}
      </NavItem>
      <div className="hidden sm:flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item) => (
          <NavItem key={item.href} href={item.href}>
            {item.label}
          </NavItem>
        ))}
      </div>
    </nav>
  );
}
