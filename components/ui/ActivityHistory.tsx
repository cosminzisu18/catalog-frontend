'use client';

export type ActivityReport = {
  id: number;
  type: string;
  description: string;
  teacherId?: number | null;
  createdAt?: string;
  metadata?: Record<string, unknown> | null;
};

const TYPE_LABEL: Record<string, string> = {
  GRADE_CREATE: 'Nota pusa',
  GRADE_UPDATE: 'Nota editata',
  GRADE_EDIT_REQUEST: 'Cerere editare nota',
  GRADE_EDIT_DECISION: 'Decizie editare nota',
  CONDUCT_REQUEST: 'Cerere scadere purtare',
  CONDUCT_DECISION: 'Decizie purtare',
  HOURS_LOG: 'Ore inregistrate',
  ABSENCE_CREATE: 'Absenta',
  ABSENCE_MOTIVATE: 'Absenta motivata',
};

function formatWhen(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function actorLine(r: ActivityReport) {
  const meta = r.metadata || {};
  const name = typeof meta.actorName === 'string' ? meta.actorName : null;
  const role = typeof meta.actorRole === 'string' ? meta.actorRole : null;
  if (name && role === 'DIRECTOR') return `Director: ${name}`;
  if (name && role === 'TEACHER') return `Profesor: ${name}`;
  if (name) return name;
  if (role === 'DIRECTOR') return 'Director';
  if (r.teacherId) return `Profesor #${r.teacherId}`;
  return null;
}

// never show the raw type name (GRADE_CREATE etc.) to the user
function typeLabel(type: string) {
  return TYPE_LABEL[type] || 'Activitate';
}

export function ActivityHistory({
  reports,
  emptyText = 'Nicio activitate inca.',
  limit = 50,
}: {
  reports: ActivityReport[];
  emptyText?: string;
  limit?: number;
}) {
  const items = reports.slice(0, limit);

  if (items.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">{emptyText}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((r) => {
        const actor = actorLine(r);
        return (
          <li
            key={r.id}
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-mist)]/50 px-3.5 py-3 text-sm"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-semibold text-[var(--color-ink)]">
                {typeLabel(r.type)}
              </span>
              {r.createdAt ? (
                <time className="text-xs text-[var(--color-muted)]">
                  {formatWhen(r.createdAt)}
                </time>
              ) : null}
            </div>
            <p className="mt-1 text-[var(--color-ink)]">{r.description}</p>
            {actor ? (
              <p className="mt-1 text-xs font-medium text-[var(--color-muted)]">
                {actor}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
