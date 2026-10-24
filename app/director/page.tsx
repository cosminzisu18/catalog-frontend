'use client';

import Link from 'next/link';
import { useDirector } from '@/components/dashboard/DirectorProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { ActivityHistory } from '@/components/ui/ActivityHistory';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { StatCard } from '@/components/ui/StatCard';
import { formatDateDdMmYyyy, fullName } from '@/lib/format';

export default function DirectorHomePage() {
  const {
    teachers,
    students,
    subjects,
    recentReports,
    pending,
    pendingConductTotal,
    pendingGradeEditTotal,
    openModal,
    openConductDecision,
    schoolSlug,
  } = useDirector();

  const topTeachers = [...teachers]
    .sort((a, b) => Number(b.hoursTaught) - Number(a.hoursTaught))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Acasa"
        title="Panou director"
        subtitle={`${formatDateDdMmYyyy()} · Link login: /login/${schoolSlug}`}
        actions={
          <>
            <Button onClick={() => openModal('teacher')}>Adauga profesor</Button>
            <Button variant="secondary" onClick={() => openModal('student')}>
              Adauga elev
            </Button>
            <Button variant="secondary" onClick={() => openModal('subject')}>
              Creeaza materie
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Profesori" value={teachers.length} />
        <StatCard label="Elevi" value={students.length} />
        <StatCard label="Materii" value={subjects.length} />
        <StatCard
          label="Cereri in asteptare"
          value={pendingConductTotal + pendingGradeEditTotal}
          hint={`${pendingConductTotal} purtare · ${pendingGradeEditTotal} editari note`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Ore predate"
          subtitle="Top profesori dupa ore inregistrate"
          actions={
            <Link
              href="/director/profesori"
              className="text-sm font-semibold text-[var(--color-primary)]"
            >
              Vezi toti
            </Link>
          }
        >
          {topTeachers.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">Niciun profesor inca.</p>
          ) : (
            <ul className="space-y-2">
              {topTeachers.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-xl bg-[var(--color-mist)]/60 px-3.5 py-2.5 text-sm"
                >
                  <Link
                    href={`/director/profesori/${t.id}`}
                    className="font-medium text-[var(--color-ink)] hover:underline"
                  >
                    {fullName(t)}
                  </Link>
                  <span className="font-semibold">{Number(t.hoursTaught)} ore</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Cereri de purtare"
          subtitle="Asteapta decizia ta"
          actions={
            <Link
              href="/director/purtare"
              className="text-sm font-semibold text-[var(--color-primary)]"
            >
              Toate cererile
            </Link>
          }
        >
          {pending.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">Nicio cerere in asteptare.</p>
          ) : (
            <ul className="space-y-2">
              {pending.slice(0, 5).map((req) => (
                <li
                  key={req.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-mist)]/60 px-3.5 py-2.5 text-sm"
                >
                  <span className="min-w-0 truncate font-medium">
                    {req.studentName} →{' '}
                    {Number(req.proposedGrade)}
                  </span>
                  <Button
                    variant="secondary"
                    className="shrink-0 !px-3 !py-1.5"
                    onClick={() => openConductDecision(req)}
                  >
                    Decide
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Activitate recenta" subtitle="Ultimele evenimente din scoala">
        <ActivityHistory reports={recentReports} limit={8} />
      </Panel>
    </div>
  );
}