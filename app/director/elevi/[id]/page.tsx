'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  useDirector,
  type Student,
  type Subject,
} from '@/components/dashboard/DirectorProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { ActionIcon, BackLink, IconEdit } from '@/components/ui/ActionIcon';
import { DataTable, type DataColumn } from '@/components/ui/DataTable';
import { PaginationBar } from '@/components/ui/ListControls';
import { InfoList } from '@/components/ui/InfoList';
import { Panel } from '@/components/ui/Panel';
import { ActiveBadge } from '@/components/ui/StatusBadge';
import { LoadingText } from '@/components/ui/LoadingText';
import { AbsenceList } from '@/components/absences/AbsenceList';
import { useLoad } from '@/hooks/useLoad';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { api } from '@/lib/api';
import { formatGrade, fullName, gradeText } from '@/lib/format';
import { formatAverage, type StudentStats, type SubjectAverage } from '@/lib/stats';
import type { TimetableSlot } from '@/lib/timetable';

type StudentGrade = {
  id: number;
  subjectId: number;
  subjectName: string;
  value: number;
  type: 'NORMAL' | 'THESIS';
  gradedOn: string;
};

type StudentDetails = Student & { average: string | null; gradeCount: number };

const AVERAGE_COLUMNS: DataColumn<SubjectAverage>[] = [
  { key: 'subject', header: 'Materie', primary: true, cell: (s) => s.subjectName },
  { key: 'count', header: 'Note', cell: (s) => s.gradeCount },
  { key: 'average', header: 'Media notelor', cell: (s) => formatAverage(s.average) },
  { key: 'thesis', header: 'Teza', cell: (s) => (s.thesis === null ? '—' : formatGrade(s.thesis)) },
  { key: 'final', header: 'Media', cell: (s) => s.final ?? '—' },
];

const GRADE_COLUMNS: DataColumn<StudentGrade>[] = [
  { key: 'subject', header: 'Materie', primary: true, cell: (g) => g.subjectName },
  { key: 'value', header: 'Nota', cell: (g) => gradeText(g.value, g.type) },
  { key: 'date', header: 'Data', cell: (g) => g.gradedOn },
];

export default function DirectorStudentDetailPage() {
  return (
    <Suspense fallback={<LoadingText />}>
      <StudentDetail />
    </Suspense>
  );
}

function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const studentId = Number(id);
  const { subjectMap, dataVersion, openEditStudent, openAbsenceMotivation } =
    useDirector();

  const grades = usePaginatedList<StudentGrade>({
    path: `/grades/student/${studentId}`,
    initialSortBy: 'gradedOn',
    initialSortOrder: 'DESC',
    refreshKey: dataVersion,
  });

  const details = useLoad(async () => {
    const student = await api<StudentDetails>(`/students/${studentId}`);
    const [enrolled, slots, stats] = await Promise.all([
      api<Subject[]>(`/subjects/for-student/${studentId}`),
      api<TimetableSlot[]>(`/timetable?classId=${student.classId}`),
      api<StudentStats>(`/stats/students/${studentId}`),
    ]);
    return { student, enrolled, slots, stats };
  }, `${studentId}#${dataVersion}`).data;

  if (!details) return <LoadingText />;
  const { student, enrolled, slots, stats } = details;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <BackLink href="/director/elevi" />
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow={`Elev · clasa ${student.className}`}
            title={fullName(student)}
            actions={
              <ActionIcon
                label="Modifica"
                onClick={() => openEditStudent(student)}
              >
                <IconEdit />
              </ActionIcon>
            }
          />
        </div>
      </div>

      <Panel title="Date elev">
        <InfoList
          columns={4}
          items={[
            { label: 'Email', value: student.email },
            { label: 'Purtare', value: Number(student.conductGrade) },
            {
              label: 'Varsta',
              value:
                student.age !== null ? `${student.age} ani (${student.birthDate})` : '—',
            },
            { label: 'Media generala', value: formatAverage(stats.generalAverage) },
            { label: 'Media clasei', value: formatAverage(stats.classAverage) },
            {
              label: 'Locul in clasa',
              value: stats.classRank ? `${stats.classRank} / ${stats.classSize}` : '—',
            },
            { label: 'Status', value: <ActiveBadge isActive={student.isActive} /> },
          ]}
        />
      </Panel>

      <Panel title="Materii (clasa)">
        {enrolled.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            Clasa nu are inca materii in orar / asignate prin profesori.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {enrolled.map((s) => (
              <li
                key={s.id}
                className="rounded-full bg-[var(--color-mist)] px-3 py-1 text-sm font-medium"
              >
                {s.name}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Medii pe materii (anul scolar curent)">
        <DataTable
          columns={AVERAGE_COLUMNS}
          rows={stats.subjects}
          rowKey={(s) => s.subjectId}
          emptyText="Inca nu are note anul acesta."
        />
      </Panel>

      <Panel title="Absente">
        <AbsenceList
          path="/absences"
          extra={{ studentId }}
          refreshKey={dataVersion}
          showTeacher
          onMotivate={openAbsenceMotivation}
          emptyText="Elevul nu are absente."
        />
      </Panel>

      <Panel title="Note">
        <DataTable
          columns={GRADE_COLUMNS}
          rows={grades.items}
          rowKey={(g) => g.id}
          loading={grades.loading}
          emptyText="Nicio nota inca."
        />
        <PaginationBar
          page={grades.page}
          totalPages={grades.totalPages}
          total={grades.total}
          loading={grades.loading}
          onPageChange={grades.setPage}
        />
      </Panel>

      <Panel title={`Orar clasa ${student.className}`}>
        <TimetableGrid slots={slots} subjectMap={subjectMap} />
      </Panel>
    </div>
  );
}
