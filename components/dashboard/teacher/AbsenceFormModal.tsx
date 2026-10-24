'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useAction } from '@/hooks/useAction';
import { api } from '@/lib/api';
import { formatDateDdMmYyyy } from '@/lib/format';
import type { Student, Subject } from './types';
import { useLessonCheck } from './useLessonCheck';

type Props = {
  subjects: Subject[];
  students: Student[];
  onClose: () => void;
  onSaved: () => void;
};

export function AbsenceFormModal({ subjects, students, onClose, onSaved }: Props) {
  const { busy, run } = useAction();
  const [form, setForm] = useState({ studentId: '', subjectId: '' });
  const check = useLessonCheck(form.subjectId);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const saved = await run(
      () =>
        api('/absences', {
          method: 'POST',
          body: JSON.stringify({
            studentId: Number(form.studentId),
            subjectId: Number(form.subjectId),
          }),
        }),
      'Absenta adaugata',
    );
    if (saved) onSaved();
  }

  return (
    <Modal
      open
      title="Pune absenta"
      subtitle={`Pentru ora de azi, ${formatDateDdMmYyyy()}`}
      onClose={onClose}
    >
      <form className="space-y-3" onSubmit={submit}>
        <Alert tone="warning">
          Un elev cu absenta nu mai poate primi nota la aceasta materie azi.
          Absenta poate fi motivata doar de director.
        </Alert>
        {check ? (
          <Alert tone={check.inLesson ? 'success' : 'error'}>{check.message}</Alert>
        ) : null}
        <Select
          label="Materie"
          value={form.subjectId}
          onChange={(v) => setForm({ ...form, subjectId: v })}
          options={subjects.map((s) => ({ value: s.id, label: s.name }))}
          required
        />
        <Select
          label="Elev"
          value={form.studentId}
          onChange={(v) => setForm({ ...form, studentId: v })}
          options={students.map((s) => ({
            value: s.id,
            label: `${s.firstName} ${s.lastName}`,
            meta: s.className,
          }))}
          searchPlaceholder="Cauta elev..."
          required
        />
        <Button
          type="submit"
          loading={busy}
          className="w-full"
          disabled={check !== null && !check.inLesson}
        >
          Salveaza absenta
        </Button>
      </form>
    </Modal>
  );
}
