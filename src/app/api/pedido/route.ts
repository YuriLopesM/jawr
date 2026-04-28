import { checkAndRemove } from '@/app/_lib/request-queue';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get('title') ?? '';
  const artist = req.nextUrl.searchParams.get('artist') ?? '';

  if (!title) return NextResponse.json({ isRequest: false });

  const isRequest = checkAndRemove(artist, title);

  return NextResponse.json({ isRequest });
}
