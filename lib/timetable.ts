export type TimetableSlot = {
  id: number;
  schoolId: number;
  classId: number;
  className: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectId: number;
  teacherId: number;
  room: string | null;
};

export const WEEKDAYS = [
  { value: 1, label: 'Luni', short: 'Lu' },
  { value: 2, label: 'Marti', short: 'Ma' },
  { value: 3, label: 'Miercuri', short: 'Mi' },
  { value: 4, label: 'Joi', short: 'Jo' },
  { value: 5, label: 'Vineri', short: 'Vi' },
] as const;

export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 18;
export const HOUR_HEIGHT_PX = 56;

export function dayLabel(day: number) {
  return WEEKDAYS.find((d) => d.value === day)?.label || `Zi ${day}`;
}

export function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.slice(0, 5).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function snapMinutes(mins: number, step = 5): number {
  return Math.round(mins / step) * step;
}

export function slotStyle(startTime: string, endTime: string): {
  top: number;
  height: number;
} {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const gridStart = DAY_START_HOUR * 60;
  const top = ((start - gridStart) / 60) * HOUR_HEIGHT_PX;
  const height = Math.max(((end - start) / 60) * HOUR_HEIGHT_PX, 28);
  return { top, height };
}

export function hoursRange(): number[] {
  const hours: number[] = [];
  for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h += 1) hours.push(h);
  return hours;
}
