'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { ActionIcon, IconTrash } from '@/components/ui/ActionIcon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { TimeField } from '@/components/ui/TimeField';
import { api } from '@/lib/api';
import { subjectColor } from '@/lib/subject-colors';
import { WEEKDAYS, type TimetableSlot } from '@/lib/timetable';

export type SlotFormValues = {
  classId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectId: number;
  teacherId?: number;
  room: string;
};

type Option = { value: string | number; label: string; meta?: string };

type TeacherOpt = { id: number; firstName: string; lastName: string };

type Props = {
  open: boolean;
  slot: TimetableSlot | null;
  defaults?: Partial<SlotFormValues> | null;
  classId: number | '';
  classLabel?: string;
  classOptions: Option[];
  subjectOptions: Option[];
  loading?: boolean;
  onSubmit: (values: SlotFormValues) => void;
  onClose: () => void;
  onDelete?: () => void;
};

type FormState = {
  classId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
  room: string;
};

function toForm(
  slot: TimetableSlot | null,
  defaults: Partial<SlotFormValues> | null | undefined,
  classId: number | '',
): FormState {
  if (slot) {
    return {
      classId: String(slot.classId),
      dayOfWeek: String(slot.dayOfWeek),
      startTime: slot.startTime.slice(0, 5),
      endTime: slot.endTime.slice(0, 5),
      subjectId: String(slot.subjectId),
      teacherId: String(slot.teacherId),
      room: slot.room ?? '',
    };
  }
  return {
    classId: String(defaults?.classId || classId || ''),
    dayOfWeek: String(defaults?.dayOfWeek ?? 1),
    startTime: defaults?.startTime || '08:00',
    endTime: defaults?.endTime || '08:50',
    subjectId: defaults?.subjectId ? String(defaults.subjectId) : '',
    teacherId: defaults?.teacherId ? String(defaults.teacherId) : '',
    room: defaults?.room || '',
  };
}

export function TimetableSlotModal({
  open,
  slot,
  defaults,
  classId,
  classLabel,
  classOptions,
  subjectOptions,
  loading,
  onSubmit,
  onClose,
  onDelete,
}: Props) {
  const [form, setForm] = useState<FormState>(() =>
    toForm(slot, defaults, classId),
  );
  const [fetched, setFetched] = useState<{
    key: string;
    rows: TeacherOpt[];
  } | null>(null);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setForm(toForm(slot, defaults, classId));
  }

  const resolvedClassId = Number(form.classId || classId || 0);
  const subjectIdNum = Number(form.subjectId || 0);
  const canLoadTeachers = open && resolvedClassId > 0 && subjectIdNum > 0;
  const teachersKey = String(subjectIdNum);
  const loadingTeachers = canLoadTeachers && fetched?.key !== teachersKey;
  const teachers = canLoadTeachers ? (fetched?.rows ?? []) : [];

  useEffect(() => {
    if (!canLoadTeachers) return;
    let cancelled = false;
    api<TeacherOpt[]>(
      `/subjects/teachers-for-slot?subjectId=${subjectIdNum}`,
    )
      .then((rows) => {
        if (cancelled) return;
        setFetched({ key: teachersKey, rows });
        if (rows.length === 1) {
          setForm((prev) => ({ ...prev, teacherId: String(rows[0].id) }));
        } else if (
          rows.length > 1 &&
          !rows.some((t) => String(t.id) === form.teacherId)
        ) {
          setForm((prev) => ({ ...prev, teacherId: '' }));
        }
      })
      .catch(() => {
        if (!cancelled) setFetched({ key: teachersKey, rows: [] });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload only when the class or subject changes
  }, [canLoadTeachers, teachersKey]);

  const color = useMemo(
    () => (form.subjectId ? subjectColor(Number(form.subjectId)) : null),
    [form.subjectId],
  );

  const dayName =
    WEEKDAYS.find((d) => d.value === Number(form.dayOfWeek))?.label || '';

  const resolvedLabel =
    classLabel ||
    classOptions.find((o) => String(o.value) === String(classId || form.classId))
      ?.label ||
    '';

  function patch(next: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...next }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload: SlotFormValues = {
      classId: Number(form.classId || classId),
      dayOfWeek: Number(form.dayOfWeek),
      startTime: form.startTime,
      endTime: form.endTime,
      subjectId: Number(form.subjectId),
      room: form.room.trim(),
    };
    if (form.teacherId) {
      payload.teacherId = Number(form.teacherId);
    }
    onSubmit(payload);
  }

  return (
    <Modal
      open={open}
      wide
      title={slot ? 'Modifica ora' : 'Adauga ora in calendar'}
      subtitle={`${dayName} · ${form.startTime}–${form.endTime}`}
      onClose={onClose}
    >
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Alert tone="info">
          Alegi materia. Daca mai multi profesori o predau, alegi care preda ora.
        </Alert>

        {!classId ? (
          <Select
            label="Clasa"
            value={form.classId}
            onChange={(v) => patch({ classId: v, teacherId: '' })}
            options={classOptions}
            searchPlaceholder="Cauta clasa..."
            required
          />
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            Clasa{' '}
            <span className="font-semibold text-[var(--color-ink)]">
              {resolvedLabel}
            </span>
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Ziua"
            value={form.dayOfWeek}
            onChange={(v) => patch({ dayOfWeek: v })}
            options={WEEKDAYS.map((d) => ({ value: d.value, label: d.label }))}
            required
          />
          <Select
            label="Materie"
            value={form.subjectId}
            onChange={(v) => patch({ subjectId: v, teacherId: '' })}
            options={subjectOptions}
            searchPlaceholder="Cauta materie..."
            required
          />
          <TimeField
            label="Inceput"
            value={form.startTime}
            onChange={(v) => patch({ startTime: v })}
            required
          />
          <TimeField
            label="Sfarsit"
            value={form.endTime}
            onChange={(v) => patch({ endTime: v })}
            required
          />
        </div>

        {form.subjectId ? (
          teachers.length > 1 ? (
            <Select
              label="Profesor"
              value={form.teacherId}
              onChange={(v) => patch({ teacherId: v })}
              options={teachers.map((t) => ({
                value: t.id,
                label: `${t.firstName} ${t.lastName}`,
              }))}
              searchPlaceholder="Cauta profesor..."
              required
            />
          ) : teachers.length === 1 ? (
            <p className="text-sm text-[var(--color-muted)]">
              Profesor:{' '}
              <span className="font-semibold text-[var(--color-ink)]">
                {teachers[0].firstName} {teachers[0].lastName}
              </span>
            </p>
          ) : loadingTeachers ? (
            <p className="text-sm text-[var(--color-muted)]">
              Se incarca profesorii...
            </p>
          ) : (
            <Alert tone="warning">
              Niciun profesor nu preda aceasta materie. Leaga profesorii de
              materie din pagina Profesori, apoi alege profesorul la ora din
              orar.
            </Alert>
          )
        ) : null}

        {color ? (
          <div
            className="rounded-xl border px-3 py-2 text-sm font-medium"
            style={{
              backgroundColor: color.bg,
              borderColor: color.border,
              color: color.text,
            }}
          >
            Culoare materie in calendar
          </div>
        ) : null}

        <Input
          label="Sala (optional)"
          value={form.room}
          maxLength={40}
          onChange={(e) => patch({ room: e.target.value })}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" loading={loading} className="flex-1">
            Salveaza in orar
          </Button>
          {slot && onDelete ? (
            <ActionIcon
              label="Sterge"
              variant="danger"
              disabled={loading}
              onClick={onDelete}
            >
              <IconTrash />
            </ActionIcon>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
