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

  const handleCycleLanguage = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (!languages || languages.length <= 1) return;
    const idx = languages.indexOf(currentLanguage);
    const next = languages[(idx + 1) % languages.length] || languages[0];
    await changeLanguage(next);
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
      <button
        className="cursor-pointer inline-flex gap-1 items-center"
        onClick={handleCycleLanguage}
        type="button"
        aria-label="Change language"
        title="Change language"
      >
        {icons[currentLanguage] ?? null}
      </button>
    </div>
  );
}
