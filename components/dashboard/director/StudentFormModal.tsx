'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PasswordField } from '@/components/ui/PasswordField';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { useAction } from '@/hooks/useAction';
import { api } from '@/lib/api';
import { formatDateDdMmYyyy } from '@/lib/format';
import { checkPassword } from '@/lib/password';
import type { ClassOption, Student } from './types';

type Props = {
  // null = add a new student
  student: Student | null;
  classes: ClassOption[];
  onClose: () => void;
  onSaved: () => void;
};

export function StudentFormModal({ student, classes, onClose, onSaved }: Props) {
  const toast = useToast();
  const { busy, run } = useAction();
  const [form, setForm] = useState({
    email: student?.email ?? '',
    firstName: student?.firstName ?? '',
    lastName: student?.lastName ?? '',
    classId: student ? String(student.classId) : '',
    birthDate: student?.birthDate ?? '',
    temporaryPassword: '',
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.classId) {
      toast.error('Selecteaza o clasa (creeaza clase din meniul Clase)');
      return;
    }
    const password = form.temporaryPassword;
    if ((!student || password) && !checkPassword(password).isStrong) {
      toast.error('Parola nu este puternica');
      return;
    }

    const body = {
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      classId: Number(form.classId),
      ...(form.birthDate && { birthDate: form.birthDate }),
      ...(password && { temporaryPassword: password }),
    };
    const saved = await run(
      () =>
        api(student ? `/students/${student.id}` : '/students', {
          method: student ? 'PATCH' : 'POST',
          body: JSON.stringify(body),
        }),
      student ? 'Elev actualizat' : 'Elev adaugat',
    );
    if (saved) onSaved();
  }

  return (
    <Modal open title={student ? 'Modifica elev' : 'Adauga elev'} onClose={onClose}>
      <form className="space-y-3" onSubmit={submit}>
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Prenume"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          required
        />
        <Input
          label="Nume"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          required
        />
        <DateField
          label="Data nasterii"
          value={form.birthDate}
          onChange={(v) => setForm({ ...form, birthDate: v })}
          max={formatDateDdMmYyyy()}
        />
        <Select
          label="Clasa"
          value={form.classId}
          onChange={(v) => setForm({ ...form, classId: v })}
          options={classes.map((c) => ({ value: c.id, label: c.name }))}
          searchPlaceholder="Cauta clasa..."
          required
        />
        {classes.length === 0 ? (
          <p className="text-xs text-[var(--color-danger)]">
            Creeaza mai intai o clasa din meniul Clase.
          </p>
        ) : null}
        <PasswordField
          label={student ? 'Parola noua (optional)' : 'Parola temporara'}
          value={form.temporaryPassword}
          onChange={(v) => setForm({ ...form, temporaryPassword: v })}
          allowGenerate
          required={!student}
        />
        <Button type="submit" loading={busy} className="w-full">
          Salveaza
        </Button>
      </form>
    </Modal>
  );
}
