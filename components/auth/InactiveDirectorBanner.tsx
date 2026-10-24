'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { Alert } from '@/components/ui/Alert';

export function InactiveDirectorBanner() {
  const { user } = useAuth();
  if (!user || user.role !== 'DIRECTOR' || user.isActiveDirector) return null;

  return (
    <div className="mb-5">
      <Alert tone="warning">
        Contul tau de director este inactiv. Poti consulta datele, dar nu poti
        face modificari. Doar directorul activ poate administra scoala.
      </Alert>
    </div>
  );
}
