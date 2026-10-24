'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AuthShell } from '@/components/layout/AuthShell';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

type ForgotResponse = {
  message: string;
  devResetUrl?: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState<ForgotResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setDone(null);
    setLoading(true);
    try {
      const data = await api<ForgotResponse>('/auth/forgot-password', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email }),
      });
      setDone(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cererea a esuat');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Ai uitat parola?"
      subtitle="Introdu emailul contului. Daca exista, vei primi un link de resetare."
      footer={
        <>
          Ti-ai amintit?{' '}
          <Link
            href="/login"
            className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
          >
            Inapoi la login
          </Link>
        </>
      }
    >
      {done ? (
        <div className="space-y-4">
          <Alert tone="success">{done.message}</Alert>
          {done.devResetUrl ? (
            <Alert tone="info">
              Development:{' '}
              <Link
                href={done.devResetUrl}
                className="font-semibold underline"
              >
                deschide linkul de resetare
              </Link>
            </Alert>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">
              Verifica inbox-ul (si folderul spam). Linkul este valabil o ora.
            </p>
          )}
          <Link
            href="/login"
            className="inline-flex text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
          >
            Inapoi la login
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          {error ? <Alert tone="error">{error}</Alert> : null}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Button type="submit" loading={loading} className="w-full py-3">
            Trimite linkul
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
