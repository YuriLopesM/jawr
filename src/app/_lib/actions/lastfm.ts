'use server';

import { cookies } from 'next/headers';

import { LastfmSession } from '@/app/_types';

const LASTFM_COOKIE_NAME = 'jawr-lastfm-session';
const LASTFM_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function getLastfmSessionCookie(): Promise<LastfmSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(LASTFM_COOKIE_NAME);

  if (!sessionCookie) return null;

  try {
    const session = JSON.parse(sessionCookie.value) as LastfmSession;
    if (!session?.key || !session?.name) return null;

    return {
      key: String(session.key),
      name: String(session.name),
    };
  } catch {
    return null;
  }
}

export async function setLastfmSessionCookie(
  session: LastfmSession
): Promise<void> {
  const cookieStore = await cookies();
  const safeSession: LastfmSession = {
    key: String(session.key),
    name: String(session.name),
  };

  cookieStore.set(LASTFM_COOKIE_NAME, JSON.stringify(safeSession), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: LASTFM_COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function clearLastfmSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(LASTFM_COOKIE_NAME);
}
