'use client';

import { XIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useT } from 'next-i18next/client';

type Props = {
  onClose: () => void;
};

export function DJModal({ onClose }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { t } = useT('more');

  async function handleSubmit() {
    setSending(true);
    await fetch('/api/dj', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role, link, message }),
    });
    setSending(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-[#2a2a2a] w-full max-w-sm mx-4 flex flex-col gap-5 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold text-gray-900 dark:text-[#f0f0f0]">{t('dj_modal_title')}</h2>
            <p className="text-xs text-gray-400 dark:text-[#6e6e6e]">{t('dj_modal_description')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-[#6e6e6e] hover:text-gray-700 dark:hover:text-[#f0f0f0] transition-colors cursor-pointer">
            <XIcon />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600 dark:text-[#b0b0b0]">{t('dj_field_name')} <span className="text-gray-400 dark:text-[#6e6e6e]">*</span></span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1e1e1e] px-3 py-2 text-xs text-gray-800 dark:text-[#f0f0f0] outline-none focus:border-gray-400 dark:focus:border-[#6e6e6e] transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600 dark:text-[#b0b0b0]">{t('dj_field_email')}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1e1e1e] px-3 py-2 text-xs text-gray-800 dark:text-[#f0f0f0] outline-none focus:border-gray-400 dark:focus:border-[#6e6e6e] transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600 dark:text-[#b0b0b0]">{t('dj_field_type')} <span className="text-gray-400 dark:text-[#6e6e6e]">*</span></span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1e1e1e] px-3 py-2 text-xs text-gray-800 dark:text-[#f0f0f0] outline-none focus:border-gray-400 dark:focus:border-[#6e6e6e] transition-colors"
            >
              <option value="">{t('dj_field_type_placeholder')}</option>
              <option value="DJ">{t('dj_field_type_dj')}</option>
              <option value="curador de playlist">{t('dj_field_type_curator')}</option>
              <option value="artista">{t('dj_field_type_artist')}</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600 dark:text-[#b0b0b0]">{t('dj_field_link')}</span>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="soundcloud, mixcloud, drive..."
              className="border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1e1e1e] px-3 py-2 text-xs text-gray-800 dark:text-[#f0f0f0] outline-none focus:border-gray-400 dark:focus:border-[#6e6e6e] transition-colors placeholder:text-gray-300 dark:placeholder:text-[#3a3a3a]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600 dark:text-[#b0b0b0]">{t('dj_field_message')}</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1e1e1e] px-3 py-2 text-xs text-gray-800 dark:text-[#f0f0f0] outline-none focus:border-gray-400 dark:focus:border-[#6e6e6e] transition-colors resize-none"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !role || sending}
            className="px-4 py-2 text-xs bg-gray-900 dark:bg-[#2a2a2a] text-white hover:bg-gray-700 dark:hover:bg-[#3a3a3a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {sending ? t('dj_button_sending') : t('dj_button_send')}
          </button>
        </div>
      </div>
    </div>
  );
}
