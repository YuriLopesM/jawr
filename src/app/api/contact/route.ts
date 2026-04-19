import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  if (!name?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  await fetch(process.env.DISCORD_WEBHOOK_CONTACT!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: `📬 contato: ${subject || 'sem assunto'}`,
        fields: [
          { name: 'nome', value: name, inline: true },
          ...(email ? [{ name: 'email', value: email, inline: true }] : []),
          { name: 'mensagem', value: message },
        ],
        color: 0x6b7280,
      }],
    }),
  });

  return NextResponse.json({ ok: true });
}
