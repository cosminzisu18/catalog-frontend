'use client';

import { subjectColor } from '@/lib/subject-colors';
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  HOUR_HEIGHT_PX,
  WEEKDAYS,
  hoursRange,
  minutesToTime,
  parseTimeToMinutes,
  slotStyle,
  snapMinutes,
  type TimetableSlot,
} from '@/lib/timetable';

type Named = { id: number; name?: string; firstName?: string; lastName?: string };

type Props = {
  slots: TimetableSlot[];
  subjectMap: Map<number, Named>;
  teacherMap?: Map<number, Named>;
  // click on an empty spot: suggested day + time
  onAddAt?: (dayOfWeek: number, startTime: string, endTime: string) => void;
  onEdit?: (slot: TimetableSlot) => void;
  interactive?: boolean;
  showClass?: boolean;
  emptyHint?: string;
};

function labelSubject(map: Map<number, Named>, id: number) {
  return map.get(id)?.name || `Materie #${id}`;
}

function labelTeacher(map: Map<number, Named> | undefined, id: number) {
  if (!map) return null;
  const t = map.get(id);
  if (!t) return null;
  if (t.firstName) return `${t.firstName} ${t.lastName || ''}`.trim();
  return t.name || null;
}

function timeFromClickY(clientY: number, columnTop: number): string {
  const y = Math.max(0, clientY - columnTop);
  const minsFromStart = snapMinutes((y / HOUR_HEIGHT_PX) * 60, 5);
  const absolute = DAY_START_HOUR * 60 + minsFromStart;
  const maxStart = DAY_END_HOUR * 60 - 45;
  const clamped = Math.min(Math.max(absolute, DAY_START_HOUR * 60), maxStart);
  return minutesToTime(clamped);
}

export function WeekCalendar({
  slots,
  subjectMap,
  teacherMap,
  onAddAt,
  onEdit,
  interactive = false,
  showClass = false,
  emptyHint,
}: Props) {
  const hours = hoursRange();
  const gridHeight = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT_PX;

  function handleColumnClick(
    e: React.MouseEvent<HTMLDivElement>,
    dayOfWeek: number,
  ) {
    if (!interactive || !onAddAt) return;
    if ((e.target as HTMLElement).closest('[data-slot]')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const startTime = timeFromClickY(e.clientY, rect.top);
    const endMins = Math.min(
      parseTimeToMinutes(startTime) + 50,
      DAY_END_HOUR * 60,
    );
    onAddAt(dayOfWeek, startTime, minutesToTime(endMins));
  }

  const usedSubjects = [...new Set(slots.map((s) => s.subjectId))];

  return (
    <div className="space-y-4">
      {emptyHint && slots.length === 0 ? (
        <p className="rounded-xl bg-[var(--color-mist)] px-4 py-3 text-center text-sm text-[var(--color-muted)]">
          {emptyHint}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-white">
        <div
          className="grid min-w-[640px]"
          style={{ gridTemplateColumns: `52px repeat(5, minmax(0, 1fr))` }}
        >
          {/* Header */}
          <div className="border-b border-[var(--color-line)] bg-[var(--color-mist)]/50 p-2" />
          {WEEKDAYS.map((d) => (
            <div
              key={d.value}
              className="border-b border-l border-[var(--color-line)] bg-[var(--color-mist)]/50 px-2 py-2.5 text-center"
            >
              <p className="text-sm font-semibold text-[var(--color-ink)]">{d.label}</p>
              <p className="text-[10px] uppercase tracking-wide text-[var(--color-muted)] sm:hidden">
                {d.short}
              </p>
            </div>
          ))}

          {/* Time gutter + day columns */}
          <div className="relative border-r border-[var(--color-line)]" style={{ height: gridHeight }}>
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-1 -translate-y-1/2 text-[10px] font-medium text-[var(--color-muted)]"
                style={{ top: (h - DAY_START_HOUR) * HOUR_HEIGHT_PX }}
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {WEEKDAYS.map((day) => {
            const daySlots = slots.filter((s) => s.dayOfWeek === day.value);
            return (
              <div
                key={day.value}
                className={`relative border-l border-[var(--color-line)] ${
                  interactive ? 'cursor-crosshair' : ''
                }`}
                style={{ height: gridHeight }}
                onClick={(e) => handleColumnClick(e, day.value)}
                role={interactive ? 'button' : undefined}
                tabIndex={interactive ? 0 : undefined}
                aria-label={
                  interactive ? `Adauga ora in ${day.label}` : day.label
                }
              >
                {hours.map((h) => (
                  <div
                    key={h}
                    className="pointer-events-none absolute left-0 right-0 border-t border-[var(--color-line)]/60"
                    style={{ top: (h - DAY_START_HOUR) * HOUR_HEIGHT_PX }}
                  />
                ))}

                {daySlots.map((s) => {
                  const color = subjectColor(s.subjectId);
                  const { top, height } = slotStyle(s.startTime, s.endTime);
                  const teacher = labelTeacher(teacherMap, s.teacherId);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      data-slot
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(s);
                      }}
                      className={`absolute left-1 right-1 overflow-hidden rounded-lg border px-1.5 py-1 text-left shadow-sm transition hover:brightness-[0.97] ${
                        onEdit ? 'cursor-pointer' : 'cursor-default'
                      }`}
                      style={{
                        top,
                        height,
                        backgroundColor: color.bg,
                        borderColor: color.border,
                        color: color.text,
                      }}
                      title={`${labelSubject(subjectMap, s.subjectId)} · ${s.startTime}-${s.endTime}`}
                    >
                      <p className="truncate text-[10px] font-bold leading-tight">
                        {s.startTime.slice(0, 5)}–{s.endTime.slice(0, 5)}
                      </p>
                      <p className="truncate text-xs font-semibold leading-tight">
                        {labelSubject(subjectMap, s.subjectId)}
                      </p>
                      {showClass ? (
                        <p className="truncate text-[10px] font-semibold">
                          Clasa {s.className}
                        </p>
                      ) : null}
                      {teacher ? (
                        <p className="truncate text-[10px] opacity-80">{teacher}</p>
                      ) : null}
                      {s.room ? (
                        <p className="truncate text-[10px] opacity-70">Sala {s.room}</p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {usedSubjects.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {usedSubjects.map((id) => {
            const c = subjectColor(id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
                style={{
                  backgroundColor: c.bg,
                  borderColor: c.border,
                  color: c.text,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: c.border }}
                />
                {labelSubject(subjectMap, id)}
              </span>
            );
          })}
        </div>
      ) : null}

      {interactive ? (
        <p className="text-xs text-[var(--color-muted)]">
          Click pe o zi in calendar ca sa adaugi o ora. Click pe un bloc colorat ca sa
          il modifici. Profesorul se alege din cei legati de materie.
        </p>
      ) : null}
    </div>
  );
}
