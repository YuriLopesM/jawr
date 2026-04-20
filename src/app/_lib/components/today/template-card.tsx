import Image from 'next/image';
import React from 'react';

type SourceType = {
  name: string;
  shortName?: string;
  url: string;
};

type TemplateCardProps = {
  title: string;
  image: string;
  description: {
    title: string;
    subtitle?: string;
  };
  source: SourceType[];
};

export function TemplateCard({
  title,
  image,
  description,
  source,
}: TemplateCardProps) {
  const hasSubtitle = Boolean(description.subtitle);

  return (
    <div className="w-full aspect-square border border-gray-100 dark:border-[#2a2a2a] p-4 sm:p-6 flex flex-col gap-4 hover:border-gray-200 dark:hover:border-[#3a3a3a] transition-colors">
      <p className="text-gray-600 dark:text-[#6e6e6e] text-[12px] font-semibold">{title}</p>
      <section className="relative w-full h-full">
        <Image
          src={image}
          alt={title}
          width={160}
          height={160}
          loading="eager"
          className="w-full h-full object-cover"
        />

        <div className="flex flex-col absolute bottom-0 left-0 right-0 gap-0.5 text-[10px] text-gray-50 w-full py-3 px-2 overflow-hidden bg-gray-950/70">
          <h3 className="font-semibold line-clamp-2">{description.title}</h3>
          {hasSubtitle && <p>{description.subtitle}</p>}
        </div>
      </section>
      <p className="flex flex-wrap gap-1 justify-end text-[10px] text-gray-900 dark:text-[#6e6e6e]">
        <span className="text-gray-200 dark:text-[#3a3a3a]">via </span>
        {source.map((src, i) => (
          <React.Fragment key={i}>
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600 dark:hover:text-[#b0b0b0] transition-colors"
            >
              {src.shortName ? (
                <>
                  <span className="lg:hidden">{src.shortName}</span>
                  <span className="hidden lg:inline">{src.name}</span>
                </>
              ) : src.name}
            </a>
            {i < source.length - 1 && <span className="text-gray-200 dark:text-[#3a3a3a]">|</span>}
          </React.Fragment>
        ))}
      </p>
    </div>
  );
}
