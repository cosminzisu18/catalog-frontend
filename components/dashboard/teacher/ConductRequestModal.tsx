'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useAction } from '@/hooks/useAction';
import { api } from '@/lib/api';
import type { Student } from './types';

type Props = {
  students: Student[];
  onClose: () => void;
  onSaved: () => void;
};

export function ConductRequestModal({ students, onClose, onSaved }: Props) {
  const { busy, run } = useAction();
  const [form, setForm] = useState({
    studentId: '',
    proposedGrade: '',
    teacherReason: '',
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const saved = await run(
      () =>
        api('/conduct', {
          method: 'POST',
          body: JSON.stringify({
            studentId: Number(form.studentId),
            proposedGrade: Number(form.proposedGrade),
            teacherReason: form.teacherReason,
          }),
        }),
      'Cerere trimisa la director',
    );
    if (saved) onSaved();
  }

  return (
    <Modal open title="Cerere scadere purtare" onClose={onClose} wide>
      <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
        <Select
          label="Elev"
          value={form.studentId}
          onChange={(v) => setForm({ ...form, studentId: v })}
          options={students.map((s) => ({
            value: s.id,
            label: `${s.firstName} ${s.lastName}`,
            meta: `purtare ${Number(s.conductGrade)}`,
          }))}
          searchPlaceholder="Cauta elev..."
          required
        />
        <Input
          label="Nota propusa"
          type="number"
          min="1"
          max="10"
          step="0.5"
          value={form.proposedGrade}
          onChange={(e) => setForm({ ...form, proposedGrade: e.target.value })}
          required
        />
        <div className="sm:col-span-2">
          <Textarea
            label="Motiv"
            value={form.teacherReason}
            onChange={(e) => setForm({ ...form, teacherReason: e.target.value })}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" loading={busy} className="w-full">
            Trimite cererea
          </Button>
        </div>
      </form>
    </Modal>
  );
}
