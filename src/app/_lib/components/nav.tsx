import { NavItem } from "./nav-item";

type NavProps = {
  children: React.ReactNode;
};

function NavRoot({ children }: NavProps) {
  return <nav className="flex items-center gap-2">{children}</nav>;
}

type NavComponent = typeof NavRoot & {
  Item: typeof NavItem;
};

export const Nav = Object.assign(NavRoot, {
  Item: NavItem,
}) as NavComponent;