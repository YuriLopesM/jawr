'use client';

import { useState } from 'react';
import { ContactModal } from '../../_lib/components/contact-modal';

type Props = {
  onOpen: () => void;
};

export function ContactModalWrapper() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="underline text-gray-800 dark:tk-body hover:text-gray-600 dark:hover:tk-accent transition-colors cursor-pointer"
      >
        send →
      </button>
      {show && <ContactModal onClose={() => setShow(false)} />}
    </>
  );
}
