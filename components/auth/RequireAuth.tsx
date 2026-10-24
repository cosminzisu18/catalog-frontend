'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ForceDirectorProfileModal } from '@/components/auth/ForceDirectorProfileModal';
import { ForcePasswordModal } from '@/components/auth/ForcePasswordModal';
import { type Role } from '@/lib/auth';

export function RequireAuth({
  roles,
  children,
}: {
  roles?: Role[];
  children: ReactNode;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    if (roles && !roles.includes(user.role)) {
      router.replace('/login');
    }
  }, [ready, user, roles, router, pathname]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-screen place-items-center font-sans text-sm text-[var(--color-muted)]">
        Se incarca...
      </div>
    );
  }

  if (roles && !roles.includes(user.role)) return null;

  // the API refuses everything until the temporary password is changed,
  // so we don't mount the dashboard (or the providers that load data)
  if (user.mustChangePassword) {
    return (
      <div className="min-h-screen bg-[var(--color-mist)]">
        <ForcePasswordModal />
      </div>
    );
  }

  // right after registering the school, the director has no name yet
  if (user.role === 'DIRECTOR' && user.mustCompleteProfile) {
    return (
      <div className="min-h-screen bg-[var(--color-mist)]">
        <ForceDirectorProfileModal />
      </div>
    );
  }

  return <>{children}</>;
}
