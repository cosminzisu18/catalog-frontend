'use client';

import { useStudent } from '@/components/dashboard/StudentProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { Panel } from '@/components/ui/Panel';
import { useLoad } from '@/hooks/useLoad';
import { api } from '@/lib/api';
import type { TimetableSlot } from '@/lib/timetable';

export default function StudentTimetablePage() {
  const { me, subjectMap } = useStudent();
  const slots =
    useLoad(() => api<TimetableSlot[]>('/timetable/my-class'), 'my-class').data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Elev"
        title="Orarul meu"
        subtitle={me ? `Clasa ${me.className}` : undefined}
      />
      <Panel>
        <TimetableGrid slots={slots} subjectMap={subjectMap} />
      </Panel>
    </div>
  );
}
