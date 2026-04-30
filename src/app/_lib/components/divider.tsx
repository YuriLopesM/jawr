type DividerProps = {
  children?: React.ReactNode;
};

export function Divider({ children }: DividerProps) {
  if (children) {
    return (
      <span className="text-[10px] text-gray-300 uppercase tracking-widest whitespace-nowrap my-4 dark:tk-muted">
        {children}
      </span>
    );
  }

  return <div className="w-full h-px bg-gray-100 my-4 dark:[background-color:var(--dk-border)]" />;
}
