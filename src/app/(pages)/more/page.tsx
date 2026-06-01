import type { Metadata } from 'next';
import { getT } from 'next-i18next/server';
import { ContactModalWrapper } from '../../_lib/components/contact-modal-wrapper';
import { Divider } from '../../_lib/components/divider';
import { DJModalWrapper } from '../../_lib/components/dj-modal-wrapper';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT(['common', 'more']);
  const title = `jawr | ${t('nav_more')}`;
  const description = t('more:seo_description');

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
      images: ['/og-image.png'],
    },
    twitter: {
      title,
      description,
      images: ['/og-image.png'],
    },
  };
}

export default async function More() {
  const { t } = await getT('more');

  return (
    <main className="w-full h-full flex flex-col gap-8">
      <header>
        <h1 className="text-base text-gray-800 font-bold dark:tk-heading">
          {t('more_title')}
        </h1>
        <Divider />
      </header>

      <section className="flex flex-col gap-2">
        <p className="text-sm font-bold text-gray-800 dark:tk-heading">
          {t('branding_section_title')}
        </p>
        <p className="text-sm text-gray-600 dark:tk-body">
          {t('branding_section_description')}
        </p>
        <a
          href="https://www.behance.net/gallery/249733661/Just-Another-Web-Radio-Branding-Project"
          target="_blank"
          rel="noopener noreferrer"
          className="self-start text-sm underline text-gray-800 dark:tk-heading hover:text-gray-600 dark:hover:tk-accent transition-colors"
        >
          {t('branding_section_cta')}
        </a>
      </section>

      <section className="flex flex-col gap-2 items-end">
        <p className="text-sm font-bold text-gray-800 dark:tk-heading">
          {t('dj_section_title')}
        </p>
        <p className="text-sm text-gray-600 dark:tk-body">
          {t('dj_section_description')}
        </p>
        <div className="text-sm flex flex-col items-end">
          <DJModalWrapper />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-sm font-bold text-gray-800 dark:tk-heading">
          {t('contact_section_title')}
        </p>
        <p className="text-sm text-gray-600 dark:tk-body">
          {t('contact_section_description')}
        </p>
        <div className="text-sm">
          <ContactModalWrapper />
        </div>
      </section>
    </main>
  );
}
