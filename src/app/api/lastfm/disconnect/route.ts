import { NextResponse } from 'next/server';

import { clearLastfmSessionCookie } from '@/app/_lib/actions/lastfm';

export async function POST() {
  await clearLastfmSessionCookie();
  return NextResponse.json({ ok: true });
}
