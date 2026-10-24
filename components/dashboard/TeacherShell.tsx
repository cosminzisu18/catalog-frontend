'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';

const NAV = [
  { href: '/profesor', label: 'Acasa' },
  { href: '/profesor/orar', label: 'Orar' },
  { href: '/profesor/note', label: 'Note' },
  { href: '/profesor/absente', label: 'Absente' },
  { href: '/profesor/purtare', label: 'Purtare' },
  { href: '/profesor/rapoarte', label: 'Rapoarte' },
];

export function TeacherShell({ children }: { children: ReactNode }) {
  return (
    <AppShell
      title="Panou profesor"
      roleLabel="Profesor"
      settingsHref="/profesor/setari"
      nav={NAV}
    >
      {children}
    </AppShell>
  );
}
