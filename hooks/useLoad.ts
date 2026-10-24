'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { useToast } from '@/components/ui/Toast';

// Runs `load` again whenever `key` changes. An answer that arrives after a
// newer request started is ignored, and errors are shown as a toast. The
// previous data stays visible while the new one loads.
export function useLoad<T>(load: () => Promise<T>, key: string | number) {
  const toast = useToast();
  const [result, setResult] = useState<{
    key: string | number;
    data: T;
  } | null>(null);
  const runLoad = useEffectEvent(load);

  useEffect(() => {
    let cancelled = false;
    runLoad()
      .then((data) => {
        if (!cancelled) setResult({ key, data });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : 'Eroare la incarcare');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key, toast]);

  return { data: result?.data ?? null, loading: result?.key !== key };
}
