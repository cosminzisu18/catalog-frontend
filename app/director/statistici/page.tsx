'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useDirector } from '@/components/dashboard/DirectorProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { DataTable, type DataColumn } from '@/components/ui/DataTable';
import { Panel } from '@/components/ui/Panel';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { useLoad } from '@/hooks/useLoad';
import { api } from '@/lib/api';
import {
  formatAverage,
  type ClassDetail,
  type ClassesOverview,
  type ClassSummary,
  type RankedStudent,
} from '@/lib/stats';

function studentName(s: RankedStudent) {
  return `${s.firstName} ${s.lastName}`;
}

function StudentLink({ student }: { student: RankedStudent }) {
  return (
    <Link
      href={`/director/elevi/${student.studentId}`}
      className="font-medium text-[var(--color-primary)] hover:underline"
    >
      {studentName(student)}
    </Link>
  );
}

const CLASS_COLUMNS: DataColumn<ClassSummary>[] = [
  { key: 'name', header: 'Clasa', primary: true, cell: (c) => c.className },
  { key: 'students', header: 'Elevi', cell: (c) => c.studentCount },
  { key: 'average', header: 'Media clasei', cell: (c) => formatAverage(c.average) },
  {
    key: 'best',
    header: 'Cel mai bun elev',
    cell: (c) =>
      c.best ? (
        <span>
          <StudentLink student={c.best} /> ({formatAverage(c.best.generalAverage)})
        </span>
      ) : (
        '—'
      ),
  },
];

const TOP_COLUMNS: DataColumn<RankedStudent & { place: number }>[] = [
  { key: 'place', header: 'Loc', cell: (s) => s.place },
  { key: 'name', header: 'Elev', primary: true, cell: (s) => <StudentLink student={s} /> },
  { key: 'class', header: 'Clasa', cell: (s) => s.className },
  { key: 'average', header: 'Media generala', cell: (s) => formatAverage(s.generalAverage) },
];

const CLASS_STUDENT_COLUMNS: DataColumn<RankedStudent & { place: number | null }>[] = [
  { key: 'place', header: 'Loc', cell: (s) => s.place ?? '—' },
  { key: 'name', header: 'Elev', primary: true, cell: (s) => <StudentLink student={s} /> },
  { key: 'conduct', header: 'Purtare', cell: (s) => s.conductGrade },
  { key: 'average', header: 'Media generala', cell: (s) => formatAverage(s.generalAverage) },
];

const SUBJECT_COLUMNS: DataColumn<ClassDetail['subjects'][number]>[] = [
  { key: 'name', header: 'Materie', primary: true, cell: (s) => s.subjectName },
  { key: 'students', header: 'Elevi cu medie', cell: (s) => s.studentCount },
  { key: 'average', header: 'Media pe clasa', cell: (s) => formatAverage(s.average) },
];

export default function DirectorStatsPage() {
  const { dataVersion } = useDirector();
  const [pickedClassId, setPickedClassId] = useState('');

  const overview = useLoad(
    () => api<ClassesOverview>('/stats/classes'),
    dataVersion,
  ).data;

  // first class by default, until the director picks another one
  const classId = pickedClassId || String(overview?.classes[0]?.classId ?? '');

  const detail = useLoad(
    () =>
      classId
        ? api<ClassDetail>(`/stats/classes/${classId}`)
        : Promise.resolve(null),
    `${classId}#${dataVersion}`,
  ).data;

  const currentDetail = detail && String(detail.classId) === classId ? detail : null;

  const classes = overview?.classes ?? [];
  const withAverage = classes.filter((c) => c.average !== null);
  const bestClass = [...withAverage].sort((a, b) => b.average! - a.average!)[0];
  const best = overview?.topStudents[0];

  let place = 0;
  const rankedStudents = (currentDetail?.students ?? []).map((s) => ({
    ...s,
    place: s.generalAverage === null ? null : ++place,
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Director"
        title="Statistici"
        subtitle="Medii pe clase si cei mai buni elevi, pentru anul scolar curent"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Clase cu medii" value={`${withAverage.length} / ${classes.length}`} />
        <StatCard
          label="Cea mai buna clasa"
          value={bestClass ? bestClass.className : '—'}
          hint={bestClass ? `media ${formatAverage(bestClass.average)}` : undefined}
        />
        <StatCard
          label="Cel mai bun elev"
          value={best ? formatAverage(best.generalAverage) : '—'}
          hint={best ? `${studentName(best)}, ${best.className}` : undefined}
        />
      </div>

      <Alert>
        Media clasei este media mediilor generale ale elevilor care au medie.
        Media generala a unui elev include mediile pe materii si purtarea.
      </Alert>

      <Panel title="Clase">
        <DataTable
          columns={CLASS_COLUMNS}
          rows={classes}
          rowKey={(c) => c.classId}
          loading={overview === null}
          emptyText="Nu exista clase."
        />
      </Panel>

      <Panel title="Cei mai buni elevi din scoala">
        <DataTable
          columns={TOP_COLUMNS}
          rows={(overview?.topStudents ?? []).map((s, i) => ({ ...s, place: i + 1 }))}
          rowKey={(s) => s.studentId}
          loading={overview === null}
          emptyText="Inca nu exista elevi cu medie."
        />
      </Panel>

      {classes.length > 0 ? (
        <Panel
          title={`Clasa ${currentDetail?.className ?? ''}`}
          subtitle={`Media clasei: ${formatAverage(currentDetail?.average)}`}
          actions={
            <div className="w-40">
              <Select
                value={classId}
                onChange={(v) => setPickedClassId(v)}
                options={classes.map((c) => ({ value: c.classId, label: c.className }))}
                compact
              />
            </div>
          }
        >
          <div className="space-y-5">
            <DataTable
              columns={CLASS_STUDENT_COLUMNS}
              rows={rankedStudents}
              rowKey={(s) => s.studentId}
              loading={currentDetail === null}
              emptyText="Clasa nu are elevi."
            />
            <DataTable
              columns={SUBJECT_COLUMNS}
              rows={currentDetail?.subjects ?? []}
              rowKey={(s) => s.subjectId}
              loading={currentDetail === null}
              emptyText="Inca nu exista medii pe materii."
            />
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
