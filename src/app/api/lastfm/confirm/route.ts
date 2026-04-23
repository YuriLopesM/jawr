import { NextRequest, NextResponse } from 'next/server';

import { setLastfmSessionCookie } from '@/app/_lib/actions/lastfm';
import {
  getSessionServer,
  isLastfmApiError,
} from '@/app/_lib/services/lastfm-server';

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    const session = await getSessionServer(token);
    await setLastfmSessionCookie(session);
    return NextResponse.json({ session: { name: session.name } });
  } catch (error) {
    if (isLastfmApiError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: 'Failed to confirm Last.fm auth' },
      { status: 500 }
    );
  }
}
