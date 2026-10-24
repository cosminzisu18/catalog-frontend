import type { ReactNode } from 'react';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
};

export function AuthShell({
  eyebrow = 'Catalog Digital',
  title,
  subtitle,
  children,
  footer,
  wide,
}: Props) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-3 py-8 sm:px-4 sm:py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[var(--color-accent)]/10 blur-3xl" />
      </div>

      <div className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-[var(--color-muted)]">{subtitle}</p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-[var(--color-line)] bg-white/90 p-5 shadow-[0_24px_60px_rgba(20,50,58,0.08)] backdrop-blur sm:rounded-3xl sm:p-7">
          {children}
        </div>

        {footer ? <div className="mt-4 text-center text-sm text-[var(--color-muted)]">{footer}</div> : null}
      </div>
    </div>
  );
}
