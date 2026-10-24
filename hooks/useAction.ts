'use client';

import { useCallback, useState } from 'react';
import { useToast } from '@/components/ui/Toast';

// runs a request, shows a toast with the result and tracks the busy state
export function useAction() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    async (request: () => Promise<unknown>, successMessage: string) => {
      setBusy(true);
      try {
        await request();
        toast.success(successMessage);
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Eroare');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [toast],
  );

  return { busy, run };
}
