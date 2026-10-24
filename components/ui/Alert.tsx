import type { ReactNode } from 'react';

type Tone = 'info' | 'warning' | 'error' | 'success';

const tones: Record<Tone, string> = {
  info: 'border-[var(--color-primary)]/30 bg-[var(--color-primary)]/8 text-[var(--color-ink)]',
  warning:
    'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-ink)]',
  error: 'border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 text-[var(--color-danger)]',
  success: 'border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 text-[var(--color-ink)]',
};

export function Alert({
  children,
  tone = 'info',
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className={`rounded-xl border px-3.5 py-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
}
