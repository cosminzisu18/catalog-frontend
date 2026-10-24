'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Panel } from '@/components/ui/Panel';
import { PasswordField } from '@/components/ui/PasswordField';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { checkPassword } from '@/lib/password';
import type { AuthUser } from '@/lib/auth';

type Props = {
  // no Panel wrapper (used inside a modal)
  embedded?: boolean;
  forced?: boolean;
  onSuccess?: () => void;
};

export function ChangePasswordForm({ embedded, forced, onSuccess }: Props) {
  const { user, login } = useAuth();
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (!checkPassword(newPassword).isStrong) {
      toast.error('Parola noua nu este suficient de puternica');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Parolele nu coincid');
      return;
    }

    setLoading(true);
    try {
      const data = await api<{ user: AuthUser }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      // the server closed the other sessions and set new cookies
      login(data.user);
      toast.success('Parola a fost actualizata');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eroare');
    } finally {
      setLoading(false);
    }
  }

  const form = (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Input
        label="Parola curenta"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
        autoComplete="current-password"
      />
      <PasswordField
        label="Parola noua"
        value={newPassword}
        onChange={setNewPassword}
        required
      />
      <PasswordField
        label="Confirma parola noua"
        name="confirmPassword"
        value={confirmPassword}
        onChange={setConfirmPassword}
        showStrength={false}
        required
        error={
          confirmPassword && newPassword !== confirmPassword
            ? 'Parolele nu coincid'
            : undefined
        }
      />
      <Button type="submit" loading={loading} className="w-full">
        Salveaza parola
      </Button>
    </form>
  );

  if (embedded) return form;

  return (
    <Panel
      title="Schimba parola"
      subtitle={
        forced || user?.mustChangePassword
          ? 'La primul login, parola temporara trebuie inlocuita.'
          : 'Actualizeaza parola contului tau.'
      }
    >
      <div className="max-w-lg">{form}</div>
    </Panel>
  );
}
