'use client';

import { useEffect, useState } from 'react';

const API = 'https://152.67.35.182/api/nowplaying/jawk';

type HistoryItem = {
  song?: { artist?: string; title?: string };
  played_at?: number;
};

function timeAgo(playedAt: number): string {
  const diff = Math.floor(Date.now() / 1000) - playedAt;
  if (diff < 60) return `${diff}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  return `${Math.floor(diff / 3600)}h atrás`;
}

export function RecentlyPlayed() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then((d) => setHistory((d.song_history as HistoryItem[]) || []))
      .catch(() => {});
  }, []);

  const items = history.slice(0, 3);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-gray-600">
        <strong>tocadas recentemente</strong>
      </p>
      <ul className="flex flex-col text-xs text-gray-600">
        {items.length === 0 && <li className="text-gray-300">—</li>}
        {items.map((item, i) => {
          const s = item.song || {};
          const text = s.artist ? `${s.artist} ― ${s.title}` : (s.title ?? '—');
          const ago = item.played_at ? timeAgo(item.played_at) : '';
          return (
            <li
              key={i}
              className="flex items-center gap-2 py-1 border-b border-gray-50 overflow-hidden"
            >
              <span className="flex-1 truncate">{text}</span>
              {ago && <span className="text-gray-300 shrink-0">{ago}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
