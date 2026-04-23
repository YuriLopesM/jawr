import { NextResponse } from 'next/server';

import { getLastfmSessionCookie } from '@/app/_lib/actions/lastfm';

export async function GET() {
  const session = await getLastfmSessionCookie();

  if (!session) {
    return NextResponse.json({ session: null });
  }

  return NextResponse.json({ session: { name: session.name } });
}
