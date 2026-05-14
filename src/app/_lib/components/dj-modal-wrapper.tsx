'use client';

import { useT } from 'next-i18next/client';
import { DJModal } from './dj-modal';
import { ModalTrigger } from './modal-trigger';

export function DJModalWrapper() {
  const { t } = useT('more');

  return (
    <ModalTrigger
      label={t('dj_section_cta')}
      renderModal={(close) => <DJModal onClose={close} />}
    />
  );
}
