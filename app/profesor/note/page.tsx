'use client';

import { useState } from 'react';
import { useTeacher, type Grade } from '@/components/dashboard/TeacherProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
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

export default function TeacherGradesPage() {
  const { subjects, dataVersion, openModal, openGradeEditRequest } = useTeacher();
  const [subjectId, setSubjectId] = useState('');

  const list = usePaginatedList<Grade>({
    path: '/grades/mine',
    initialSortBy: 'gradedOn',
    initialSortOrder: 'DESC',
    extra: { subjectId },
    refreshKey: dataVersion,
  });

  const columns: DataColumn<Grade>[] = [
    {
      key: 'student',
      header: 'Elev',
      primary: true,
      cell: (g) => `${g.studentName} (${g.className})`,
    },
    {
      key: 'subject',
      header: 'Materie',
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
        eyebrow="Profesor"
        title="Note"
        subtitle="Notele salvate nu se modifica direct, ci prin cerere la director."
        actions={<Button onClick={() => openModal('grade')}>Adauga nota</Button>}
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
          actions={(g) => (
            <Button
              variant="secondary"
              className="!px-3 !py-1.5"
              onClick={() => openGradeEditRequest(g)}
            >
              Cere editare
            </Button>
          )}
        />
      </Panel>
    </div>
  );
}
