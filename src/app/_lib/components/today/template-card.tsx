import Image from 'next/image';
import React from 'react';

type SourceType = {
  name: string;
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
    <div className="w-full aspect-square border border-gray-100 p-4 sm:p-6 flex flex-col gap-4 hover:border-gray-200 transition-colors">
      <p className="text-gray-600 text-[12px] font-semibold">{title}</p>
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
      <p className="flex flex-wrap gap-1 justify-end text-[10px] text-gray-900">
        <span className="text-gray-200">via </span>
        {source.map((src, i) => (
          <React.Fragment key={i}>
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600 transition-colors"
            >
              {src.name}
            </a>
            {i < source.length - 1 && <span className="text-gray-200">|</span>}
          </React.Fragment>
        ))}
      </p>
    </div>
  );
}
