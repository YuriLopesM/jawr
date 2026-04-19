'use client';
import { useChangeLanguage } from 'next-i18next/client';
import { useRouter } from 'next/navigation';
import i18nConfig from '../../../../i18n.config';

const languages = i18nConfig.supportedLngs;

export function LanguageSwitcher({
  currentLanguage,
}: {
  currentLanguage: string;
}) {
  const router = useRouter();
  const changeLanguage = useChangeLanguage();

  const handleChangeLanguage = (
    e: React.MouseEvent<HTMLButtonElement>,
    lang: string
  ) => {
    e.preventDefault();
    changeLanguage(lang);
    router.refresh();
  };

  return (
    <div>
      {languages.map((lang) => {
        if (lang === currentLanguage) {
          return null;
        }
        return (
          <span key={lang}>
            <button
              className="cursor-pointer"
              onClick={(e) => handleChangeLanguage(e, lang)}
              type="button"
            >
              {lang}
            </button>
          </span>
        );
      })}
    </div>
  );
}
