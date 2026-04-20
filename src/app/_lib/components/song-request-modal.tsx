'use client';

import { XIcon } from '@phosphor-icons/react';
import { useT } from 'next-i18next/client';
import { useState } from 'react';

type Props = {
  onClose: () => void;
};

export function SongRequestModal({ onClose }: Props) {
  const { t } = useT('listen');
  const [name, setName] = useState('');
  const [song, setSong] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit() {
    setSending(true);
    await fetch('/api/song-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, song, email, message }),
    });
    setSending(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white border border-gray-200 w-full max-w-sm mx-4 flex flex-col gap-5 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-sm font-bold text-gray-900">{t('song_request_title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
            <XIcon />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600">{t('song_request_name')} <span className="text-gray-400">*</span></span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-gray-400 transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600">{t('song_request_email')}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-gray-400 transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600">{t('song_request_song')} <span className="text-gray-400">*</span></span>
            <input
              type="text"
              value={song}
              onChange={(e) => setSong(e.target.value)}
              className="border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-gray-400 transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600">{t('song_request_message')}</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-gray-400 transition-colors resize-none"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !song.trim() || sending}
            className="px-4 py-2 text-xs bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {sending ? t('song_request_sending') : t('song_request_submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
