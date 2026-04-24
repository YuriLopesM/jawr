export type Artist = {
  name: string;
  id: string;
  uri: string;
  href: string;
  type: string;
  external_urls: {
    spotify: string;
  };
};

export type Image = {
  url: string;
  width: number;
  height: number;
};

export type Album = {
  id: string;
  name: string;
  release_date: string;
  uri: string;
  artists: Artist[];
  images: Image[];
};

export type Song = {
  artist?: string;
  title?: string;
  art?: string;
};

export type NowPlaying = {
  song?: Song;
  played_at?: number;
};

export type HistoryItem = {
  song?: { artist?: string; title?: string };
  played_at?: number;
};

export type AlbumsMap = Record<string, Album>;

export type RequestResult = {
  request_id: string;
  song: {
    title: string;
    artist: string;
    art?: string;
  };
};

export type LastfmSession = {
  key: string;
  name: string;
};

export type LastfmPublicSession = {
  name: string;
};

export enum CuratorRole {
  Curator = 'curator',
  Dev = 'dev',
}

export type CuratorSocialLink = {
  network: string;
  href: string;
};

export type Curator = {
  name: string;
  socials: CuratorSocialLink[];
  roles: CuratorRole[];
};

export type CuratorSocialProps = Curator;
