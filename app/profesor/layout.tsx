import { Suspense, type ReactNode } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { TeacherProvider } from '@/components/dashboard/TeacherProvider';
import { TeacherShell } from '@/components/dashboard/TeacherShell';

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <RequireAuth roles={['TEACHER']}>
        <TeacherProvider>
          <TeacherShell>{children}</TeacherShell>
        </TeacherProvider>
      </RequireAuth>
    </Suspense>
  );
}
