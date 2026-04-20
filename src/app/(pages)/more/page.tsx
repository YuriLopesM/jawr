'use client';

import { useState } from 'react';
import { useT } from 'next-i18next/client';
import { Divider } from '../../_lib/components';
import { ContactModal } from '../../_lib/components/contact-modal';
import { DJModal } from '../../_lib/components/dj-modal';

export default function More() {
  const [showContact, setShowContact] = useState(false);
  const [showDJ, setShowDJ] = useState(false);
  const { t } = useT('more');

  return (
    <main className="w-full h-full flex flex-col gap-8">
      <header>
        <h1 className="text-base text-gray-800 font-bold dark:text-[#f0f0f0]">{t('more_title')}</h1>
        <Divider />
      </header>

      <section className="flex flex-col gap-2">
        <p className="text-sm font-bold text-gray-800 dark:text-[#f0f0f0]">{t('dj_section_title')}</p>
        <p className="text-sm text-gray-600 dark:text-[#b0b0b0]">
          {t('dj_section_description')}
        </p>
        <p className="text-sm">
          <button
            onClick={() => setShowDJ(true)}
            className="underline text-gray-800 dark:text-[#b0b0b0] hover:text-gray-600 dark:hover:text-[#f0f0f0] transition-colors cursor-pointer"
          >
            {t('dj_section_cta')}
          </button>
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-sm font-bold text-gray-800 dark:text-[#f0f0f0]">{t('contact_section_title')}</p>
        <p className="text-sm text-gray-600 dark:text-[#b0b0b0]">
          {t('contact_section_description')}
        </p>
        <p className="text-sm">
          <button
            onClick={() => setShowContact(true)}
            className="underline text-gray-800 dark:text-[#b0b0b0] hover:text-gray-600 dark:hover:text-[#f0f0f0] transition-colors cursor-pointer"
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
