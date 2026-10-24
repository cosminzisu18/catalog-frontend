'use client';

import { useState, type FormEvent } from 'react';
import { ActionIcon, IconEdit } from '@/components/ui/ActionIcon';
import { Alert } from '@/components/ui/Alert';
import { FormActions } from '@/components/ui/FormActions';
import { InfoList } from '@/components/ui/InfoList';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Panel } from '@/components/ui/Panel';
import { useAction } from '@/hooks/useAction';
import { api } from '@/lib/api';

export type DirectorProfile = {
  id: number;
  firstName: string;
  lastName: string;
};

type Props = {
  me: DirectorProfile | null;
  onSaved: () => void;
};

export function ProfilePanel({ me, onSaved }: Props) {
  const { busy, run } = useAction();
  const [form, setForm] = useState<{ firstName: string; lastName: string } | null>(null);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    const saved = await run(
      () =>
        api('/directors/me', {
          method: 'PATCH',
          body: JSON.stringify({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
          }),
        }),
      'Numele a fost salvat',
    );
    if (saved) {
      setForm(null);
      onSaved();
    }
  }

  const incomplete = !me?.firstName?.trim() || !me?.lastName?.trim();

  return (
    <Panel
      title="Profilul meu"
      subtitle="Prenumele si numele directorului apar in panou."
      actions={
        <ActionIcon
          label="Modifica"
          disabled={!me}
          onClick={() =>
            setForm({ firstName: me?.firstName ?? '', lastName: me?.lastName ?? '' })
          }
        >
          <IconEdit />
        </ActionIcon>
      }
    >
      {incomplete ? (
        <div className="mb-3">
          <Alert tone="warning">Completeaza prenumele si numele directorului.</Alert>
        </div>
      ) : null}
      <InfoList
        items={[
          { label: 'Prenume', value: me?.firstName?.trim() || '—' },
          { label: 'Nume', value: me?.lastName?.trim() || '—' },
        ]}
      />

      <Modal
        open={form !== null}
        title="Modifica profilul"
        subtitle="Prenumele si numele directorului."
        onClose={() => setForm(null)}
      >
        {form ? (
          <form className="grid gap-4" onSubmit={save}>
            <Input
              label="Prenume director"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <Input
              label="Nume director"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
            <FormActions onCancel={() => setForm(null)} loading={busy} />
          </form>
        ) : null}
      </Modal>
    </Panel>
  );
}
