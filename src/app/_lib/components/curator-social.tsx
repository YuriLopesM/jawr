import { getT } from 'next-i18next/server';
import { CuratorRole, CuratorSocialProps } from '../../_types';
import { SocialIcon } from './social-icon';

const roleClassMap: Record<CuratorRole, string> = {
  [CuratorRole.Curator]:
    'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400',
  [CuratorRole.Dev]:
    'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400',
};

export async function CuratorSocial({
  name,
  socials,
  roles,
}: CuratorSocialProps) {
  const { t } = await getT('common');

  const roleLabels: Record<CuratorRole, string> = {
    [CuratorRole.Curator]: t('role_curator'),
    [CuratorRole.Dev]: t('role_dev'),
  };

  return (
    <li className="flex flex-col gap-2">
      <span className="flex items-center gap-2">
        <span className="text-sm font-bold text-gray-800 dark:tk-heading">
          {name}
        </span>
        {roles.map((role) => (
          <span
            key={role}
            className={`text-xs px-1 py-px rounded border-[0.5px] ${roleClassMap[role]}`}
          >
            {roleLabels[role]}
          </span>
        ))}
      </span>
      <span className="flex items-center flex-wrap gap-3 text-gray-400 dark:tk-muted">
        {socials.map(({ network, href }) => (
          <a
            key={`${network}-${href}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 dark:hover:tk-heading transition-colors"
          >
            <SocialIcon network={network} />
          </a>
        ))}
      </span>
    </li>
  );
}
