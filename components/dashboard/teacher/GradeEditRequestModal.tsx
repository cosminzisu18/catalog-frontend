'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { useAction } from '@/hooks/useAction';
import { api } from '@/lib/api';
import { formatGrade } from '@/lib/format';

type Props = {
  gradeId: number;
  currentValue: number;
  onClose: () => void;
  onSaved: () => void;
};

export function GradeEditRequestModal({
  gradeId,
  currentValue,
  onClose,
  onSaved,
}: Props) {
  const toast = useToast();
  const { busy, run } = useAction();
  const [proposedValue, setProposedValue] = useState(String(currentValue));
  const [reason, setReason] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    const teacherReason = reason.trim();
    if (teacherReason.length < 5) {
      toast.error('Motivul trebuie sa aiba minim 5 caractere');
      return;
    }
    const saved = await run(
      () =>
        api(`/grades/${gradeId}/edit-requests`, {
          method: 'POST',
          body: JSON.stringify({
            proposedValue: Number(proposedValue),
            teacherReason,
          }),
        }),
      'Cererea de editare a fost trimisa directorului',
    );
    if (saved) onSaved();
  }

  return (
    <Modal
      open
      title="Cerere editare nota"
      subtitle={`Nota actuala: ${formatGrade(currentValue)}. Doar directorul poate aplica modificarea.`}
      onClose={onClose}
    >
      <form className="space-y-3" onSubmit={submit}>
        <Input
          label="Nota propusa"
          type="number"
          min="1"
          max="10"
          step="0.01"
          inputMode="decimal"
          value={proposedValue}
          onChange={(e) => setProposedValue(e.target.value)}
          required
        />
        <Textarea
          label="Motiv"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        <Button type="submit" loading={busy} className="w-full">
          Trimite cererea
        </Button>
      </form>
    </Modal>
  );
}
