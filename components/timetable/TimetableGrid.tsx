'use client';

import { WeekCalendar } from '@/components/timetable/WeekCalendar';
import type { TimetableSlot } from '@/lib/timetable';

type Props = {
  slots: TimetableSlot[];
  subjectMap: Map<number, { id: number; name: string }>;
  // teachers see several classes, so each lesson shows its class
  showClass?: boolean;
  emptyText?: string;
};

// read-only week calendar (teacher, student, director preview)
export function TimetableGrid({
  slots,
  subjectMap,
  showClass,
  emptyText = 'Niciun slot in orar.',
}: Props) {
  return (
    <WeekCalendar
      slots={slots}
      subjectMap={subjectMap}
      showClass={showClass}
      emptyHint={slots.length === 0 ? emptyText : undefined}
    />
  );
}
