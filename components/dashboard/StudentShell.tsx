'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';

const NAV = [
  { href: '/elev', label: 'Acasa' },
  { href: '/elev/orar', label: 'Orar' },
  { href: '/elev/note', label: 'Note' },
  { href: '/elev/absente', label: 'Absente' },
  { href: '/elev/materii', label: 'Materii' },
];

export function StudentShell({ children }: { children: ReactNode }) {
  return (
    <AppShell
      title="Panou elev"
      roleLabel="Elev"
      settingsHref="/elev/setari"
      nav={NAV}
    >
      {children}
    </AppShell>
  );
}
