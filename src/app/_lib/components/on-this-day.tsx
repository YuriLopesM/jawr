type WikiEvent = {
  text: string;
  year: number;
  pages?: { titles?: { normalized?: string }; content_urls?: { desktop?: { page?: string } } }[];
};

async function fetchTodayEvents(): Promise<WikiEvent[]> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const res = await fetch(
    `https://api.wikimedia.org/feed/v1/wikipedia/pt/onthisday/selected/${month}/${day}`,
    {
      next: { revalidate: 86400 },
      headers: { 'Api-User-Agent': 'jawr-radio/1.0' },
    }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return data.selected ?? [];
}

function pickEvent(events: WikiEvent[]): WikiEvent | null {
  if (!events.length) return null;
  const index = Math.floor(Math.random() * events.length);
  return events[index];
}

export async function OnThisDay() {
  const events = await fetchTodayEvents();
  const event = pickEvent(events);

  if (!event) return null;

  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleString('pt-BR', { month: 'long' });
  const articleUrl = event.pages?.[0]?.content_urls?.desktop?.page;
  const articleTitle = event.pages?.[0]?.titles?.normalized;

  return (
    <section className="flex flex-col items-center gap-3 text-center px-4">
      <div className="flex items-center gap-3 w-full max-w-lg">
        <span className="flex-1 border-t border-gray-100" />
        <p className="text-[10px] text-gray-300 uppercase tracking-widest whitespace-nowrap">
          hoje, {day} de {month}
        </p>
        <span className="flex-1 border-t border-gray-100" />
      </div>
      <p className="text-xs text-gray-500 max-w-lg leading-relaxed">
        <span className="text-gray-800 font-semibold">{event.year}</span>
        <span className="text-gray-200"> - </span>
        {event.text.replace(/\s*\(imagem\)/gi, '')}
        {articleUrl && articleTitle && (
          <>
            {' '}
            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-gray-600 transition-colors"
            >
              ↗
            </a>
          </>
        )}
      </p>
    </section>
  );
}
