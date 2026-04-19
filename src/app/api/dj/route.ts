import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { name, role, link, message } = await req.json();

  if (!name?.trim() || !role?.trim()) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  await fetch(process.env.DISCORD_WEBHOOK_DJ!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: `🎧 novo ${role}: ${name}`,
        fields: [
          { name: 'tipo', value: role, inline: true },
          ...(link ? [{ name: 'link', value: link, inline: true }] : []),
          ...(message ? [{ name: 'recado', value: message }] : []),
        ],
        color: 0x111827,
      }],
    }),
  });

  return NextResponse.json({ ok: true });
}
