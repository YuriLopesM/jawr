'use client';

import { useState } from 'react';
import { DJModal } from '../../_lib/components/dj-modal';

type Props = {
  onOpen: () => void;
};

export function DJModalWrapper() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="underline text-gray-800 dark:tk-body hover:text-gray-600 dark:hover:tk-accent transition-colors cursor-pointer"
      >
        join →
      </button>
      {show && <DJModal onClose={() => setShow(false)} />}
    </>
  );
}
