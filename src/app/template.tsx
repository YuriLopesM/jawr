import { Menu, Nav } from './_lib/components';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-5xl w-full min-h-screen pt-12 px-4 sm:px-8 mx-auto flex flex-col gap-12 relative">
      <header className="w-full flex flex-wrap items-center justify-between gap-y-2">
        <Nav>
          <Nav.Item href="/">início</Nav.Item>
          <Nav.Item href="/listen">ouvir</Nav.Item>
          <Nav.Item href="/blog">blog</Nav.Item>
          <Nav.Item href="/curators">curadores</Nav.Item>
          <Nav.Item href="/more">mais</Nav.Item>
        </Nav>
        <Menu>
          <Menu.Item>en</Menu.Item>
          <Menu.Item>dark</Menu.Item>
        </Menu>
      </header>
      <div className="w-full">{children}</div>
      <footer className="border-t-gray-100 bg-gray-50 border-t">
        <div className="max-w-5xl w-full mx-auto h-12 flex items-center justify-center px-4 sm:px-8">
          <p className="text-xs text-gray-400 text-center">
            jawr <span className="text-gray-200">| 2026</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
