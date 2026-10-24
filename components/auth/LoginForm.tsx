'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordField } from '@/components/ui/PasswordField';
import { api } from '@/lib/api';
import { dashboardPath, type AuthUser } from '@/lib/auth';

type Props = {
  // /auth/login for directors, /auth/login/:slug for teachers and students
  endpoint: string;
  notice?: ReactNode;
};

export function LoginForm({ endpoint, notice }: Props) {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api<{ user: AuthUser }>(endpoint, {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email, password, rememberMe }),
      });
      login(data.user);
      router.push(dashboardPath(data.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login esuat');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {notice}
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <PasswordField
        value={password}
        onChange={setPassword}
        showStrength={false}
        required
        autoComplete="current-password"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-muted)]">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          Tine-ma minte
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
        >
          Ai uitat parola?
        </Link>
      </div>
      <Button type="submit" loading={loading} className="mt-2 w-full py-3">
        Conectare
      </Button>
    </form>
  );
}
