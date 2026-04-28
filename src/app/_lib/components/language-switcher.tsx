'use client';
import { useChangeLanguage } from 'next-i18next/client';
import { useRouter } from 'next/navigation';

import Image from 'next/image';

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

  const icons: Record<string, React.ReactNode> = {
    en: (
      <Image
        priority
        src="/flags/us.svg"
        height={0}
        width={0}
        className="w-3.5 h-auto"
        alt="US"
      />
    ),
    pt: (
      <Image
        priority
        src="/flags/br.svg"
        height={0}
        width={0}
        className="w-3.5 h-auto"
        alt="BR"
      />
    ),
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
              className="cursor-pointer inline-flex gap-1 items-center"
              onClick={(e) => handleChangeLanguage(e, lang)}
              type="button"
            >
              {icons[lang]}
            </button>
          </span>
        );
      })}
    </div>
  );
}
