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

export type AlbumsMap = Record<string, Album>;
