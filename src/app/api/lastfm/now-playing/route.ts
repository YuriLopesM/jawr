import { NextRequest, NextResponse } from 'next/server';

import { getLastfmSessionCookie } from '@/app/_lib/actions/lastfm';
import {
  isLastfmApiError,
  updateNowPlayingServer,
} from '@/app/_lib/services/lastfm';

export async function POST(req: NextRequest) {
  const { artist, track } = await req.json();

  if (!artist?.trim() || !track?.trim()) {
    return NextResponse.json(
      { error: 'Missing artist or track' },
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
    await updateNowPlayingServer(session.key, artist.trim(), track.trim());
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isLastfmApiError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update now playing' },
      { status: 500 }
    );
  }
}
