type DividerProps = {
  children?: React.ReactNode;
};

export function Divider({ children }: DividerProps) {
  if (children) {
    return (
      <span className="text-[10px] text-gray-300 uppercase tracking-widest whitespace-nowrap my-4 dark:text-[#6e6e6e]">
        {children}
      </span>
    );
  }

  return <div className="w-full h-px bg-gray-100 my-4 dark:bg-[#1e1e1e]" />;
}
