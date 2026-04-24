import md5 from 'blueimp-md5';

import { LastfmSession } from '@/app/_types';

const API_URL = 'https://ws.audioscrobbler.com/2.0/';

class LastfmApiError extends Error {
  status: number;
  code?: number;

  constructor(message: string, status: number, code?: number) {
    super(message);
    this.name = 'LastfmApiError';
    this.status = status;
    this.code = code;
  }
}

function getLastfmEnv() {
  const apiKey = process.env.LASTFM_API_KEY;
  const secret = process.env.LASTFM_SHARED_SECRET;

  if (!apiKey || !secret) {
    throw new LastfmApiError('Missing Last.fm server credentials', 500);
  }

  return { apiKey, secret };
}

function sign(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params)
    .filter((k) => k !== 'format')
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join('');

  return md5(sorted + secret);
}

function assertLastfmSuccess(data: any): void {
  if (data?.error) {
    const code = typeof data.error === 'number' ? data.error : undefined;
    const message =
      typeof data.message === 'string'
        ? data.message
        : `Last.fm request failed with code ${String(data.error)}`;
    const status = code === 14 ? 409 : 400;
    throw new LastfmApiError(message, status, code);
  }
}

export async function getTokenServer(): Promise<string> {
  const { apiKey } = getLastfmEnv();
  const params = new URLSearchParams({
    method: 'auth.getToken',
    api_key: apiKey,
    format: 'json',
  });

  const res = await fetch(`${API_URL}?${params}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new LastfmApiError(`getToken failed: ${res.status}`, res.status);
  }

  const data = await res.json();
  assertLastfmSuccess(data);

  if (!data?.token) {
    throw new LastfmApiError('Last.fm token missing in response', 502);
  }

  return data.token as string;
}

export function buildAuthUrlServer(token: string): string {
  const { apiKey } = getLastfmEnv();
  return `https://www.last.fm/api/auth/?api_key=${apiKey}&token=${token}`;
}

export async function getSessionServer(token: string): Promise<LastfmSession> {
  const { apiKey, secret } = getLastfmEnv();
  const params: Record<string, string> = {
    method: 'auth.getSession',
    api_key: apiKey,
    token,
  };

  const apiSig = sign(params, secret);
  const query = new URLSearchParams({
    ...params,
    api_sig: apiSig,
    format: 'json',
  });
  const res = await fetch(`${API_URL}?${query}`, { cache: 'no-store' });

  if (!res.ok) {
    throw new LastfmApiError(`getSession failed: ${res.status}`, res.status);
  }

  const data = await res.json();
  assertLastfmSuccess(data);

  const key = data?.session?.key;
  const name = data?.session?.name;

  if (!key || !name) {
    throw new LastfmApiError('Last.fm session missing in response', 502);
  }

  return { key: String(key), name: String(name) };
}

export async function updateNowPlayingServer(
  sessionKey: string,
  artist: string,
  track: string
): Promise<void> {
  const { apiKey, secret } = getLastfmEnv();
  const params: Record<string, string> = {
    method: 'track.updateNowPlaying',
    api_key: apiKey,
    sk: sessionKey,
    artist,
    track,
  };

  const apiSig = sign(params, secret);
  const body = new URLSearchParams({
    ...params,
    api_sig: apiSig,
    format: 'json',
  });
  const res = await fetch(API_URL, { method: 'POST', body, cache: 'no-store' });

  if (!res.ok) {
    throw new LastfmApiError(
      `updateNowPlaying failed: ${res.status}`,
      res.status
    );
  }

  const data = await res.json();
  assertLastfmSuccess(data);
}

export async function scrobbleServer(
  sessionKey: string,
  artist: string,
  track: string,
  timestamp: number
): Promise<void> {
  const { apiKey, secret } = getLastfmEnv();
  const params: Record<string, string> = {
    method: 'track.scrobble',
    api_key: apiKey,
    sk: sessionKey,
    artist,
    track,
    timestamp: String(timestamp),
  };

  const apiSig = sign(params, secret);
  const body = new URLSearchParams({
    ...params,
    api_sig: apiSig,
    format: 'json',
  });
  const res = await fetch(API_URL, { method: 'POST', body, cache: 'no-store' });

  if (!res.ok) {
    throw new LastfmApiError(`scrobble failed: ${res.status}`, res.status);
  }

  const data = await res.json();
  assertLastfmSuccess(data);
}

export function isLastfmApiError(error: unknown): error is LastfmApiError {
  return error instanceof LastfmApiError;
}
