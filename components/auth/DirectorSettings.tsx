'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AccountSettings } from '@/components/auth/AccountSettings';
import { useAuth } from '@/components/auth/AuthProvider';
import { Alert } from '@/components/ui/Alert';
import {
  ActionIcon,
  IconEdit,
  IconPower,
} from '@/components/ui/ActionIcon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Panel } from '@/components/ui/Panel';
import { PasswordField } from '@/components/ui/PasswordField';
import { ActiveBadge, StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { LoadingText } from '@/components/ui/LoadingText';
import { api } from '@/lib/api';
import { checkPassword } from '@/lib/password';

type DirectorProfile = {
  id: number;
  firstName: string;
  lastName: string;
};

type DirectorRow = DirectorProfile & {
  email: string;
  isActive: boolean;
  isCurrent: boolean;
};

type SchoolInfo = {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
};

export function DirectorSettings() {
  const { user, login } = useAuth();
  const toast = useToast();
  const canEdit = !!user?.isActiveDirector;

  const [me, setMe] = useState<DirectorProfile | null>(null);
  const [nameForm, setNameForm] = useState({ firstName: '', lastName: '' });
  const [nameOpen, setNameOpen] = useState(false);
  const [savingName, setSavingName] = useState(false);

  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [schoolForm, setSchoolForm] = useState({
    name: '',
    address: '',
    phone: '',
  });
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [savingSchool, setSavingSchool] = useState(false);

  const [directors, setDirectors] = useState<DirectorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    temporaryPassword: '',
  });
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  // only the first load shows the spinner
  const load = useCallback(() => {
    return Promise.all([
      api<DirectorProfile>('/directors/me').catch(() => null),
      api<DirectorRow[]>('/directors'),
      api<SchoolInfo>('/schools/me'),
    ])
      .then(([profile, list, schoolInfo]) => {
        if (profile) {
          setMe(profile);
          setNameForm({
            firstName: profile.firstName,
            lastName: profile.lastName,
          });
        }
        setDirectors(list);
        setSchool(schoolInfo);
        setSchoolForm({
          name: schoolInfo.name,
          address: schoolInfo.address ?? '',
          phone: schoolInfo.phone ?? '',
        });
      })
      .catch((err: unknown) => {
        toast.error(
          err instanceof Error ? err.message : 'Nu am putut incarca setarile',
        );
      })
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveName(e: FormEvent) {
    e.preventDefault();
    setSavingName(true);
    try {
      const updated = await api<DirectorProfile>('/directors/me', {
        method: 'PATCH',
        body: JSON.stringify({
          firstName: nameForm.firstName.trim(),
          lastName: nameForm.lastName.trim(),
        }),
      });
      setMe(updated);
      setNameOpen(false);
      toast.success('Numele a fost salvat');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Salvare esuata');
    } finally {
      setSavingName(false);
    }
  }

  function openNameModal() {
    setNameForm({
      firstName: me?.firstName ?? '',
      lastName: me?.lastName ?? '',
    });
    setNameOpen(true);
  }

  function openSchoolModal() {
    if (!school || !canEdit) return;
    setSchoolForm({
      name: school.name,
      address: school.address ?? '',
      phone: school.phone ?? '',
    });
    setSchoolOpen(true);
  }

  async function saveSchool(e: FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    setSavingSchool(true);
    try {
      const updated = await api<SchoolInfo>('/schools/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: schoolForm.name.trim(),
          address: schoolForm.address.trim() || undefined,
          phone: schoolForm.phone.trim() || undefined,
        }),
      });
      setSchool(updated);
      if (user) {
        login({ ...user, schoolName: updated.name });
      }
      setSchoolOpen(false);
      toast.success('Datele scolii au fost salvate');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Salvare esuata');
    } finally {
      setSavingSchool(false);
    }
  }

  async function addDirector(e: FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    if (!checkPassword(addForm.temporaryPassword).isStrong) {
      toast.error('Parola temporara nu este suficient de puternica');
      return;
    }
    setAdding(true);
    try {
      await api('/directors', {
        method: 'POST',
        body: JSON.stringify(addForm),
      });
      toast.success('Director adaugat');
      setAddOpen(false);
      setAddForm({
        email: '',
        firstName: '',
        lastName: '',
        temporaryPassword: '',
      });
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Nu am putut adauga directorul',
      );
    } finally {
      setAdding(false);
    }
  }

  async function activate(id: number) {
    if (!canEdit) return;
    setBusyId(id);
    try {
      await api(`/directors/${id}/activate`, { method: 'PATCH' });
      toast.success('Directorul activ a fost schimbat');
      // if we activated someone else, the current user is no longer active
      if (user) {
        const list = await api<DirectorRow[]>('/directors');
        setDirectors(list);
        const meRow = list.find((d) => d.email === user.email);
        login({
          ...user,
          isActiveDirector: meRow?.isCurrent ?? false,
        });
      } else {
        await load();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Activare esuata');
    } finally {
      setBusyId(null);
    }
  }

  const nameIncomplete = !me?.firstName?.trim() || !me?.lastName?.trim();

  return (
    <div className="space-y-5">
      <AccountSettings
        profile={
          me
            ? {
                firstName: me.firstName || undefined,
                lastName: me.lastName || undefined,
              }
            : undefined
        }
      />

      <Panel
        title="Profilul meu"
        subtitle="Prenumele si numele directorului apar in panou."
        actions={
          <ActionIcon
            label="Modifica"
            onClick={openNameModal}
            disabled={loading}
          >
            <IconEdit />
          </ActionIcon>
        }
      >
        {nameIncomplete ? (
          <div className="mb-3">
            <Alert tone="warning">Completeaza prenumele si numele directorului.</Alert>
          </div>
        ) : null}
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--color-muted)]">Prenume</dt>
            <dd className="mt-0.5 font-semibold text-[var(--color-ink)]">
              {me?.firstName?.trim() || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Nume</dt>
            <dd className="mt-0.5 font-semibold text-[var(--color-ink)]">
              {me?.lastName?.trim() || '—'}
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel
        title="Date scoala"
        subtitle={
          canEdit
            ? 'Numele, adresa si telefonul scolii.'
            : 'Doar directorul activ poate modifica datele scolii.'
        }
        actions={
          canEdit ? (
            <ActionIcon
              label="Modifica"
              onClick={openSchoolModal}
              disabled={loading || !school}
            >
              <IconEdit />
            </ActionIcon>
          ) : null
        }
      >
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--color-muted)]">Nume scoala</dt>
            <dd className="mt-0.5 font-semibold text-[var(--color-ink)]">
              {school?.name ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Slug (URL)</dt>
            <dd className="mt-0.5 font-semibold text-[var(--color-ink)]">
              {school?.slug ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Adresa</dt>
            <dd className="mt-0.5 font-semibold text-[var(--color-ink)]">
              {school?.address?.trim() || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Telefon</dt>
            <dd className="mt-0.5 font-semibold text-[var(--color-ink)]">
              {school?.phone?.trim() || '—'}
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel
        title="Directori scoala"
        subtitle="Un singur director e activ. Activarea unuia il inlocuieste pe cel curent."
        actions={
          canEdit ? (
            <Button onClick={() => setAddOpen(true)}>Adauga director</Button>
          ) : null
        }
      >
        {loading ? (
          <LoadingText />
        ) : (
          <ul className="divide-y divide-[var(--color-line)]">
            {directors.map((d) => {
              const label =
                `${d.firstName} ${d.lastName}`.trim() || 'Fara nume';
              return (
                <li
                  key={d.id}
                  className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--color-ink)]">
                      {label}
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
                      loading={busyId === d.id}
                      disabled={!d.isActive}
                      onClick={() => void activate(d.id)}
                    >
                      <IconPower />
                    </ActionIcon>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Modal
        open={nameOpen}
        title="Modifica profilul"
        subtitle="Prenumele si numele directorului."
        onClose={() => setNameOpen(false)}
      >
        <form className="grid gap-4" onSubmit={saveName}>
          <Input
            label="Prenume director"
            value={nameForm.firstName}
            onChange={(e) =>
              setNameForm((prev) => ({ ...prev, firstName: e.target.value }))
            }
            required
          />
          <Input
            label="Nume director"
            value={nameForm.lastName}
            onChange={(e) =>
              setNameForm((prev) => ({ ...prev, lastName: e.target.value }))
            }
            required
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setNameOpen(false)}
            >
              Anuleaza
            </Button>
            <Button type="submit" loading={savingName}>
              Salveaza
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={schoolOpen}
        title="Modifica scoala"
        subtitle="Slug-ul nu se poate schimba dupa creare."
        onClose={() => setSchoolOpen(false)}
      >
        <form className="grid gap-4" onSubmit={saveSchool}>
          <Input
            label="Nume scoala"
            value={schoolForm.name}
            onChange={(e) =>
              setSchoolForm((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
          <Input
            label="Slug (URL)"
            value={school?.slug ?? ''}
            disabled
            hint="Slug-ul nu se poate schimba dupa creare"
          />
          <Input
            label="Adresa"
            value={schoolForm.address}
            onChange={(e) =>
              setSchoolForm((prev) => ({ ...prev, address: e.target.value }))
            }
          />
          <Input
            label="Telefon"
            value={schoolForm.phone}
            onChange={(e) =>
              setSchoolForm((prev) => ({ ...prev, phone: e.target.value }))
            }
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSchoolOpen(false)}
            >
              Anuleaza
            </Button>
            <Button type="submit" loading={savingSchool}>
              Salveaza
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={addOpen}
        title="Adauga director"
        subtitle="Noul cont se autentifica din /login. Il poti activa oricand."
        onClose={() => setAddOpen(false)}
      >
        <form className="grid gap-4" onSubmit={addDirector}>
          <Input
            label="Prenume"
            value={addForm.firstName}
            onChange={(e) =>
              setAddForm({ ...addForm, firstName: e.target.value })
            }
            required
          />
          <Input
            label="Nume"
            value={addForm.lastName}
            onChange={(e) =>
              setAddForm({ ...addForm, lastName: e.target.value })
            }
            required
          />
          <Input
            label="Email"
            type="email"
            value={addForm.email}
            onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
            required
          />
          <PasswordField
            label="Parola temporara"
            value={addForm.temporaryPassword}
            onChange={(v) => setAddForm({ ...addForm, temporaryPassword: v })}
            allowGenerate
            required
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAddOpen(false)}
            >
              Anuleaza
            </Button>
            <Button type="submit" loading={adding}>
              Adauga
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
