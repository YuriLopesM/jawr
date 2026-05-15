type IconLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: React.ReactNode;
};

export function IconLink({ href, icon, label }: IconLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-xs text-gray-400 dark:tk-muted hover:text-gray-700 dark:hover:tk-heading transition-colors w-fit"
    >
      {icon}
      {label}
    </a>
  );
}
