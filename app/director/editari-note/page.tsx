'use client';

import {
  useDirector,
  type GradeEditReq,
} from '@/components/dashboard/DirectorProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import type { DataColumn } from '@/components/ui/DataTable';
import { Panel } from '@/components/ui/Panel';
import { PagedTable } from '@/components/ui/PagedTable';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { formatGrade } from '@/lib/format';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Data' },
  { value: 'proposedValue', label: 'Nota propusa' },
];

export default function DirectorGradeEditsPage() {
  const { dataVersion, openGradeEditDecision } = useDirector();

  const list = usePaginatedList<GradeEditReq>({
    path: '/grades/edit-requests/pending',
    initialSortBy: 'createdAt',
    initialSortOrder: 'ASC',
    refreshKey: dataVersion,
  });

  const columns: DataColumn<GradeEditReq>[] = [
    {
      key: 'student',
      header: 'Elev',
      primary: true,
      cell: (r) => `${r.studentName} (${r.className})`,
    },
    {
      key: 'subject',
      header: 'Materie',
      cell: (r) => r.subjectName,
    },
    {
      key: 'change',
      header: 'Modificare',
      cell: (r) => `${formatGrade(r.currentValue)} → ${formatGrade(r.proposedValue)}`,
    },
    {
      key: 'teacher',
      header: 'Profesor',
      cell: (r) => r.teacherName,
    },
    { key: 'reason', header: 'Motiv', hideOnMobile: true, cell: (r) => r.teacherReason },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Director"
        title="Editari note"
        subtitle="Doar tu poti aproba modificarea unei note deja salvate"
      />

      <Panel>
        <PagedTable
          list={list}
          sortOptions={SORT_OPTIONS}
          searchPlaceholder="Cauta cerere..."
          columns={columns}
          rowKey={(r) => r.id}
          emptyText="Nicio cerere de editare in asteptare."
          actions={(r) => (
            <Button
              variant="secondary"
              className="!px-3 !py-1.5"
              onClick={() => openGradeEditDecision(r)}
            >
              Decide
            </Button>
          )}
        />
      </Panel>
    </div>
  );
}
