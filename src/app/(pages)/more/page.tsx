'use client';

import { useState } from 'react';
import { useT } from 'next-i18next/client';
import { Divider } from '../../_lib/components/divider';
import { ContactModal } from '../../_lib/components/contact-modal';
import { DJModal } from '../../_lib/components/dj-modal';

export default function More() {
  const [showContact, setShowContact] = useState(false);
  const [showDJ, setShowDJ] = useState(false);
  const { t } = useT('more');

  return (
    <main className="w-full h-full flex flex-col gap-8">
      <header>
        <h1 className="text-base text-gray-800 font-bold dark:tk-heading">{t('more_title')}</h1>
        <Divider />
      </header>

      <section className="flex flex-col gap-2">
        <p className="text-sm font-bold text-gray-800 dark:tk-heading">{t('dj_section_title')}</p>
        <p className="text-sm text-gray-600 dark:tk-body">
          {t('dj_section_description')}
        </p>
        <p className="text-sm">
          <button
            onClick={() => setShowDJ(true)}
            className="underline text-gray-800 dark:tk-body hover:text-gray-600 dark:hover:tk-heading transition-colors cursor-pointer"
          >
            {t('dj_section_cta')}
          </button>
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-sm font-bold text-gray-800 dark:tk-heading">{t('contact_section_title')}</p>
        <p className="text-sm text-gray-600 dark:tk-body">
          {t('contact_section_description')}
        </p>
        <p className="text-sm">
          <button
            onClick={() => setShowContact(true)}
            className="underline text-gray-800 dark:tk-body hover:text-gray-600 dark:hover:tk-heading transition-colors cursor-pointer"
          >
            {t('contact_section_cta')}
          </button>
        </p>
      </section>

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      {showDJ && <DJModal onClose={() => setShowDJ(false)} />}
    </main>
  );
}
