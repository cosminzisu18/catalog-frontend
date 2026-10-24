type Tone = 'success' | 'warning' | 'danger' | 'neutral';

const TONES: Record<Tone, string> = {
  success: 'bg-[var(--color-primary)]/12 text-[var(--color-primary-dark)]',
  warning: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]',
  danger: 'bg-[var(--color-danger)]/12 text-[var(--color-danger)]',
  neutral: 'bg-[var(--color-mist)] text-[var(--color-muted)]',
};

export function StatusBadge({
  tone = 'neutral',
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

const REQUEST_STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: 'In asteptare', tone: 'warning' },
  APPROVED: { label: 'Aprobata', tone: 'success' },
  REJECTED: { label: 'Respinsa', tone: 'danger' },
};

export function RequestStatusBadge({ status }: { status: string }) {
  const meta = REQUEST_STATUS[status] ?? { label: status, tone: 'neutral' as Tone };
  return <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>;
}

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <StatusBadge tone={isActive ? 'success' : 'neutral'}>
      {isActive ? 'Activ' : 'Inactiv'}
    </StatusBadge>
  );
}

export function AbsenceBadge({ motivated }: { motivated: boolean }) {
  return (
    <StatusBadge tone={motivated ? 'success' : 'danger'}>
      {motivated ? 'Motivata' : 'Nemotivata'}
    </StatusBadge>
  );
}
