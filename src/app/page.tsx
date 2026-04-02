import { Divider, Menu, Nav, PlayingNow } from './_lib/components';

export default function Home() {
  return (
    <div className="w-5xl my-12 mx-auto flex flex-col gap-12">
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
      <main className="w-full flex flex-col gap-5">
        <header>
          <h1 className="text-base text-gray-800 font-bold">olá,</h1>
          <Divider />
        </header>
        <article className="text-sm text-gray-600 flex flex-col gap-4">
          <p>
            bem-vindo à <strong>jawr</strong>{' '}
            <em className="text-gray-300">(just another web radio)</em> -
            tocamos a música que a gente gosta. 24/7. <br />
            sintonize pela página ouvir ou baixe o .m3u para o seu reprodutor de
            áudio.
          </p>
          <p>
            DJs, curadores e artistas estão convidados, leia mais se quiser
            participar.
          </p>
        </article>
        <Divider />
        <PlayingNow />
        <Divider />
      </main>
    </div>
  );
}
