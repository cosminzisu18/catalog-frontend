'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useAction } from '@/hooks/useAction';
import { api } from '@/lib/api';
import { formatDateDdMmYyyy } from '@/lib/format';
import type { GradeType, Student, Subject } from './types';
import { useLessonCheck } from './useLessonCheck';

type Props = {
  subjects: Subject[];
  students: Student[];
  onClose: () => void;
  onSaved: () => void;
};

export function GradeFormModal({ subjects, students, onClose, onSaved }: Props) {
  const { busy, run } = useAction();
  const [form, setForm] = useState({
    studentId: '',
    subjectId: '',
    value: '10',
    type: 'NORMAL' as GradeType,
    gradedOn: formatDateDdMmYyyy(),
  });

  const check = useLessonCheck(form.subjectId);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const saved = await run(
      () =>
        api('/grades', {
          method: 'POST',
          body: JSON.stringify({
            studentId: Number(form.studentId),
            subjectId: Number(form.subjectId),
            value: Number(form.value),
            type: form.type,
            gradedOn: form.gradedOn,
          }),
        }),
      form.type === 'THESIS' ? 'Teza adaugata' : 'Nota adaugata',
    );
    if (saved) onSaved();
  }

  return (
    <Modal
      open
      title="Adauga nota"
      subtitle="O singura nota pe elev + materie + zi"
      onClose={onClose}
      wide
    >
      <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
        <div className="sm:col-span-2 space-y-2">
          <Alert tone="warning">
            Dupa salvare, nota nu mai poate fi modificata de tine. Pentru
            corectii, trimiti o cerere directorului.
          </Alert>
          {check ? (
            <Alert tone={check.inLesson ? 'success' : 'error'}>
              {check.message}
            </Alert>
          ) : null}
        </div>
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
        <Input
          label="Nota"
          type="number"
          min="1"
          max="10"
          step="0.01"
          inputMode="decimal"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          required
        />
        <Select
          label="Tip nota"
          value={form.type}
          onChange={(v) => setForm({ ...form, type: (v || 'NORMAL') as GradeType })}
          options={[
            { value: 'NORMAL', label: 'Nota curenta' },
            { value: 'THESIS', label: 'Teza (o singura data pe an)' },
          ]}
          required
        />
        <DateField
          label="Data notei"
          value={form.gradedOn}
          onChange={(v) => setForm({ ...form, gradedOn: v })}
          max={formatDateDdMmYyyy()}
          required
        />
        <div className="sm:col-span-2">
          <Button
            type="submit"
            loading={busy}
            className="w-full"
            disabled={check !== null && !check.inLesson}
          >
            Salveaza nota
          </Button>
        </div>
      </form>
    </Modal>
  );
}
