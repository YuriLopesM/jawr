import { Divider } from '../../_lib/components';

export default function Blog() {
  return (
    <main className="w-full h-full flex flex-col gap-5">
      <header>
        <h1 className="text-base text-gray-800 font-bold">blog</h1>
        <Divider />
      </header>
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-400 italic">em construção.</p>
        <img src="/wip.gif" alt="em construção" className="w-8" />
      </div>
    </main>
  );
}
