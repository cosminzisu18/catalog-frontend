'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { api } from '@/lib/api';
import type { Absence } from '@/lib/absences';

type Props = {
  absence: Absence;
  onClose: () => void;
  onSaved: () => void;
};

export function MotivateAbsenceModal({ absence, onClose, onSaved }: Props) {
  const { busy, run } = useAction();
  const [reason, setReason] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    const saved = await run(
      () =>
        api(`/absences/${absence.id}/motivate`, {
          method: 'PATCH',
          body: JSON.stringify({ reason: reason.trim() || undefined }),
        }),
      'Absenta motivata',
    );
    if (saved) onSaved();
  }

  return (
    <Modal
      open
      title="Motiveaza absenta"
      subtitle={`${absence.studentName} (${absence.className}) · ${absence.subjectName} · ${absence.absentOn}`}
      onClose={onClose}
    >
      <form className="space-y-3" onSubmit={submit}>
        <Input
          label="Motiv (optional)"
          placeholder="de exemplu: adeverinta medicala"
          maxLength={255}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button type="submit" loading={busy} className="w-full">
          Motiveaza
        </Button>
      </form>
    </Modal>
  );
}
