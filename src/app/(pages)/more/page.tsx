'use client';

import { useState } from 'react';
import { Divider } from '../../_lib/components';
import { ContactModal } from '../../_lib/components/contact-modal';
import { DJModal } from '../../_lib/components/dj-modal';

export default function More() {
  const [showContact, setShowContact] = useState(false);
  const [showDJ, setShowDJ] = useState(false);

  return (
    <main className="w-full h-full flex flex-col gap-8">
      <header>
        <h1 className="text-base text-gray-800 font-bold">mais</h1>
        <Divider />
      </header>

      <section className="flex flex-col gap-2">
        <p className="text-sm font-bold text-gray-800">seja um dj, curador ou artista</p>
        <p className="text-sm text-gray-600">
          a jawr é aberta a quem tem algo pra tocar. DJ, curador de playlist ou artista com autoral — manda o que você tem.
        </p>
        <p className="text-sm">
          <button
            onClick={() => setShowDJ(true)}
            className="underline hover:text-gray-700 transition-colors cursor-pointer"
          >
            enviar →
          </button>
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-sm font-bold text-gray-800">fale conosco</p>
        <p className="text-sm text-gray-600">
          qualquer coisa, manda um email. perguntas, sugestões, feedback — tudo bem-vindo.
        </p>
        <p className="text-sm">
          <button
            onClick={() => setShowContact(true)}
            className="underline hover:text-gray-700 transition-colors cursor-pointer"
          >
            enviar →
          </button>
        </p>
      </section>

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      {showDJ && <DJModal onClose={() => setShowDJ(false)} />}
    </main>
  );
}
