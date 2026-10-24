'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { AuthShell } from '@/components/layout/AuthShell';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { PasswordField } from '@/components/ui/PasswordField';
import { api } from '@/lib/api';
import { checkPassword } from '@/lib/password';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center font-sans text-sm text-[var(--color-muted)]">
          Se incarca...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Link invalid: lipseste tokenul de resetare');
      return;
    }
    if (!checkPassword(password).isStrong) {
      setError('Parola nu este suficient de puternica');
      return;
    }
    if (password !== confirm) {
      setError('Parolele nu coincid');
      return;
    }

    setLoading(true);
    try {
      await api('/auth/reset-password', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ token, newPassword: password }),
      });
      router.push('/login?reset=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resetare esuata');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Parola noua"
      subtitle="Alege o parola puternica pentru contul tau."
      footer={
        <>
          <Link
            href="/login"
            className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
          >
            Inapoi la login
          </Link>
        </>
      }
    >
      {!token ? (
        <Alert tone="error">
          Link invalid sau incomplet. Cere din nou resetarea parolei.
        </Alert>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          {error ? <Alert tone="error">{error}</Alert> : null}
          <PasswordField
            label="Parola noua"
            value={password}
            onChange={setPassword}
            required
            autoComplete="new-password"
          />
          <PasswordField
            label="Confirma parola"
            value={confirm}
            onChange={setConfirm}
            showStrength={false}
            required
            autoComplete="new-password"
            error={
              confirm && password !== confirm ? 'Parolele nu coincid' : undefined
            }
          />
          <Button type="submit" loading={loading} className="w-full py-3">
            Salveaza parola
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
