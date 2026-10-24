'use client';

import Link from 'next/link';
import { useTeacher } from '@/components/dashboard/TeacherProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { ActivityHistory } from '@/components/ui/ActivityHistory';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { StatCard } from '@/components/ui/StatCard';
import { formatDateDdMmYyyy, gradeText, fullName } from '@/lib/format';

export default function TeacherHomePage() {
  const {
    me,
    subjects,
    students,
    recentGrades,
    gradeTotal,
    recentReports,
    openModal,
  } = useTeacher();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Acasa"
        title={me ? `Bun venit, ${fullName(me)}` : 'Panou profesor'}
        subtitle={formatDateDdMmYyyy()}
        actions={
          <>
            <Button onClick={() => openModal('grade')}>Adauga nota</Button>
            <Button variant="secondary" onClick={() => openModal('absence')}>
              Pune absenta
            </Button>
            <Button variant="secondary" onClick={() => openModal('hours')}>
              Inregistreaza ore
            </Button>
            <Button variant="secondary" onClick={() => openModal('conduct')}>
              Cerere purtare
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ore predate" value={me ? Number(me.hoursTaught) : '—'} />
        <StatCard label="Materii" value={subjects.length} />
        <StatCard label="Elevi" value={students.length} />
        <StatCard label="Note puse" value={gradeTotal} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Ultimele note"
          actions={
            <Link
              href="/profesor/note"
              className="text-sm font-semibold text-[var(--color-primary)]"
            >
              Toate notele
            </Link>
          }
        >
          {recentGrades.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">Nicio nota pusa inca.</p>
          ) : (
            <ul className="space-y-2">
              {recentGrades.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-mist)]/60 px-3.5 py-2.5 text-sm"
                >
                  <span className="min-w-0 truncate">
                    <span className="font-medium">{g.studentName}</span>
                    <span className="text-[var(--color-muted)]">
                      {' '}
                      · {g.subjectName}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold">{gradeText(g.value, g.type)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Activitate recenta"
          actions={
            <Link
              href="/profesor/rapoarte"
              className="text-sm font-semibold text-[var(--color-primary)]"
            >
              Vezi tot
            </Link>
          }
        >
          <ActivityHistory reports={recentReports} limit={5} />
        </Panel>
      </div>
    </div>
  );
}
