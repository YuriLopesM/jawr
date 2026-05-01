import type { Metadata } from 'next';
import { getT } from 'next-i18next/server';
import { ContactModalWrapper } from '../../_lib/components/contact-modal-wrapper';
import { Divider } from '../../_lib/components/divider';
import { DJModalWrapper } from '../../_lib/components/dj-modal-wrapper';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT(['common', 'more']);
  const title = `jawr | ${t('nav_more')}`;
  const description = t('seo_description');

  return {
    title,
    description,
    alternates: {
      canonical: '/more',
    },
    openGraph: {
      title,
      description,
      url: '/more',
      type: 'website',
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function More() {
  const { t } = await getT('more');

  return (
    <main className="w-full h-full flex flex-col gap-8">
      <header>
        <h1 className="text-base text-gray-800 font-bold dark:text-[#f0f0f0]">
          {t('more_title')}
        </h1>
        <Divider />
      </header>

      <section className="flex flex-col gap-2">
        <p className="text-sm font-bold text-gray-800 dark:text-[#f0f0f0]">
          {t('dj_section_title')}
        </p>
        <p className="text-sm text-gray-600 dark:text-[#b0b0b0]">
          {t('dj_section_description')}
        </p>
        <div className="text-sm">
          <DJModalWrapper />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-sm font-bold text-gray-800 dark:text-[#f0f0f0]">
          {t('contact_section_title')}
        </p>
        <p className="text-sm text-gray-600 dark:text-[#b0b0b0]">
          {t('contact_section_description')}
        </p>
        <div className="text-sm">
          <ContactModalWrapper />
        </div>
      </section>
    </main>
  );
}
