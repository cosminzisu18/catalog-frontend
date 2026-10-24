'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ActionIcon, IconEdit } from '@/components/ui/ActionIcon';
import { FormActions } from '@/components/ui/FormActions';
import { InfoList } from '@/components/ui/InfoList';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Panel } from '@/components/ui/Panel';
import { useAction } from '@/hooks/useAction';
import { useLoad } from '@/hooks/useLoad';
import { api } from '@/lib/api';

type School = {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
};

type SchoolForm = { name: string; address: string; phone: string };

export function SchoolPanel() {
  const { user, login } = useAuth();
  const canEdit = !!user?.isActiveDirector;
  const { busy, run } = useAction();
  const [version, setVersion] = useState(0);
  const [form, setForm] = useState<SchoolForm | null>(null);
  const school = useLoad(() => api<School>('/schools/me'), version).data;

  function openForm() {
    if (!school) return;
    setForm({
      name: school.name,
      address: school.address ?? '',
      phone: school.phone ?? '',
    });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    const name = form.name.trim();
    const saved = await run(
      () =>
        api('/schools/me', {
          method: 'PATCH',
          body: JSON.stringify({
            name,
            address: form.address.trim() || undefined,
            phone: form.phone.trim() || undefined,
          }),
        }),
      'Datele scolii au fost salvate',
    );
    if (!saved) return;
    // the school name is also shown in the sidebar
    if (user) login({ ...user, schoolName: name });
    setForm(null);
    setVersion((v) => v + 1);
  }

  return (
    <Panel
      title="Date scoala"
      subtitle={
        canEdit
          ? 'Numele, adresa si telefonul scolii.'
          : 'Doar directorul activ poate modifica datele scolii.'
      }
      actions={
        canEdit ? (
          <ActionIcon label="Modifica" onClick={openForm} disabled={!school}>
            <IconEdit />
          </ActionIcon>
        ) : null
      }
    >
      <InfoList
        items={[
          { label: 'Nume scoala', value: school?.name ?? '—' },
          { label: 'Slug (URL)', value: school?.slug ?? '—' },
          { label: 'Adresa', value: school?.address?.trim() || '—' },
          { label: 'Telefon', value: school?.phone?.trim() || '—' },
        ]}
      />

      <Modal
        open={form !== null}
        title="Modifica scoala"
        subtitle="Slug-ul nu se poate schimba dupa creare."
        onClose={() => setForm(null)}
      >
        {form ? (
          <form className="grid gap-4" onSubmit={save}>
            <Input
              label="Nume scoala"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input label="Slug (URL)" value={school?.slug ?? ''} disabled />
            <Input
              label="Adresa"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <Input
              label="Telefon"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <FormActions onCancel={() => setForm(null)} loading={busy} />
          </form>
        ) : null}
      </Modal>
    </Panel>
  );
}
