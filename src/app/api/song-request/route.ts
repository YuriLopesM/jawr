import { enqueue } from '@/app/_lib/request-queue';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { name, song, email, message } = await req.json();

  if (!name?.trim() || !song?.trim()) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  await fetch(process.env.DISCORD_WEBHOOK_SONG_REQUEST!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: `🎵 pedido de música: ${song}`,
        fields: [
          { name: 'nome', value: name, inline: true },
          ...(email ? [{ name: 'email', value: email, inline: true }] : []),
          ...(message ? [{ name: 'recado', value: message }] : []),
        ],
        color: 0x6b7280,
      }],
    }),
  });

  enqueue(song.trim());

  return NextResponse.json({ ok: true });
}
