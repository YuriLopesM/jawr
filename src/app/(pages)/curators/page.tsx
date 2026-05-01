import { getT } from 'next-i18next/server';
import { CuratorSocial, Divider } from '../../_lib/components';
import { Curator, CuratorRole } from '../../_types';

export default async function Curators() {
  const { t } = await getT('curators');
  const curators: Curator[] = [
    {
      name: 'ernest',
      roles: [CuratorRole.Curator, CuratorRole.Dev],
      socials: [
        { network: 'instagram', href: 'http://instagram.com/prod.ernest' },
        { network: 'bandcamp', href: 'https://ernessst.bandcamp.com/' },
        { network: 'soundcloud', href: 'https://soundcloud.com/prodernest' },
        { network: 'github', href: 'https://github.com/xrnst' },
      ],
    },
    {
      name: 'L1mit',
      roles: [CuratorRole.Curator, CuratorRole.Dev],
      socials: [
        { network: 'instagram', href: 'https://www.instagram.com/yurilopesm' },
        { network: 'twitter', href: 'https://x.com/L1mitt' },
        { network: 'lastfm', href: 'https://www.last.fm/user/l1mitt' },
        { network: 'github', href: 'https://github.com/YuriLopesM' },
      ],
    },
    {
      name: 'moura',
      roles: [CuratorRole.Curator],
      socials: [
        {
          network: 'instagram',
          href: 'https://www.instagram.com/mouraatlastt',
        },
        { network: 'twitter', href: 'https://x.com/omuraaaaa_' },
        { network: 'lastfm', href: 'https://www.last.fm/user/JosoeGracinha2_' },
      ],
    },
    {
      name: 'lucca',
      roles: [CuratorRole.Curator],
      socials: [
        {
          network: 'instagram',
          href: 'https://www.instagram.com/lucca____pagin/',
        },
        { network: 'twitter', href: 'https://x.com/radio__amor' },
        { network: 'lastfm', href: 'https://www.last.fm/user/pagiin' },
      ],
    },
  ];

  return (
    <main className="w-full flex-1 flex flex-col gap-5">
      <header>
        <h1 className="text-base text-gray-800 font-bold dark:tk-heading">
          {t('curators_title')}
        </h1>
        <Divider />
      </header>
      <p className="text-sm text-gray-600 dark:tk-body">
        {t('curators_description')}
      </p>
      <ul className="flex flex-col gap-6">
        {curators.map((curator) => (
          <CuratorSocial
            key={curator.name}
            name={curator.name}
            roles={curator.roles}
            socials={curator.socials}
          />
        ))}
      </ul>
    </main>
  );
}
