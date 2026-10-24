'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  useDirector,
  type SchoolClass,
} from '@/components/dashboard/DirectorProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  ActionIcon,
  IconEdit,
  IconMove,
  IconTrash,
} from '@/components/ui/ActionIcon';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { DataColumn } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Panel } from '@/components/ui/Panel';
import { SearchableMultiSelect } from '@/components/ui/SearchableMultiSelect';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { PagedTable } from '@/components/ui/PagedTable';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { api } from '@/lib/api';

const SORT_OPTIONS = [
  { value: 'name', label: 'Nume' },
  { value: 'studentCount', label: 'Nr. elevi' },
];

export default function DirectorClassesPage() {
  const { students, reload, dataVersion, canEdit } = useDirector();
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolClass | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<SchoolClass | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [toDelete, setToDelete] = useState<SchoolClass | null>(null);
  const [loading, setLoading] = useState(false);

  const list = usePaginatedList<SchoolClass>({
    path: '/classes',
    initialSortBy: 'name',
    refreshKey: dataVersion,
  });

  function openCreate() {
    if (!canEdit()) return;
    setEditing(null);
    setName('');
    setDescription('');
    setFormOpen(true);
  }

  function openEdit(cls: SchoolClass) {
    if (!canEdit()) return;
    setEditing(cls);
    setName(cls.name);
    setDescription(cls.description || '');
    setFormOpen(true);
  }

  function openAssign(cls: SchoolClass) {
    if (!canEdit()) return;
    setAssignTarget(cls);
    setSelectedIds([]);
    setAssignOpen(true);
  }

  async function saveClass(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await api(`/classes/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || null,
          }),
        });
        toast.success('Clasa actualizata');
      } else {
        await api('/classes', {
          method: 'POST',
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
          }),
        });
        toast.success('Clasa creata');
      }
      setFormOpen(false);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eroare');
    } finally {
      setLoading(false);
    }
  }

  async function saveAssign(e: FormEvent) {
    e.preventDefault();
    if (!assignTarget) return;
    if (selectedIds.length === 0) {
      toast.error('Selecteaza cel putin un elev');
      return;
    }
    setLoading(true);
    try {
      await api(`/classes/${assignTarget.id}/students`, {
        method: 'POST',
        body: JSON.stringify({ studentIds: selectedIds }),
      });
      toast.success('Elevii au fost mutati in clasa');
      setAssignOpen(false);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eroare');
    } finally {
      setLoading(false);
    }
  }

  async function deleteClass() {
    if (!toDelete) return;
    setLoading(true);
    try {
      await api(`/classes/${toDelete.id}`, { method: 'DELETE' });
      toast.success('Clasa stearsa');
      setToDelete(null);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eroare');
    } finally {
      setLoading(false);
    }
  }

  // every student has a class; here you pick students from other classes and move them
  const assignOptions = useMemo(() => {
    if (!assignTarget) return [];
    return students
      .filter((s) => s.classId !== assignTarget.id)
      .map((s) => ({
        value: s.id,
        label: `${s.firstName} ${s.lastName}`,
        meta: s.className,
      }));
  }, [students, assignTarget]);

  const columns: DataColumn<SchoolClass>[] = [
    {
      key: 'name',
      header: 'Clasa',
      primary: true,
      cell: (c) => c.name,
    },
    {
      key: 'description',
      header: 'Descriere',
      hideOnMobile: true,
      cell: (c) => c.description || '—',
    },
    {
      key: 'students',
      header: 'Elevi',
      cell: (c) => c.studentCount,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Director"
        title="Clase"
        subtitle="Fiecare elev apartine unei clase. Orarul foloseste aceleasi clase."
        actions={<Button onClick={openCreate}>Adauga clasa</Button>}
      />

      <Panel>
        <PagedTable
          list={list}
          sortOptions={SORT_OPTIONS}
          searchPlaceholder="Cauta clasa..."
          columns={columns}
          rowKey={(c) => c.id}
          emptyText="Nicio clasa inca."
          actions={(cls) => (
            <div className="flex flex-wrap justify-end gap-1.5">
              <ActionIcon label="Muta elevi" onClick={() => openAssign(cls)}>
                <IconMove />
              </ActionIcon>
              <ActionIcon label="Modifica" onClick={() => openEdit(cls)}>
                <IconEdit />
              </ActionIcon>
              <ActionIcon
                label="Sterge"
                variant="danger"
                onClick={() => canEdit() && setToDelete(cls)}
              >
                <IconTrash />
              </ActionIcon>
            </div>
          )}
        />
      </Panel>

      <Modal
        open={formOpen}
        title={editing ? 'Modifica clasa' : 'Adauga clasa'}
        onClose={() => setFormOpen(false)}
      >
        <form className="space-y-3" onSubmit={saveClass}>
          <Input
            label="Nume clasa"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: 9A"
            required
          />
          <Textarea
            label="Descriere (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="submit" loading={loading} className="w-full">
            Salveaza
          </Button>
        </form>
      </Modal>

      <Modal
        open={assignOpen}
        title={
          assignTarget
            ? `Muta elevi in clasa ${assignTarget.name}`
            : 'Muta elevi'
        }
        subtitle="Elevii selectati sunt mutati din clasa lor actuala in aceasta clasa."
        onClose={() => setAssignOpen(false)}
        wide
      >
        <form className="space-y-3" onSubmit={saveAssign}>
          <SearchableMultiSelect
            label="Elevi"
            value={selectedIds}
            onChange={setSelectedIds}
            options={assignOptions}
            placeholder="Cauta elev..."
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            Muta elevii
          </Button>
        </form>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        danger
        loading={loading}
        title="Sterge clasa?"
        message="Clasa se poate sterge doar daca nu are elevi si nici ore in orar."
        confirmLabel="Sterge"
        onConfirm={deleteClass}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
