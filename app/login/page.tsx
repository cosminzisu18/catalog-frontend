'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthShell } from '@/components/layout/AuthShell';
import { Alert } from '@/components/ui/Alert';

// shown after a successful password reset (/login?reset=1)
function ResetNotice() {
  const reset = useSearchParams().get('reset') === '1';
  return reset ? (
    <Alert tone="success">Parola a fost actualizata. Te poti autentifica.</Alert>
  ) : null;
}

export default function DirectorLoginPage() {
  return (
    <AuthShell
      title="Autentificare"
      subtitle="Conecteaza-te la contul institutiei"
      footer={
        <>
          Nu ai cont inca?{' '}
          <Link
            href="/register"
            className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
          >
            Inregistreaza scoala
          </Link>
        </>
      }
    >
      <LoginForm
        endpoint="/auth/login"
        notice={
          <Suspense fallback={null}>
            <ResetNotice />
          </Suspense>
        }
      />
    </AuthShell>
  );
}
