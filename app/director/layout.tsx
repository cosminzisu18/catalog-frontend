import { Suspense, type ReactNode } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { DirectorProvider } from '@/components/dashboard/DirectorProvider';
import { DirectorShell } from '@/components/dashboard/DirectorShell';

export default function DirectorLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <RequireAuth roles={['DIRECTOR']}>
        <DirectorProvider>
          <DirectorShell>{children}</DirectorShell>
        </DirectorProvider>
      </RequireAuth>
    </Suspense>
  );
}
