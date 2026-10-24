'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthShell } from '@/components/layout/AuthShell';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordField } from '@/components/ui/PasswordField';
import { api } from '@/lib/api';
import { checkPassword } from '@/lib/password';
import type { AuthUser } from '@/lib/auth';

type AuthResponse = { user: AuthUser };

// "Scoala Tanasoaia" -> scoala-tanasoaia
function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export default function RegisterSchoolPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    schoolName: '',
    slug: '',
    address: '',
    phone: '',
    directorEmail: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slugLocked, setSlugLocked] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSchoolNameChange(value: string) {
    setForm((prev) => ({
      ...prev,
      schoolName: value,
      slug: slugLocked ? prev.slug : slugify(value),
    }));
  }

  function onSlugChange(value: string) {
    setSlugLocked(true);
    update('slug', slugify(value));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!checkPassword(form.password).isStrong) {
      setError('Parola nu este suficient de puternica');
      return;
    }

    if (form.password !== confirmPassword) {
      setError('Parolele nu coincid');
      return;
    }

    setLoading(true);
    try {
      const data = await api<AuthResponse>('/auth/register', {
        method: 'POST',
        auth: false,
        body: JSON.stringify(form),
      });
      login(data.user);
      router.push('/director');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inregistrare esuata');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      wide
      title="Inregistreaza scoala"
      subtitle="Creezi scoala si contul de director. Dupa inregistrare completezi obligatoriu prenumele si numele."
      footer={
        <>
          Ai deja cont?{' '}
          <Link
            href="/login"
            className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
          >
            Login
          </Link>
        </>
      }
    >
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        {error ? (
          <div className="sm:col-span-2">
            <Alert tone="error">{error}</Alert>
          </div>
        ) : null}
        <Input
          label="Nume scoala"
          value={form.schoolName}
          onChange={(e) => onSchoolNameChange(e.target.value)}
          required
        />
        <Input
          label="Slug (URL login)"
          value={form.slug}
          onChange={(e) => onSlugChange(e.target.value)}
          hint={
            form.slug
              ? `/login/${form.slug}`
              : 'Se completeaza automat din numele scolii'
          }
          required
        />
        <Input
          label="Adresa"
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
        />
        <Input
          label="Telefon"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
        />
        <div className="sm:col-span-2">
          <Input
            label="Email director"
            type="email"
            value={form.directorEmail}
            onChange={(e) => update('directorEmail', e.target.value)}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <PasswordField
            label="Parola"
            value={form.password}
            onChange={(v) => update('password', v)}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <PasswordField
            label="Confirma parola"
            name="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            showStrength={false}
            required
            error={
              confirmPassword && form.password !== confirmPassword
                ? 'Parolele nu coincid'
                : undefined
            }
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" loading={loading} className="w-full">
            Creeaza scoala
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
