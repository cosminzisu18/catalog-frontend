'use client';

import { useState } from 'react';
import {
  useDirector,
  type Subject,
} from '@/components/dashboard/DirectorProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { ActionIcon, IconTrash } from '@/components/ui/ActionIcon';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { DataColumn } from '@/components/ui/DataTable';
import { Panel } from '@/components/ui/Panel';
import { PagedTable } from '@/components/ui/PagedTable';
import { usePaginatedList } from '@/hooks/usePaginatedList';

const SORT_OPTIONS = [{ value: 'name', label: 'Denumire' }];

export default function DirectorSubjectsPage() {
  const { dataVersion, openModal, removeSubject } = useDirector();
  const [toDelete, setToDelete] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState(false);

  const list = usePaginatedList<Subject>({
    path: '/subjects',
    initialSortBy: 'name',
    refreshKey: dataVersion,
  });

  const columns: DataColumn<Subject>[] = [
    { key: 'name', header: 'Materie', primary: true, cell: (s) => s.name },
    {
      key: 'teachers',
      header: 'Profesori',
      cell: (s) => s.teacherCount ?? 0,
    },
  ];

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    await removeSubject(toDelete.id);
    setDeleting(false);
    setToDelete(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Director"
        title="Materii"
        subtitle="Catalogul de discipline ale scolii. Profesorii se leaga de materii din pagina Profesori."
        actions={
          <Button onClick={() => openModal('subject')}>Creeaza materie</Button>
        }
      />

      <Panel>
        <PagedTable
          list={list}
          sortOptions={SORT_OPTIONS}
          searchPlaceholder="Cauta materie..."
          columns={columns}
          rowKey={(s) => s.id}
          emptyText="Nicio materie."
          actions={(s) => (
            <ActionIcon
              label="Sterge"
              variant="danger"
              onClick={() => setToDelete(s)}
            >
              <IconTrash />
            </ActionIcon>
          )}
        />
      </Panel>

      <ConfirmModal
        open={toDelete !== null}
        danger
        loading={deleting}
        title="Sterge materie"
        message={`Sigur vrei sa stergi materia ${toDelete?.name ?? ''}?`}
        confirmLabel="Sterge"
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
