'use client';

import { useState } from 'react';

type ModalTriggerProps = {
  label: React.ReactNode;
  renderModal: (close: () => void) => React.ReactNode;
};

export function ModalTrigger({ label, renderModal }: ModalTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="underline text-gray-800 dark:tk-body hover:text-gray-600 dark:hover:tk-accent transition-colors cursor-pointer"
      >
        {label}
      </button>
      {isOpen && renderModal(() => setIsOpen(false))}
    </>
  );
}
