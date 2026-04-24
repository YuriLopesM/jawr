import { NextRequest, NextResponse } from 'next/server';

import { getLastfmSessionCookie } from '@/app/_lib/actions/lastfm';
import { isLastfmApiError, scrobbleServer } from '@/app/_lib/services/lastfm';

export async function POST(req: NextRequest) {
  const { artist, track, timestamp } = await req.json();

  if (!artist?.trim() || !track?.trim() || Number.isNaN(Number(timestamp))) {
    return NextResponse.json(
      { error: 'Missing or invalid scrobble payload' },
      { status: 400 }
    );
  }

  const session = await getLastfmSessionCookie();
  if (!session) {
    return NextResponse.json(
      { error: 'Last.fm session not found' },
      { status: 401 }
    );
  }

  try {
    await scrobbleServer(
      session.key,
      artist.trim(),
      track.trim(),
      Number(timestamp)
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isLastfmApiError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: 'Failed to scrobble track' },
      { status: 500 }
    );
  }
}
