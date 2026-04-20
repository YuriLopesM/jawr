type MenuProps = {
  children: React.ReactNode;
};

type MenuItemProps = {
  children: React.ReactNode;
};

function MenuRoot({ children }: MenuProps) {
  return <nav className="flex items-center gap-2">{children}</nav>;
}

function MenuItem({ children }: MenuItemProps) {
  return (
    <span className="text-sm flex items-center cursor-pointer transition-colors text-gray-400 hover:text-gray-600 hover:font-medium dark:text-[#6e6e6e] dark:hover:text-[#f0f0f0]">
      [{children}]
    </span>
  );
}

type MenuComponent = typeof MenuRoot & {
  Item: typeof MenuItem;
};

export const Menu = Object.assign(MenuRoot, {
  Item: MenuItem,
}) as MenuComponent;
