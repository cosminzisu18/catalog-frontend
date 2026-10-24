'use client';

import { useMemo, useState } from 'react';
import {
  useDirector,
  type Student,
} from '@/components/dashboard/DirectorProvider';
import { PersonRowActions } from '@/components/dashboard/PersonRowActions';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { DataColumn } from '@/components/ui/DataTable';
import { Panel } from '@/components/ui/Panel';
import { Select } from '@/components/ui/Select';
import { ActiveBadge } from '@/components/ui/StatusBadge';
import { PagedTable } from '@/components/ui/PagedTable';
import { usePaginatedList } from '@/hooks/usePaginatedList';

const SORT_OPTIONS = [
  { value: 'lastName', label: 'Nume' },
  { value: 'firstName', label: 'Prenume' },
  { value: 'className', label: 'Clasa' },
  { value: 'conductGrade', label: 'Purtare' },
];

const COLUMNS: DataColumn<Student>[] = [
  {
    key: 'name',
    header: 'Nume',
    primary: true,
    cell: (s) => `${s.firstName} ${s.lastName}`,
  },
  { key: 'class', header: 'Clasa', cell: (s) => s.className },
  { key: 'age', header: 'Varsta', cell: (s) => s.age ?? '—' },
  { key: 'conduct', header: 'Purtare', cell: (s) => Number(s.conductGrade) },
  { key: 'email', header: 'Email', hideOnMobile: true, cell: (s) => s.email },
  { key: 'status', header: 'Status', cell: (s) => <ActiveBadge isActive={s.isActive} /> },
];

export default function DirectorStudentsPage() {
  const {
    classes,
    dataVersion,
    openModal,
    openEditStudent,
    setStudentActive,
    removeStudent,
  } = useDirector();
  const [classId, setClassId] = useState('');
  const [toDelete, setToDelete] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  const classOptions = useMemo(
    () =>
      classes
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, 'ro'))
        .map((c) => ({ value: c.id, label: c.name })),
    [classes],
  );

  const list = usePaginatedList<Student>({
    path: '/students',
    initialSortBy: 'lastName',
    extra: { classId },
    refreshKey: dataVersion,
  });

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    await removeStudent(toDelete.id);
    setDeleting(false);
    setToDelete(null);
  }

  function changeClass(value: string) {
    setClassId(value);
    list.setPage(1);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Director"
        title="Elevi"
        actions={<Button onClick={() => openModal('student')}>Adauga elev</Button>}
      />

      <Panel>
        <PagedTable
          list={list}
          sortOptions={SORT_OPTIONS}
          searchPlaceholder="Cauta elev..."
          filters={
            <Select
              label="Clasa"
              value={classId}
              onChange={changeClass}
              options={classOptions}
              emptyLabel="Toate clasele"
              searchPlaceholder="Cauta clasa..."
            />
          }
          columns={COLUMNS}
          rowKey={(s) => s.id}
          emptyText="Niciun elev gasit."
          actions={(s) => (
            <PersonRowActions
              detailHref={`/director/elevi/${s.id}`}
              isActive={s.isActive}
              onEdit={() => openEditStudent(s)}
              onToggleActive={() => setStudentActive(s.id, !s.isActive)}
              onDelete={() => setToDelete(s)}
            />
          )}
        />
      </Panel>

      <ConfirmModal
        open={toDelete !== null}
        danger
        loading={deleting}
        title="Sterge elev"
        message={`Sigur vrei sa stergi elevul ${toDelete?.firstName ?? ''} ${toDelete?.lastName ?? ''}?`}
        confirmLabel="Sterge"
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
