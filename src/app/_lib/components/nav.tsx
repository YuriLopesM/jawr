import { NavItem } from "./nav-item";

type NavProps = {
  children: React.ReactNode;
};

function NavRoot({ children }: NavProps) {
  return <nav className="flex flex-wrap items-center gap-x-2 gap-y-1">{children}</nav>;
}

type NavComponent = typeof NavRoot & {
  Item: typeof NavItem;
};

export const Nav = Object.assign(NavRoot, {
  Item: NavItem,
}) as NavComponent;