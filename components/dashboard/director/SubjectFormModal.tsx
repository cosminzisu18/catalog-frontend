'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { api } from '@/lib/api';

type Props = {
  onClose: () => void;
  onSaved: () => void;
};

export function SubjectFormModal({ onClose, onSaved }: Props) {
  const { busy, run } = useAction();
  const [name, setName] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    const saved = await run(
      () =>
        api('/subjects', { method: 'POST', body: JSON.stringify({ name }) }),
      'Materie creata',
    );
    if (saved) onSaved();
  }

  return (
    <Modal open title="Creeaza materie" onClose={onClose}>
      <form className="space-y-3" onSubmit={submit}>
        <Input
          label="Nume materie"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Button type="submit" loading={busy} className="w-full">
          Salveaza
        </Button>
      </form>
    </Modal>
  );
}
