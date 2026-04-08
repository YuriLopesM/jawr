import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

import { Divider } from './';

type Page = {
  titles?: { normalized?: string };
  content_urls?: { desktop?: { page?: string } };
};

type WikiEvent = {
  text: string;
  year: number;
  pages?: Page[];
};

async function fetchTodayEvents(): Promise<WikiEvent[]> {
  const month = dayjs().month() + 1;
  const day = dayjs().date();

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

  const now = dayjs();
  const day = now.date();
  const month = now.locale('pt-br').format('MMMM');

  const articleUrl = event.pages?.[0]?.content_urls?.desktop?.page;
  const articleTitle = event.pages?.[0]?.titles?.normalized;

  const filteredText = event.text.replace(/\s*\(imagem\)/gi, '');

  return (
    <section className="flex flex-col items-center gap-3 text-center">
      <div className="flex items-center gap-3 w-full">
        <span className="flex-1 border-t border-gray-100" />
        <Divider>
          hoje, {day} de {month}
        </Divider>

        <span className="flex-1 border-t border-gray-100" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
        <span className="text-gray-800 font-semibold">{event.year}</span>
        <span className="text-gray-200"> - </span>
        {filteredText}
        {articleUrl && articleTitle && (
          <a
            href={articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-gray-600 transition-colors"
          >
            {' '}
            ↗
          </a>
        )}
      </p>
    </section>
  );
}
