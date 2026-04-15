'use client';

import {
  ArtistInfo,
  ArtistVotes,
  DAILY_LIMIT,
  DailyData,
  fetchPair,
  getDailyData,
  incrementDailyCount,
} from '@/app/_lib/services/this-or-that';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type ArtistCardProps = {
  artist: ArtistInfo;
  voted: boolean;
  count: number;
  pct: number;
  isWinner: boolean;
  onVote: () => void;
};

function ArtistCard({
  artist,
  voted,
  count,
  pct,
  isWinner,
  onVote,
}: ArtistCardProps) {
  const animatedPct = useCountUp(pct, voted, 300);

  return (
    <button
      onClick={onVote}
      disabled={voted}
      className={[
        'flex-1 text-left flex flex-col overflow-hidden transition-all',
        voted
          ? isWinner
            ? 'border-2 border-black scale-[1.02] shadow-md'
            : 'border border-gray-100 opacity-50'
          : 'border border-gray-200 hover:border-gray-400 cursor-pointer',
      ].join(' ')}
    >
      <div className="relative w-full aspect-square bg-gray-100">
        {artist.image ? (
          <Image
            src={artist.image}
            alt={artist.name}
            fill
            sizes="50vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
        {voted && (
          <>
            {/* dark overlay */}
            <div className="absolute inset-0 bg-black/40" />
            {/* percentage */}
            <div className="absolute inset-0 flex items-end justify-start p-2">
              <span className="text-white text-3xl font-bold leading-none">
                {animatedPct}%
              </span>
            </div>
            {/* winner checkmark badge */}
            {isWinner && (
              <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 7l4 4 6-6"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </>
        )}
      </div>
      <div className="px-2 py-2 flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-gray-800 leading-tight">
          {artist.name}
        </span>
        {voted && (
          <span className="text-[10px] text-gray-400">
            {count} {count === 1 ? 'voto' : 'votos'}
          </span>
        )}
      </div>
    </button>
  );
}

function useCountUp(target: number, active: boolean, duration = 600) {
  const [value, setValue] = useState(0);
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    const steps = 20;
    const interval = duration / steps;
    let step = 0;
    ref.current = setInterval(() => {
      step++;
      setValue(Math.round((target / steps) * step));
      if (step >= steps) clearInterval(ref.current!);
    }, interval);
    return () => clearInterval(ref.current!);
  }, [target, active, duration]);

  return value;
}

const STORAGE_KEY = 'jawr-this-or-that-votes';

export function ThisOrThat() {
  const [votes, setVotes] = useState<ArtistVotes>({});
  const [pair, setPair] = useState<[ArtistInfo, ArtistInfo] | null>(null);
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [daily, setDaily] = useState<DailyData>({ date: '', count: 0 });

  const limitReached = daily.count >= DAILY_LIMIT;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setVotes(JSON.parse(stored));
    } catch {}

    setDaily(getDailyData());
    loadPair();
  }, []);

  async function loadPair() {
    setLoading(true);
    const pair = await fetchPair();
    setPair(pair);
    setLoading(false);
  }

  function saveVotes(updated: ArtistVotes) {
    setVotes(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  function handleVote(name: string) {
    if (voted || limitReached) return;
    saveVotes({ ...votes, [name]: (votes[name] ?? 0) + 1 });
    setDaily(incrementDailyCount());
    setVoted(name);
  }

  function handleNext() {
    setVoted(null);
    loadPair();
  }

  const [a, b] = pair ?? [null, null];
  const votesA = votes[a?.name ?? ''] ?? 0;
  const votesB = votes[b?.name ?? ''] ?? 0;
  const total = votesA + votesB;
  const maxVotes = Math.max(votesA, votesB);

  return (
    <section className="flex flex-col gap-4 items-center">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-[12px] font-semibold text-gray-600 hover:text-gray-900 transition-colors"
      >
        this or that {open ? '↑' : '↓'}
      </button>

      {open && (loading || !pair) && (
        <div className="flex gap-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="w-30 aspect-square border border-gray-100 bg-gray-50 animate-pulse"
            />
          ))}
        </div>
      )}

      {open && limitReached && (
        <p className="text-[11px] text-gray-400 text-center">
          obrigado por votar. volte amanhã :)
        </p>
      )}

      {open && !limitReached && pair && (
        <>
          <div className="flex gap-3 w-full">
            {pair.map((artist) => {
              const count = votes[artist.name] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const isWinner = !!voted && count === maxVotes && total > 0;

              return (
                <ArtistCard
                  key={artist.name}
                  artist={artist}
                  voted={!!voted}
                  count={count}
                  pct={pct}
                  isWinner={isWinner}
                  onVote={() => handleVote(artist.name)}
                />
              );
            })}
          </div>

          {voted && (
            <button
              onClick={handleNext}
              className="text-[10px] text-gray-300 hover:text-gray-600 transition-colors text-right underline"
            >
              próximo →
            </button>
          )}
        </>
      )}
    </section>
  );
}
