'use client';

import type { ReactNode } from 'react';
import { InactiveDirectorBanner } from '@/components/auth/InactiveDirectorBanner';
import { useDirector } from '@/components/dashboard/DirectorProvider';
import { AppShell } from '@/components/layout/AppShell';

export function DirectorShell({ children }: { children: ReactNode }) {
  const { pendingConductTotal, pendingGradeEditTotal } = useDirector();

  return (
    <AppShell
      title="Panou director"
      roleLabel="Director"
      settingsHref="/director/setari"
      nav={[
        { href: '/director', label: 'Acasa' },
        { href: '/director/materii', label: 'Materii' },
        { href: '/director/clase', label: 'Clase' },
        { href: '/director/profesori', label: 'Profesori' },
        { href: '/director/elevi', label: 'Elevi' },
        { href: '/director/orar', label: 'Orar' },
        { href: '/director/statistici', label: 'Statistici' },
        { href: '/director/absente', label: 'Absente' },
        { href: '/director/purtare', label: 'Purtare', badge: pendingConductTotal },
        {
          href: '/director/editari-note',
          label: 'Editari note',
          badge: pendingGradeEditTotal,
        },
        { href: '/director/rapoarte', label: 'Rapoarte' },
      ]}
    >
      <InactiveDirectorBanner />
      {children}
    </AppShell>
  );
}
