'use client';

import { useT } from 'next-i18next/client';
import { ContactModal } from './contact-modal';
import { ModalTrigger } from './modal-trigger';

export function ContactModalWrapper() {
  const { t } = useT('more');

  return (
    <ModalTrigger
      label={t('contact_section_cta')}
      renderModal={(close) => <ContactModal onClose={close} />}
    />
  );
}
