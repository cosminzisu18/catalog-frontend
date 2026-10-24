'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type ToastTone = 'success' | 'error' | 'info';

const noopSubscribe = () => () => {};

// default durations, long enough to read the message
const DEFAULT_DURATION_MS: Record<ToastTone, number> = {
  success: 5000,
  info: 5000,
  error: 7000,
};

const MIN_DURATION_MS = 3000;

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
  durationMs: number;
  createdAt: number;
};

type ToastOptions = {
  // duration in ms (at least 3000); only needed to override the default
  durationMs?: number;
};

type ToastContextValue = {
  push: (message: string, tone?: ToastTone, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function resolveDuration(tone: ToastTone, options?: ToastOptions): number {
  const raw = options?.durationMs ?? DEFAULT_DURATION_MS[tone];
  return Math.max(MIN_DURATION_MS, raw);
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: (id: number) => void;
}) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const started = toast.createdAt;
    const total = toast.durationMs;
    let frame = 0;

    const tick = () => {
      const elapsed = Date.now() - started;
      const left = Math.max(0, 100 - (elapsed / total) * 100);
      setProgress(left);
      if (elapsed >= total) {
        onClose(toast.id);
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [toast.createdAt, toast.durationMs, toast.id, onClose]);

  const secondsLeft = Math.max(1, Math.ceil((progress / 100) * (toast.durationMs / 1000)));

  const toneClass: Record<ToastTone, string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    info: 'border-sky-200 bg-sky-50 text-sky-900',
  };

  const barClass: Record<ToastTone, string> = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-sky-500',
  };

  return (
    <div
      className={`pointer-events-auto overflow-hidden rounded-2xl border shadow-lg ${toneClass[toast.tone]}`}
      role="status"
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <p className="min-w-0 flex-1 text-sm font-medium leading-snug">
          {toast.message}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <span className="tabular-nums text-xs font-semibold opacity-70">
            {secondsLeft}s
          </span>
          <button
            type="button"
            onClick={() => onClose(toast.id)}
            className="rounded-md px-1.5 text-base leading-none opacity-60 hover:opacity-100"
            aria-label="Inchide"
          >
            ×
          </button>
        </div>
      </div>
      <div className="h-1 w-full bg-black/5">
        <div
          className={`h-full transition-[width] duration-100 ease-linear ${barClass[toast.tone]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, tone: ToastTone = 'info', options?: ToastOptions) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setItems((prev) => [
        ...prev,
        {
          id,
          message,
          tone,
          durationMs: resolveDuration(tone, options),
          createdAt: Date.now(),
        },
      ]);
    },
    [],
  );

  const value = useMemo(
    () => ({
      push,
      success: (message: string, options?: ToastOptions) =>
        push(message, 'success', options),
      error: (message: string, options?: ToastOptions) =>
        push(message, 'error', options),
    }),
    [push],
  );

  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const layer =
    mounted && items.length > 0
      ? createPortal(
          <div className="pointer-events-none fixed inset-x-0 top-0 z-[9999] flex justify-end p-4">
            <div className="flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2">
              {items.map((toast) => (
                <ToastCard key={toast.id} toast={toast} onClose={remove} />
              ))}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {layer}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
