'use client';

import { useState } from 'react';
import { useStudent, type Grade } from '@/components/dashboard/StudentProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import type { DataColumn } from '@/components/ui/DataTable';
import { Panel } from '@/components/ui/Panel';
import { Select } from '@/components/ui/Select';
import { PagedTable } from '@/components/ui/PagedTable';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { gradeText } from '@/lib/format';

const SORT_OPTIONS = [
  { value: 'gradedOn', label: 'Data' },
  { value: 'value', label: 'Nota' },
];

export default function StudentGradesPage() {
  const { me, subjects } = useStudent();
  const [subjectId, setSubjectId] = useState('');

  const list = usePaginatedList<Grade>({
    path: '/grades/my-grades',
    initialSortBy: 'gradedOn',
    initialSortOrder: 'DESC',
    extra: { subjectId },
  });

  const columns: DataColumn<Grade>[] = [
    {
      key: 'subject',
      header: 'Materie',
      primary: true,
      cell: (g) => g.subjectName,
    },
    { key: 'value', header: 'Nota', cell: (g) => gradeText(g.value, g.type) },
    { key: 'date', header: 'Data', cell: (g) => g.gradedOn },
  ];

  function changeSubject(value: string) {
    setSubjectId(value);
    list.setPage(1);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Elev"
        title="Notele mele"
        subtitle={`Media generala ${me?.average ?? '—'} · ${list.total} note`}
      />

      <Panel>
        <PagedTable
          list={list}
          sortOptions={SORT_OPTIONS}
          searchPlaceholder="Cauta nota..."
          filters={
            <Select
              label="Materie"
              value={subjectId}
              onChange={changeSubject}
              options={subjects.map((s) => ({ value: s.id, label: s.name }))}
              emptyLabel="Toate materiile"
              searchPlaceholder="Cauta materie..."
            />
          }
          columns={columns}
          rowKey={(g) => g.id}
          emptyText="Nicio nota gasita."
        />
      </Panel>
    </div>
  );
}
