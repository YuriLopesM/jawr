import type { Metadata } from 'next';
import { getT } from 'next-i18next/server';
import {
  ChromeIcon,
  Divider,
  FirefoxIcon,
  GithubIcon,
  IconLink,
} from '../../_lib/components';

const CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/jawr-just-another-web-rad/iojdmpebpopkfdcpdipaonhlcfkkdbck';
const FIREFOX_ADDON_URL =
  'https://addons.mozilla.org/firefox/addon/jawr-just-another-web-radio/';
const GITHUB_REPO_URL = 'https://github.com/xrnst/jawr-browser-ext';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT(['common', 'extension']);
  const title = `jawr | ${t('nav_extension')}`;
  const description = t('extension:seo_description');

  return {
    title,
    description,
    alternates: {
      canonical: '/extension',
    },
    openGraph: {
      title,
      description,
      url: '/extension',
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

export default async function Extension() {
  const { t } = await getT('extension');
  const features = t('features', { returnObjects: true }) as string[];
  const shortcuts = t('shortcuts', { returnObjects: true }) as string[];

  return (
    <main className="w-full h-full flex flex-col gap-8">
      <header>
        <h1 className="text-base text-gray-800 font-bold dark:tk-heading">
          {t('extension_title')}
        </h1>
        <Divider />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-12">
        <div className="flex flex-col gap-8 min-w-0">
          <section>
            <p className="text-sm text-gray-600 dark:tk-body">
              {t('description')}
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <p className="text-sm font-bold text-gray-800 dark:tk-heading">
              {t('features_title')}
            </p>
            <ul className="flex flex-col gap-1">
              {features.map((feature) => (
                <li key={feature} className="text-sm text-gray-600 dark:tk-body">
                  - {feature}
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <p className="text-sm font-bold text-gray-800 dark:tk-heading">
              {t('shortcuts_title')}
            </p>
            <ul className="flex flex-col gap-1">
              {shortcuts.map((shortcut) => (
                <li key={shortcut} className="text-sm text-gray-600 dark:tk-body">
                  - {shortcut}
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <p className="text-sm font-bold text-gray-800 dark:tk-heading">
              {t('install_title')}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <IconLink
                href={CHROME_STORE_URL}
                icon={<ChromeIcon />}
                label={t('install_chrome')}
              />
              <IconLink
                href={FIREFOX_ADDON_URL}
                icon={<FirefoxIcon />}
                label={t('install_firefox')}
              />
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <p className="text-sm font-bold text-gray-800 dark:tk-heading">
              {t('source_title')}
            </p>
            <IconLink
              href={GITHUB_REPO_URL}
              icon={<GithubIcon />}
              label={t('source_link')}
            />
          </section>
        </div>

        <aside className="md:sticky md:top-12 md:self-start">
          <img
            src="/extension/popup-light.png"
            alt={t('preview_light_alt')}
            className="w-full md:w-72 h-auto"
          />
        </aside>
      </div>
    </main>
  );
}
