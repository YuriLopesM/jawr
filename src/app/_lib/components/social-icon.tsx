'use client';

import {
  InstagramLogoIcon,
  TwitterLogoIcon,
  GithubLogoIcon,
  SoundcloudLogoIcon,
  LastfmLogoIcon,
  ParallelogramIcon,
} from '@phosphor-icons/react';

const icons: Record<string, React.ElementType> = {
  instagram: InstagramLogoIcon,
  twitter: TwitterLogoIcon,
  github: GithubLogoIcon,
  soundcloud: SoundcloudLogoIcon,
  lastfm: LastfmLogoIcon,
  bandcamp: ParallelogramIcon,
};

interface SocialIconProps {
  network: string;
  size?: number;
}

export function SocialIcon({ network, size = 18 }: SocialIconProps) {
  const Icon = icons[network.toLowerCase()];
  if (!Icon) return <span>{network}</span>;
  return (
    <span className="flex items-center gap-1">
      <Icon size={size} />
      <span className="text-xs">{network}</span>
    </span>
  );
}
