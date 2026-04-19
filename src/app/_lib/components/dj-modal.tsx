'use client';

import { XIcon } from '@phosphor-icons/react';
import { useState } from 'react';

type Props = {
  onClose: () => void;
};

export function DJModal({ onClose }: Props) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit() {
    setSending(true);
    await fetch('/api/dj', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role, link, message }),
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
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold text-gray-900">seja um dj, curador ou artista</h2>
            <p className="text-xs text-gray-400">manda o que você tem e resolvemos o resto.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
            <XIcon />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600">nome ou apelido <span className="text-gray-400">*</span></span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-gray-400 transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600">tipo <span className="text-gray-400">*</span></span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-gray-400 transition-colors"
            >
              <option value="">selecione...</option>
              <option value="DJ">DJ</option>
              <option value="curador de playlist">curador de playlist</option>
              <option value="artista">artista</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600">link ou material</span>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="soundcloud, mixcloud, drive..."
              className="border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600">recado</span>
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
            disabled={!name.trim() || !role || sending}
            className="px-4 py-2 text-xs bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {sending ? 'enviando...' : 'enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}
