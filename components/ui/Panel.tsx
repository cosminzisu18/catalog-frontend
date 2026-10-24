import type { ReactNode } from 'react';

type Props = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, subtitle, actions, children, className = '' }: Props) {
  return (
    <section
      className={`rounded-2xl border border-[var(--color-line)] bg-white/90 p-4 shadow-[0_10px_30px_rgba(15,40,60,0.04)] backdrop-blur sm:p-5 ${className}`}
    >
      {(title || actions) && (
        <header className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title ? (
              <h2 className="font-display text-xl text-[var(--color-ink)] sm:text-2xl">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
              {actions}
            </div>
          ) : null}
        </header>
      )}
      {children}
    </section>
  );
}
