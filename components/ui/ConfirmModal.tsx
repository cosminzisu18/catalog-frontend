'use client';

import { Button } from './Button';
import { Modal } from './Modal';

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirma',
  cancelLabel = 'Anuleaza',
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm text-[var(--color-muted)]">{message}</p>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
