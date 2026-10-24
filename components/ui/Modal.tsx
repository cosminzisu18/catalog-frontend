'use client';

import { useEffect, useEffectEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose?: () => void;
  children: ReactNode;
  wide?: boolean;
  // when false there is no X, no backdrop click and no Escape
  dismissible?: boolean;
};

export function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
  wide,
  dismissible = true,
}: Props) {
  // always read the latest props without re-adding the listener every render
  const onEscape = useEffectEvent(() => {
    if (dismissible && onClose) onClose();
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-4">
      <div
        role="presentation"
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(15, 40, 45, 0.45)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        onClick={dismissible && onClose ? onClose : undefined}
      />
      <div
        className={`relative z-[1] max-h-[min(92vh,100%)] w-full overflow-y-auto rounded-2xl border border-[var(--color-line)] p-4 shadow-[0_30px_80px_rgba(15,40,45,0.28)] sm:rounded-3xl sm:p-6 ${
          wide ? 'max-w-2xl' : 'max-w-lg'
        }`}
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.97)' }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl text-[var(--color-ink)] sm:text-2xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>
            ) : null}
          </div>
          {dismissible && onClose ? (
            <button
              type="button"
              onClick={onClose}
              title="Inchide"
              aria-label="Inchide"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-transparent text-[var(--color-muted)] transition hover:bg-[var(--color-mist)] hover:text-[var(--color-ink)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
