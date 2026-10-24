'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { useAction } from '@/hooks/useAction';
import { api } from '@/lib/api';

type Props = {
  title: string;
  subtitle: string;
  teacherReason: string;
  // PATCH endpoint that takes { approve, directorReason }
  decideUrl: string;
  approveLabel?: string;
  messages: { approved: string; rejected: string };
  onClose: () => void;
  onSaved: () => void;
};

// approve / reject a teacher request (conduct or grade edit)
export function DecisionModal({
  title,
  subtitle,
  teacherReason,
  decideUrl,
  approveLabel = 'Aproba',
  messages,
  onClose,
  onSaved,
}: Props) {
  const toast = useToast();
  const { busy, run } = useAction();
  const [reason, setReason] = useState('');

  async function decide(approve: boolean) {
    const directorReason = reason.trim();
    if (directorReason.length < 5) {
      toast.error('Motivul directorului trebuie sa aiba minim 5 caractere');
      return;
    }
    const saved = await run(
      () =>
        api(decideUrl, {
          method: 'PATCH',
          body: JSON.stringify({ approve, directorReason }),
        }),
      approve ? messages.approved : messages.rejected,
    );
    if (saved) onSaved();
  }

  return (
    <Modal open title={title} subtitle={subtitle} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-muted)]">
          Motiv profesor: {teacherReason}
        </p>
        <Textarea
          label="Motiv director"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button loading={busy} onClick={() => decide(true)}>
            {approveLabel}
          </Button>
          <Button variant="danger" loading={busy} onClick={() => decide(false)}>
            Respinge
          </Button>
        </div>
      </div>
    </Modal>
  );
}
