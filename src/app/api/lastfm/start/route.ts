import { NextResponse } from 'next/server';

import {
  buildAuthUrlServer,
  getTokenServer,
  isLastfmApiError,
} from '@/app/_lib/services/lastfm-server';

export async function POST() {
  try {
    const token = await getTokenServer();
    return NextResponse.json({ token, authUrl: buildAuthUrlServer(token) });
  } catch (error) {
    if (isLastfmApiError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: 'Failed to start Last.fm auth' },
      { status: 500 }
    );
  }
}
