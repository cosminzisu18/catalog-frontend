'use client';

import { useMemo } from 'react';
import { useStudent } from '@/components/dashboard/StudentProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { DataTable, type DataColumn } from '@/components/ui/DataTable';
import { Panel } from '@/components/ui/Panel';
import { formatGrade } from '@/lib/format';
import { formatAverage, type SubjectAverage } from '@/lib/stats';

export default function StudentSubjectsPage() {
  const { subjects, stats } = useStudent();

  // every subject from the class timetable, even the ones without grades
  const rows = useMemo<SubjectAverage[]>(() => {
    const withGrades = new Map(
      (stats?.subjects ?? []).map((s) => [s.subjectId, s]),
    );
    return subjects
      .map(
        (s) =>
          withGrades.get(s.id) ?? {
            subjectId: s.id,
            subjectName: s.name,
            gradeCount: 0,
            average: null,
            thesis: null,
            final: null,
          },
      )
      .sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  }, [subjects, stats]);

  const columns: DataColumn<SubjectAverage>[] = [
    {
      key: 'name',
      header: 'Materie',
      primary: true,
      cell: (s) => s.subjectName,
    },
    { key: 'count', header: 'Note', cell: (s) => s.gradeCount },
    {
      key: 'average',
      header: 'Media notelor',
      cell: (s) => formatAverage(s.average),
    },
    {
      key: 'thesis',
      header: 'Teza',
      cell: (s) => (s.thesis === null ? '—' : formatGrade(s.thesis)),
    },
    {
      key: 'final',
      header: 'Media',
      cell: (s) => (s.final === null ? '—' : s.final),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Elev"
        title="Materiile mele"
        subtitle={`Media generala: ${formatAverage(stats?.generalAverage)}`}
      />
      <Alert>
        Fara teza, media este media notelor rotunjita la intreg (la 50 de
        sutimi in favoarea elevului). Cu teza: (3 x media notelor + teza) / 4,
        rotunjit la fel. Media generala include si nota la purtare.
      </Alert>
      <Panel>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(s) => s.subjectId}
          loading={stats === null}
          emptyText="Clasa ta nu are inca materii."
        />
      </Panel>
    </div>
  );
}
