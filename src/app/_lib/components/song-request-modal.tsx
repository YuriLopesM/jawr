'use client';

import { XIcon } from '@phosphor-icons/react';
import { useT } from 'next-i18next/client';
import { useState } from 'react';

type Props = {
  onClose: () => void;
};

export function SongRequestModal({ onClose }: Props) {
  const { t } = useT('listen');

  const [form, setForm] = useState({
    name: '',
    email: '',
    song: '',
    message: '',
  });

  const [sending, setSending] = useState(false);

  async function handleSubmit() {
    setSending(true);
    await fetch('/api/song-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSending(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-[var(--dk-bg,#ffffff)] border border-gray-200 dark:tk-border w-full max-w-sm mx-4 flex flex-col gap-5 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:tk-heading">{t('song_request_title')}</h2>
          <button onClick={onClose} className="text-gray-400 dark:tk-muted hover:text-gray-700 dark:hover:tk-heading transition-colors cursor-pointer">
            <XIcon />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600 dark:tk-body">{t('song_request_name')} <span className="text-gray-400 dark:tk-muted">*</span></span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-200 dark:tk-border bg-[var(--dk-surface,#f9f9f9)] px-3 py-2 text-xs text-gray-800 dark:tk-heading outline-none focus:border-gray-400 dark:focus:tk-border transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600 dark:tk-body">{t('song_request_email')}</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border border-gray-200 dark:tk-border bg-[var(--dk-surface,#f9f9f9)] px-3 py-2 text-xs text-gray-800 dark:tk-heading outline-none focus:border-gray-400 dark:focus:tk-border transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600 dark:tk-body">{t('song_request_song')} <span className="text-gray-400 dark:tk-muted">*</span></span>
            <input
              type="text"
              value={form.song}
              onChange={(e) => setForm({ ...form, song: e.target.value })}
              className="border border-gray-200 dark:tk-border bg-[var(--dk-surface,#f9f9f9)] px-3 py-2 text-xs text-gray-800 dark:tk-heading outline-none focus:border-gray-400 dark:focus:tk-border transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600 dark:tk-body">{t('song_request_message')}</span>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              className="border border-gray-200 dark:tk-border bg-[var(--dk-surface,#f9f9f9)] px-3 py-2 text-xs text-gray-800 dark:tk-heading outline-none focus:border-gray-400 dark:focus:tk-border transition-colors resize-none"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim() || !form.song.trim() || sending}
            className="px-4 py-2 text-xs bg-gray-900 dark:tk-surface text-white hover:bg-gray-700 dark:hover:tk-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {sending ? t('song_request_sending') : t('song_request_submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
