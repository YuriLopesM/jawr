export type ArtistInfo = {
  name: string;
  image: string;
};

export async function fetchPair(): Promise<[ArtistInfo, ArtistInfo]> {
  const res = await fetch('/api/this-or-that');
  const json = await res.json();
  return [json.a, json.b];
}
