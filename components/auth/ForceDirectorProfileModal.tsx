'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import type { AuthUser } from '@/lib/auth';

export function ForceDirectorProfileModal() {
  const { user, login, logout } = useAuth();
  const open = !!user?.mustCompleteProfile;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const prenume = firstName.trim();
    const nume = lastName.trim();
    if (!prenume || !nume) {
      setError('Prenumele si numele directorului sunt obligatorii');
      return;
    }

    setLoading(true);
    try {
      await api('/directors/me', {
        method: 'PATCH',
        body: JSON.stringify({ firstName: prenume, lastName: nume }),
      });
      const refreshed = await api<AuthUser>('/auth/me');
      login(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Salvare esuata');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Completeaza profilul"
      subtitle="Inainte de a folosi catalogul, completeaza prenumele si numele directorului. Nu poti inchide acest pas."
      dismissible={false}
    >
      <form className="grid gap-4" onSubmit={onSubmit}>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Input
          label="Prenume director"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoFocus
          required
        />
        <Input
          label="Nume director"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <Button type="submit" loading={loading}>
          Salveaza
        </Button>
      </form>
      <button
        type="button"
        onClick={() => void logout()}
        className="mt-3 w-full text-center text-sm font-medium text-[var(--color-muted)] hover:underline"
      >
        Iesi din cont
      </button>
    </Modal>
  );
}
