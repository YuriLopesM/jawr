'use server';

import { cookies } from 'next/headers';

const VOLUME_COOKIE_NAME = 'jawr-volume';
const VOLUME_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

export interface VolumeState {
  value: number;
  isMuted: boolean;
}

const DEFAULT_VOLUME_STATE: VolumeState = {
  value: 0.5,
  isMuted: false,
};

export async function getVolumeCookie(): Promise<VolumeState> {
  const cookieStore = await cookies();
  const volumeCookie = cookieStore.get(VOLUME_COOKIE_NAME);

  if (!volumeCookie) return DEFAULT_VOLUME_STATE;

  try {
    const state = JSON.parse(volumeCookie.value) as VolumeState;
    return {
      value: Math.min(1, Math.max(0, state.value ?? 0.5)),
      isMuted: Boolean(state.isMuted),
    };
  } catch {
    return DEFAULT_VOLUME_STATE;
  }
}

export async function setVolumeCookie(volumeState: VolumeState): Promise<void> {
  const cookieStore = await cookies();
  const state: VolumeState = {
    value: Math.min(1, Math.max(0, volumeState.value)),
    isMuted: Boolean(volumeState.isMuted),
  };

  cookieStore.set(VOLUME_COOKIE_NAME, JSON.stringify(state), {
    maxAge: VOLUME_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
  });
}
