'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SearchableMultiSelect } from '@/components/ui/SearchableMultiSelect';
import { useAction } from '@/hooks/useAction';
import { api } from '@/lib/api';
import type { Subject } from './types';

type Props = {
  teacherId: number;
  initialSubjectIds: number[];
  subjects: Subject[];
  onClose: () => void;
  onSaved: () => void;
};

export function TeacherSubjectsModal({
  teacherId,
  initialSubjectIds,
  subjects,
  onClose,
  onSaved,
}: Props) {
  const { busy, run } = useAction();
  const [subjectIds, setSubjectIds] = useState(initialSubjectIds);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const saved = await run(
      () =>
        api(`/subjects/teacher/${teacherId}`, {
          method: 'PUT',
          body: JSON.stringify({ subjectIds }),
        }),
      'Materiile profesorului au fost actualizate',
    );
    if (saved) onSaved();
  }

  return (
    <Modal
      open
      title="Materii predate"
      subtitle="Ce materii poate preda acest profesor"
      onClose={onClose}
    >
      <form className="space-y-3" onSubmit={submit}>
        <SearchableMultiSelect
          label="Materii"
          placeholder="Cauta materie..."
          value={subjectIds}
          onChange={setSubjectIds}
          options={subjects.map((s) => ({ value: s.id, label: s.name }))}
        />
        <Button type="submit" loading={busy} className="w-full">
          Salveaza
        </Button>
      </form>
    </Modal>
  );
}
