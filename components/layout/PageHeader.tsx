type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, subtitle, actions }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-2xl text-[var(--color-ink)] sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
