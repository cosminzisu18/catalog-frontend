'use client';

import { useId, useMemo } from 'react';
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  minutesToTime,
  parseTimeToMinutes,
} from '@/lib/timetable';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  // earliest time (included). Default: start of the school day.
  minHour?: number;
  // latest time (included). Default: end of the school day.
  maxHour?: number;
  // minute step (e.g. 5)
  stepMinutes?: number;
  id?: string;
  className?: string;
};

function clampTime(
  hhmm: string,
  minHour: number,
  maxHour: number,
  stepMinutes: number,
): string {
  let mins = parseTimeToMinutes(hhmm || `${String(minHour).padStart(2, '0')}:00`);
  const min = minHour * 60;
  const max = maxHour * 60;
  mins = Math.min(Math.max(mins, min), max);
  const stepped = Math.round(mins / stepMinutes) * stepMinutes;
  return minutesToTime(Math.min(Math.max(stepped, min), max));
}

// HH:MM time picker (e.g. 07:45), no AM/PM
export function TimeField({
  label,
  value,
  onChange,
  required,
  disabled,
  error,
  hint,
  minHour = DAY_START_HOUR,
  maxHour = DAY_END_HOUR,
  stepMinutes = 5,
  id,
  className = '',
}: Props) {
  const autoId = useId();
  const fieldId = id || autoId;
  const hourId = `${fieldId}-hour`;
  const minuteId = `${fieldId}-minute`;

  const normalized = useMemo(
    () => clampTime(value, minHour, maxHour, stepMinutes),
    [value, minHour, maxHour, stepMinutes],
  );

  const hour = Number(normalized.slice(0, 2));
  const minute = Number(normalized.slice(3, 5));

  const hours = useMemo(() => {
    const list: number[] = [];
    for (let h = minHour; h <= maxHour; h += 1) list.push(h);
    return list;
  }, [minHour, maxHour]);

  const minutes = useMemo(() => {
    const list: number[] = [];
    for (let m = 0; m < 60; m += stepMinutes) list.push(m);
    return list;
  }, [stepMinutes]);

  function emit(nextHour: number, nextMinute: number) {
    onChange(
      clampTime(
        minutesToTime(nextHour * 60 + nextMinute),
        minHour,
        maxHour,
        stepMinutes,
      ),
    );
  }

  const selectClass = `rounded-xl border bg-white px-2.5 py-2.5 text-sm tabular-nums text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:opacity-60 ${
    error ? 'border-[var(--color-danger)]' : 'border-[var(--color-line)]'
  }`;

  return (
    <div className={`block space-y-1.5 ${className}`}>
      <span className="text-sm font-medium text-[var(--color-ink)]">
        {label}
        {required ? ' *' : ''}
      </span>
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={hourId}>
          Ora
        </label>
        <select
          id={hourId}
          value={hour}
          disabled={disabled}
          required={required}
          className={`min-w-0 flex-1 ${selectClass}`}
          onChange={(e) => emit(Number(e.target.value), minute)}
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, '0')}
            </option>
          ))}
        </select>
        <span className="text-sm font-semibold text-[var(--color-muted)]" aria-hidden>
          :
        </span>
        <label className="sr-only" htmlFor={minuteId}>
          Minute
        </label>
        <select
          id={minuteId}
          value={minute}
          disabled={disabled}
          required={required}
          className={`min-w-0 flex-1 ${selectClass}`}
          onChange={(e) => emit(hour, Number(e.target.value))}
        >
          {minutes.map((m) => (
            <option key={m} value={m}>
              {String(m).padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>
      {hint && !error ? (
        <span className="block text-xs text-[var(--color-muted)]">{hint}</span>
      ) : null}
      {error ? (
        <span className="block text-xs text-[var(--color-danger)]">{error}</span>
      ) : null}
    </div>
  );
}
