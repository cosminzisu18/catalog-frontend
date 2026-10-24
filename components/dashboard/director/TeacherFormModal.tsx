'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PasswordField } from '@/components/ui/PasswordField';
import { useToast } from '@/components/ui/Toast';
import { useAction } from '@/hooks/useAction';
import { api } from '@/lib/api';
import { checkPassword } from '@/lib/password';
import type { Teacher } from './types';

type Props = {
  // null = add a new teacher
  teacher: Teacher | null;
  onClose: () => void;
  onSaved: () => void;
};

export function TeacherFormModal({ teacher, onClose, onSaved }: Props) {
  const toast = useToast();
  const { busy, run } = useAction();
  const [form, setForm] = useState({
    email: teacher?.email ?? '',
    firstName: teacher?.firstName ?? '',
    lastName: teacher?.lastName ?? '',
    temporaryPassword: '',
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const password = form.temporaryPassword;
    // the password is required when adding, optional when editing
    if ((!teacher || password) && !checkPassword(password).isStrong) {
      toast.error('Parola nu este puternica');
      return;
    }

    const body = {
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      ...(password && { temporaryPassword: password }),
    };
    const saved = await run(
      () =>
        api(teacher ? `/teachers/${teacher.id}` : '/teachers', {
          method: teacher ? 'PATCH' : 'POST',
          body: JSON.stringify(body),
        }),
      teacher ? 'Profesor actualizat' : 'Profesor adaugat',
    );
    if (saved) onSaved();
  }

  return (
    <Modal open title={teacher ? 'Modifica profesor' : 'Adauga profesor'} onClose={onClose}>
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
        <PasswordField
          label={teacher ? 'Parola noua (optional)' : 'Parola temporara'}
          value={form.temporaryPassword}
          onChange={(v) => setForm({ ...form, temporaryPassword: v })}
          allowGenerate
          required={!teacher}
        />
        <Button type="submit" loading={busy} className="w-full">
          Salveaza
        </Button>
      </form>
    </Modal>
  );
}
