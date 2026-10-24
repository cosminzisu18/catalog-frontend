'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ActionIcon, IconPower } from '@/components/ui/ActionIcon';
import { Button } from '@/components/ui/Button';
import { FormActions } from '@/components/ui/FormActions';
import { Input } from '@/components/ui/Input';
import { LoadingText } from '@/components/ui/LoadingText';
import { Modal } from '@/components/ui/Modal';
import { Panel } from '@/components/ui/Panel';
import { PasswordField } from '@/components/ui/PasswordField';
import { ActiveBadge, StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { useAction } from '@/hooks/useAction';
import { useLoad } from '@/hooks/useLoad';
import { api } from '@/lib/api';
import { checkPassword } from '@/lib/password';

type DirectorRow = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  isCurrent: boolean;
};

const EMPTY_FORM = {
  email: '',
  firstName: '',
  lastName: '',
  temporaryPassword: '',
};

export function DirectorsPanel() {
  const { user, login } = useAuth();
  const canEdit = !!user?.isActiveDirector;
  const toast = useToast();
  const { busy, run } = useAction();
  const [version, setVersion] = useState(0);
  const [form, setForm] = useState<typeof EMPTY_FORM | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const directors = useLoad(() => api<DirectorRow[]>('/directors'), version).data;

  async function addDirector(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!checkPassword(form.temporaryPassword).isStrong) {
      toast.error('Parola temporara nu este suficient de puternica');
      return;
    }
    const saved = await run(
      () => api('/directors', { method: 'POST', body: JSON.stringify(form) }),
      'Director adaugat',
    );
    if (saved) {
      setForm(null);
      setVersion((v) => v + 1);
    }
  }

  async function activate(id: number) {
    setActivatingId(id);
    const saved = await run(
      () => api(`/directors/${id}/activate`, { method: 'PATCH' }),
      'Directorul activ a fost schimbat',
    );
    setActivatingId(null);
    if (!saved) return;
    // activating someone else makes the current user read-only
    if (user) login({ ...user, isActiveDirector: false });
    setVersion((v) => v + 1);
  }

  return (
    <Panel
      title="Directori scoala"
      subtitle="Un singur director e activ. Activarea unuia il inlocuieste pe cel curent."
      actions={
        canEdit ? <Button onClick={() => setForm(EMPTY_FORM)}>Adauga director</Button> : null
      }
    >
      {directors === null ? (
        <LoadingText />
      ) : (
        <ul className="divide-y divide-[var(--color-line)]">
          {directors.map((d) => (
            <li
              key={d.id}
              className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-[var(--color-ink)]">
                  {`${d.firstName} ${d.lastName}`.trim() || 'Fara nume'}
                </p>
                <p className="text-sm text-[var(--color-muted)]">{d.email}</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {d.isCurrent ? (
                    <StatusBadge tone="success">Director activ</StatusBadge>
                  ) : null}
                  <ActiveBadge isActive={d.isActive} />
                </div>
              </div>
              {canEdit && !d.isCurrent ? (
                <ActionIcon
                  label="Activeaza"
                  loading={activatingId === d.id}
                  disabled={!d.isActive}
                  onClick={() => void activate(d.id)}
                >
                  <IconPower />
                </ActionIcon>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={form !== null}
        title="Adauga director"
        subtitle="Noul cont se autentifica din /login. Il poti activa oricand."
        onClose={() => setForm(null)}
      >
        {form ? (
          <form className="grid gap-4" onSubmit={addDirector}>
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
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <PasswordField
              label="Parola temporara"
              value={form.temporaryPassword}
              onChange={(v) => setForm({ ...form, temporaryPassword: v })}
              allowGenerate
              required
            />
            <FormActions
              onCancel={() => setForm(null)}
              loading={busy}
              submitLabel="Adauga"
            />
          </form>
        ) : null}
      </Modal>
    </Panel>
  );
}
