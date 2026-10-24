'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthShell } from '@/components/layout/AuthShell';
import { api } from '@/lib/api';

export default function InstitutionLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center font-sans text-sm text-[var(--color-muted)]">
          Se incarca...
        </div>
      }
    >
      <InstitutionLogin />
    </Suspense>
  );
}

function InstitutionLogin() {
  const { slug } = useParams<{ slug: string }>();
  const [schoolName, setSchoolName] = useState('');

  useEffect(() => {
    api<{ name: string }>(`/schools/by-slug/${slug}`, { auth: false })
      .then((s) => setSchoolName(s.name))
      .catch(() => setSchoolName(''));
  }, [slug]);

  return (
    <AuthShell
      title="Login pe institutie"
      subtitle={schoolName ? `${schoolName} · /login/${slug}` : `URL: /login/${slug}`}
      footer={
        <>
          Director?{' '}
          <Link
            href="/login"
            className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
          >
            Login standard
          </Link>
        </>
      }
    >
      <LoginForm endpoint={`/auth/login/${slug}`} />
    </AuthShell>
  );
}
