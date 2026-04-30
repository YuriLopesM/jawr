'use client';

import { XIcon } from '@phosphor-icons/react';
import { useT } from 'next-i18next/client';
import { useState } from 'react';

type Props = {
  onClose: () => void;
};

export function DJModal({ onClose }: Props) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    link: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const { t } = useT('more');

  async function handleSubmit() {
    setSending(true);
    await fetch('/api/dj', {
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
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold text-gray-900 dark:tk-heading">{t('dj_modal_title')}</h2>
            <p className="text-xs text-gray-400 dark:tk-muted">{t('dj_modal_description')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:tk-muted hover:text-gray-700 dark:hover:tk-heading transition-colors cursor-pointer">
            <XIcon />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600 dark:tk-body">{t('dj_field_name')} <span className="text-gray-400 dark:tk-muted">*</span></span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-200 dark:tk-border bg-[var(--dk-surface,#f9f9f9)] px-3 py-2 text-xs text-gray-800 dark:tk-heading outline-none focus:border-gray-400 dark:focus:tk-border transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600 dark:tk-body">{t('dj_field_email')}</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border border-gray-200 dark:tk-border bg-[var(--dk-surface,#f9f9f9)] px-3 py-2 text-xs text-gray-800 dark:tk-heading outline-none focus:border-gray-400 dark:focus:tk-border transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600 dark:tk-body">{t('dj_field_type')} <span className="text-gray-400 dark:tk-muted">*</span></span>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="border border-gray-200 dark:tk-border bg-[var(--dk-surface,#f9f9f9)] px-3 py-2 text-xs text-gray-800 dark:tk-heading outline-none focus:border-gray-400 dark:focus:tk-border transition-colors"
            >
              <option value="">{t('dj_field_type_placeholder')}</option>
              <option value="DJ">{t('dj_field_type_dj')}</option>
              <option value="curador de playlist">{t('dj_field_type_curator')}</option>
              <option value="artista">{t('dj_field_type_artist')}</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600 dark:tk-body">{t('dj_field_link')}</span>
            <input
              type="text"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="soundcloud, mixcloud, drive..."
              className="border border-gray-200 dark:tk-border bg-[var(--dk-surface,#f9f9f9)] px-3 py-2 text-xs text-gray-800 dark:tk-heading outline-none focus:border-gray-400 dark:focus:tk-border transition-colors placeholder:text-gray-300 dark:placeholder:tk-muted"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600 dark:tk-body">{t('dj_field_message')}</span>
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
            disabled={!form.name.trim() || !form.role || sending}
            className="px-4 py-2 text-xs bg-gray-900 dark:tk-surface text-white hover:bg-gray-700 dark:hover:tk-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {sending ? t('dj_button_sending') : t('dj_button_send')}
          </button>
        </div>
      </div>
    </div>
  );
}
