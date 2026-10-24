'use client';

import Link from 'next/link';
import { useStudent } from '@/components/dashboard/StudentProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatCard } from '@/components/ui/StatCard';
import { RequestStatusBadge } from '@/components/ui/StatusBadge';
import { formatAverage } from '@/lib/stats';
import {
  formatDateDdMmYyyy,
  formatGrade,
  fullName,
  gradeText,
} from '@/lib/format';

export default function StudentHomePage() {
  const { me, recentGrades, conductHistory, stats, absences } = useStudent();

  const lowered = conductHistory.filter((c) => c.status === 'APPROVED');

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Acasa"
        title={me ? `Bun venit, ${fullName(me)}` : 'Panou elev'}
        subtitle={
          me
            ? `Clasa ${me.className} · ${formatDateDdMmYyyy()}`
            : formatDateDdMmYyyy()
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Media generala"
          value={formatAverage(stats?.generalAverage)}
        />
        <StatCard
          label="Media clasei"
          value={formatAverage(stats?.classAverage)}
        />
        <StatCard
          label="Locul in clasa"
          value={
            stats?.classRank ? `${stats.classRank} / ${stats.classSize}` : '—'
          }
        />
        <StatCard label="Purtare" value={me ? Number(me.conductGrade) : '—'} />
        <StatCard
          label="Absente nemotivate"
          value={absences?.unmotivated ?? '—'}
          hint={
            absences
              ? `${absences.total} ${absences.total === 1 ? 'absenta' : 'absente'} in total`
              : undefined
          }
        />
        <StatCard label="Note primite" value={me ? me.gradeCount : '—'} />
      </div>

      <Panel
        title="Ultimele note"
        actions={
          <Link
            href="/elev/note"
            className="text-sm font-semibold text-[var(--color-primary)]"
          >
            Toate notele
          </Link>
        }
      >
        {recentGrades.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">Nicio nota inca.</p>
        ) : (
          <ul className="space-y-2">
            {recentGrades.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-mist)]/60 px-3.5 py-2.5 text-sm"
              >
                <span className="min-w-0 truncate">
                  <span className="font-medium">
                    {g.subjectName}
                  </span>
                  <span className="text-[var(--color-muted)]"> · {g.gradedOn}</span>
                </span>
                <span className="shrink-0 font-semibold">{gradeText(g.value, g.type)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Istoric note scazute la purtare"
        subtitle={
          lowered.length > 0
            ? `${lowered.length} scadere${lowered.length === 1 ? '' : 'i'} aprobata${lowered.length === 1 ? '' : 'e'}`
            : undefined
        }
      >
        {conductHistory.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            Nicio cerere de scadere a notei la purtare.
          </p>
        ) : (
          <ul className="space-y-2">
            {conductHistory.map((c) => (
              <li
                key={c.id}
                className="rounded-xl bg-[var(--color-mist)]/60 px-3.5 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="font-semibold text-[var(--color-ink)]">
                      Nota {formatGrade(c.proposedGrade)}
                    </span>
                    <RequestStatusBadge status={c.status} />
                  </div>
                  <span className="shrink-0 text-xs text-[var(--color-muted)]">
                    {formatDateDdMmYyyy(c.updatedAt || c.createdAt)}
                  </span>
                </div>
                <p className="mt-1.5 text-[var(--color-muted)]">
                  <span className="font-medium text-[var(--color-ink)]">
                    {c.teacherName}
                  </span>
                  {': '}
                  {c.teacherReason}
                </p>
                {c.directorReason ? (
                  <p className="mt-1 text-xs text-[var(--color-ink)]">
                    Director: {c.directorReason}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
