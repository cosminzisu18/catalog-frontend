'use client';

import { useState } from 'react';
import {
  useDirector,
  type Teacher,
} from '@/components/dashboard/DirectorProvider';
import { PersonRowActions } from '@/components/dashboard/PersonRowActions';
import { PageHeader } from '@/components/layout/PageHeader';
import { ActionIcon, IconBook } from '@/components/ui/ActionIcon';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { DataColumn } from '@/components/ui/DataTable';
import { Panel } from '@/components/ui/Panel';
import { ActiveBadge } from '@/components/ui/StatusBadge';
import { PagedTable } from '@/components/ui/PagedTable';
import { usePaginatedList } from '@/hooks/usePaginatedList';

const SORT_OPTIONS = [
  { value: 'lastName', label: 'Nume' },
  { value: 'firstName', label: 'Prenume' },
  { value: 'hoursTaught', label: 'Ore predate' },
];

const COLUMNS: DataColumn<Teacher>[] = [
  {
    key: 'name',
    header: 'Nume',
    primary: true,
    cell: (t) => `${t.firstName} ${t.lastName}`,
  },
  { key: 'email', header: 'Email', cell: (t) => t.email },
  { key: 'hours', header: 'Ore predate', cell: (t) => Number(t.hoursTaught) },
  { key: 'status', header: 'Status', cell: (t) => <ActiveBadge isActive={t.isActive} /> },
];

export default function DirectorTeachersPage() {
  const {
    dataVersion,
    openModal,
    openEditTeacher,
    openTeacherSubjects,
    setTeacherActive,
    removeTeacher,
  } = useDirector();
  const [toDelete, setToDelete] = useState<Teacher | null>(null);
  const [deleting, setDeleting] = useState(false);

  const list = usePaginatedList<Teacher>({
    path: '/teachers',
    initialSortBy: 'lastName',
    refreshKey: dataVersion,
  });

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    await removeTeacher(toDelete.id);
    setDeleting(false);
    setToDelete(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Director"
        title="Profesori"
        actions={<Button onClick={() => openModal('teacher')}>Adauga profesor</Button>}
      />

      <Panel>
        <PagedTable
          list={list}
          sortOptions={SORT_OPTIONS}
          searchPlaceholder="Cauta profesor..."
          columns={COLUMNS}
          rowKey={(t) => t.id}
          emptyText="Niciun profesor gasit."
          actions={(t) => (
            <div className="flex flex-wrap justify-end gap-1.5">
              <ActionIcon
                label="Materii"
                onClick={() => void openTeacherSubjects(t.id)}
              >
                <IconBook />
              </ActionIcon>
              <PersonRowActions
                detailHref={`/director/profesori/${t.id}`}
                isActive={t.isActive}
                onEdit={() => openEditTeacher(t)}
                onToggleActive={() => setTeacherActive(t.id, !t.isActive)}
                onDelete={() => setToDelete(t)}
              />
            </div>
          )}
        />
      </Panel>

      <ConfirmModal
        open={toDelete !== null}
        danger
        loading={deleting}
        title="Sterge profesor"
        message={`Sigur vrei sa stergi profesorul ${toDelete?.firstName ?? ''} ${toDelete?.lastName ?? ''}?`}
        confirmLabel="Sterge"
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
