'use client';

import { useTeacher } from '@/components/dashboard/TeacherProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import type { DataColumn } from '@/components/ui/DataTable';
import { Panel } from '@/components/ui/Panel';
import { RequestStatusBadge } from '@/components/ui/StatusBadge';
import { PagedTable } from '@/components/ui/PagedTable';
import { usePaginatedList } from '@/hooks/usePaginatedList';

type ConductRequest = {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  proposedGrade: number;
  teacherReason: string;
  directorReason: string | null;
  status: string;
};

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Data' },
  { value: 'proposedGrade', label: 'Nota propusa' },
  { value: 'status', label: 'Status' },
];

export default function TeacherConductPage() {
  const { dataVersion, openModal } = useTeacher();

  const list = usePaginatedList<ConductRequest>({
    path: '/conduct/mine',
    initialSortBy: 'createdAt',
    initialSortOrder: 'DESC',
    refreshKey: dataVersion,
  });

  const columns: DataColumn<ConductRequest>[] = [
    {
      key: 'student',
      header: 'Elev',
      primary: true,
      cell: (r) => `${r.studentName} (${r.className})`,
    },
    { key: 'proposed', header: 'Nota propusa', cell: (r) => Number(r.proposedGrade) },
    { key: 'status', header: 'Status', cell: (r) => <RequestStatusBadge status={r.status} /> },
    { key: 'reason', header: 'Motiv', hideOnMobile: true, cell: (r) => r.teacherReason },
    {
      key: 'director',
      header: 'Raspuns director',
      hideOnMobile: true,
      cell: (r) => r.directorReason ?? '—',
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Profesor"
        title="Cereri purtare"
        subtitle="Scaderea notei la purtare necesita aprobarea directorului."
        actions={<Button onClick={() => openModal('conduct')}>Cerere noua</Button>}
      />

      <Panel>
        <PagedTable
          list={list}
          sortOptions={SORT_OPTIONS}
          columns={columns}
          rowKey={(r) => r.id}
          emptyText="Nicio cerere trimisa."
        />
      </Panel>
    </div>
  );
}
