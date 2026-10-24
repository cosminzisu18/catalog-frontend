import { Suspense, type ReactNode } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { StudentProvider } from '@/components/dashboard/StudentProvider';
import { StudentShell } from '@/components/dashboard/StudentShell';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <RequireAuth roles={['STUDENT']}>
        <StudentProvider>
          <StudentShell>{children}</StudentShell>
        </StudentProvider>
      </RequireAuth>
    </Suspense>
  );
}
