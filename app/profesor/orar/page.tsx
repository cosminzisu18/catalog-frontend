'use client';

import { useTeacher } from '@/components/dashboard/TeacherProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { Panel } from '@/components/ui/Panel';
import { useLoad } from '@/hooks/useLoad';
import { api } from '@/lib/api';
import type { TimetableSlot } from '@/lib/timetable';

export default function TeacherTimetablePage() {
  const { subjectMap } = useTeacher();
  const slots =
    useLoad(() => api<TimetableSlot[]>('/timetable/mine'), 'mine').data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Profesor" title="Orarul meu" />
      <Panel>
        <TimetableGrid slots={slots} subjectMap={subjectMap} showClass />
      </Panel>
    </div>
  );
}
