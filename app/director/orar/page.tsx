'use client';

import { useMemo, useState } from 'react';
import { useDirector } from '@/components/dashboard/DirectorProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  TimetableSlotModal,
  type SlotFormValues,
} from '@/components/timetable/TimetableSlotModal';
import { WeekCalendar } from '@/components/timetable/WeekCalendar';
import { Alert } from '@/components/ui/Alert';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Panel } from '@/components/ui/Panel';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { useLoad } from '@/hooks/useLoad';
import { api } from '@/lib/api';
import type { TimetableSlot } from '@/lib/timetable';

export default function DirectorTimetablePage() {
  const toast = useToast();
  const { classes, subjects, teacherMap, dataVersion, canEdit } = useDirector();

  const [selectedClassId, setSelectedClassId] = useState('');
  const [slotsVersion, setSlotsVersion] = useState(0);
  const [editing, setEditing] = useState<TimetableSlot | null>(null);
  const [defaults, setDefaults] = useState<Partial<SlotFormValues> | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<TimetableSlot | null>(null);
  const [saving, setSaving] = useState(false);

  const classOptions = useMemo(
    () =>
      classes
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, 'ro'))
        .map((c) => ({ value: c.id, label: c.name })),
    [classes],
  );

  const classIdStr =
    selectedClassId ||
    (classOptions.length === 1 ? String(classOptions[0].value) : '');
  const classId = classIdStr ? Number(classIdStr) : '';
  const classLabel =
    classOptions.find((c) => String(c.value) === classIdStr)?.label || '';

  const subjectOptions = useMemo(
    () => subjects.map((s) => ({ value: s.id, label: s.name })),
    [subjects],
  );

  const loaded = useLoad(
    () =>
      classId
        ? api<TimetableSlot[]>(`/timetable?classId=${classId}`).then((rows) => ({
            classId,
            rows,
          }))
        : Promise.resolve(null),
    `${classId}#${slotsVersion}#${dataVersion}`,
  ).data;

  const visibleSlots = loaded?.classId === classId ? loaded.rows : [];

  function openCreate(dayOfWeek: number, startTime: string, endTime: string) {
    if (!canEdit()) return;
    if (!classId) {
      toast.error('Alege mai intai clasa');
      return;
    }
    setEditing(null);
    setDefaults({ classId, dayOfWeek, startTime, endTime });
    setFormOpen(true);
  }

  function openEdit(slot: TimetableSlot) {
    if (!canEdit()) return;
    setEditing(slot);
    setDefaults(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setDefaults(null);
  }

  async function saveSlot(values: SlotFormValues) {
    setSaving(true);
    try {
      const payload = {
        ...values,
        classId: classId || values.classId,
        room: values.room || null,
      };
      if (editing) {
        await api(`/timetable/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Ora actualizata, o vad si profesorul si elevii');
      } else {
        await api('/timetable', {
          method: 'POST',
          body: JSON.stringify({
            ...payload,
            room: values.room || undefined,
          }),
        });
        toast.success('Ora adaugata in calendar');
      }
      closeForm();
      setSlotsVersion((v) => v + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eroare');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSlot() {
    const id = toDelete?.id || editing?.id;
    if (!id) return;
    setSaving(true);
    try {
      await api(`/timetable/${id}`, { method: 'DELETE' });
      toast.success('Ora stearsa din orar');
      setToDelete(null);
      closeForm();
      setSlotsVersion((v) => v + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eroare');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Director"
        title="Orar"
        subtitle="Selectezi clasa, pui materia pe ora; daca mai multi profesori predau materia, alegi care preda."
      />

      <Panel>
        <div className="mb-4 max-w-xs">
          <Select
            label="Clasa"
            value={classIdStr}
            onChange={setSelectedClassId}
            options={classOptions}
            searchPlaceholder="Cauta clasa..."
            required
          />
        </div>

        {!classId ? (
          <Alert tone="warning">
            Selecteaza o clasa ca sa vezi si sa editezi calendarul saptamanal.
          </Alert>
        ) : (
          <WeekCalendar
            interactive
            slots={visibleSlots}
            subjectMap={new Map(subjects.map((s) => [s.id, s]))}
            teacherMap={teacherMap}
            onEdit={openEdit}
            onAddAt={openCreate}
          />
        )}
      </Panel>

      <TimetableSlotModal
        open={formOpen}
        slot={editing}
        defaults={defaults}
        classId={classId}
        classLabel={classLabel}
        classOptions={classOptions}
        subjectOptions={subjectOptions}
        loading={saving}
        onSubmit={saveSlot}
        onClose={closeForm}
        onDelete={editing ? () => setToDelete(editing) : undefined}
      />

      <ConfirmModal
        open={toDelete !== null}
        danger
        loading={saving}
        title="Sterge ora"
        message="Sigur vrei sa stergi aceasta ora din orar?"
        confirmLabel="Sterge"
        onConfirm={deleteSlot}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
