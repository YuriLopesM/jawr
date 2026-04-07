import { Menu, Nav } from './_lib/components';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-5xl py-12 min-h-screen mx-auto flex flex-col gap-12">
      <header className="w-full flex items-center justify-between">
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
      {children}
    </div>
  );
}
