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

export function HoursModal({ onClose, onSaved }: Props) {
  const { busy, run } = useAction();
  const [hours, setHours] = useState('1');

  async function submit(e: FormEvent) {
    e.preventDefault();
    const saved = await run(
      () =>
        api('/teachers/me/hours', {
          method: 'POST',
          body: JSON.stringify({ hours: Number(hours) }),
        }),
      'Ore inregistrate',
    );
    if (saved) onSaved();
  }

  return (
    <Modal open title="Inregistreaza ore" onClose={onClose}>
      <form className="space-y-3" onSubmit={submit}>
        <Input
          label="Ore"
          type="number"
          step="0.5"
          min="0.5"
          max="12"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />
        <Button type="submit" loading={busy} className="w-full">
          Salveaza
        </Button>
      </form>
    </Modal>
  );
}
