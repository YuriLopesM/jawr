import type { I18nConfig } from 'next-i18next/proxy';

const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'pt'],
  hideDefaultLocale: true,
  localeInPath: false,
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'home', 'listen', 'blog', 'curators', 'more'],
  // Recommended: works on all platforms including Vercel/serverless
  resourceLoader: (language, namespace) =>
    import(`./src/app/i18n/locales/${language}/${namespace}.json`),
};

export default i18nConfig;
