'use client';

import { useDirector, type ConductReq } from '@/components/dashboard/DirectorProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import type { DataColumn } from '@/components/ui/DataTable';
import { Panel } from '@/components/ui/Panel';
import { PagedTable } from '@/components/ui/PagedTable';
import { usePaginatedList } from '@/hooks/usePaginatedList';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Data' },
  { value: 'proposedGrade', label: 'Nota propusa' },
];

export default function DirectorConductPage() {
  const { dataVersion, openConductDecision } = useDirector();

  const list = usePaginatedList<ConductReq>({
    path: '/conduct/pending',
    initialSortBy: 'createdAt',
    initialSortOrder: 'ASC',
    refreshKey: dataVersion,
  });

  const columns: DataColumn<ConductReq>[] = [
    {
      key: 'student',
      header: 'Elev',
      primary: true,
      cell: (r) => `${r.studentName} (${r.className})`,
    },
    {
      key: 'current',
      header: 'Purtare actuala',
      cell: (r) => Number(r.currentConduct),
    },
    { key: 'proposed', header: 'Nota propusa', cell: (r) => Number(r.proposedGrade) },
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
        title="Cereri purtare"
        subtitle="Cereri de scadere a notei la purtare, trimise de profesori"
      />

      <Panel>
        <PagedTable
          list={list}
          sortOptions={SORT_OPTIONS}
          searchPlaceholder="Cauta cerere..."
          columns={columns}
          rowKey={(r) => r.id}
          emptyText="Nicio cerere in asteptare."
          actions={(r) => (
            <Button
              variant="secondary"
              className="!px-3 !py-1.5"
              onClick={() => openConductDecision(r)}
            >
              Decide
            </Button>
          )}
        />
      </Panel>
    </div>
  );
}
