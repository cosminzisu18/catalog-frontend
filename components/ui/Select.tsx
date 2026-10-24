'use client';

import {
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

export type SelectOption = {
  value: string | number;
  label: string;
  meta?: string;
};

type Props = {
  label?: string;
  options: SelectOption[];
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  // "empty" option (e.g. All subjects), value ''
  emptyLabel?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  // compact version for the filters in ListControls
  compact?: boolean;
  className?: string;
  searchPlaceholder?: string;
};

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecteaza...',
  emptyLabel,
  error,
  required,
  disabled,
  compact,
  className = '',
  searchPlaceholder = 'Cauta...',
}: Props) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selectOnly = useEffectEvent((only: string) => onChange(only));
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const stringValue = value === undefined || value === null ? '' : String(value);

  const allOptions = useMemo(() => {
    const base: { value: string; label: string; meta?: string }[] = options.map(
      (o) => ({
        value: String(o.value),
        label: o.label,
        meta: o.meta,
      }),
    );
    if (emptyLabel !== undefined) {
      return [{ value: '', label: emptyLabel }, ...base];
    }
    return base;
  }, [options, emptyLabel]);

  const selected = allOptions.find((o) => o.value === stringValue);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allOptions;
    return allOptions.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.meta ? o.meta.toLowerCase().includes(q) : false),
    );
  }, [allOptions, query]);

  // only one real option, so pick it automatically
  useEffect(() => {
    if (disabled || options.length !== 1) return;
    const only = String(options[0].value);
    if (stringValue === only) return;
    selectOnly(only);
  }, [disabled, options, stringValue]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  function pick(next: string) {
    onChange(next);
    setOpen(false);
    setQuery('');
  }

  const triggerClass = compact
    ? 'h-[42px] w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition'
    : 'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition';

  return (
    <div
      ref={rootRef}
      className={`relative min-w-0 ${compact ? 'w-full' : 'block space-y-1.5'} ${className}`}
    >
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">
          {label}
          {required ? ' *' : ''}
        </label>
      ) : null}

      {/* HTML required validation on form submit */}
      <input
        id={id}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        value={stringValue}
        onChange={() => undefined}
        required={required && !emptyLabel}
        disabled={disabled}
      />

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
          setQuery('');
        }}
        className={`${triggerClass} flex items-center justify-between gap-2 text-left focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:opacity-50 ${
          error ? 'border-[var(--color-danger)]' : 'border-[var(--color-line)]'
        }`}
        style={{ colorScheme: 'light', backgroundColor: '#fff' }}
      >
        <span
          className={
            selected && (selected.value !== '' || emptyLabel)
              ? 'truncate text-[var(--color-ink)]'
              : 'truncate text-[var(--color-muted)]'
          }
        >
          {selected?.label ?? placeholder}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className={`shrink-0 text-[var(--color-muted)] transition ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          className="absolute left-0 right-0 z-50 mt-1 min-w-[12rem] overflow-hidden rounded-xl border border-[var(--color-line)] bg-white shadow-[0_16px_40px_rgba(15,40,45,0.14)]"
          role="listbox"
        >
          <div className="border-b border-[var(--color-line)] p-2">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
              style={{ colorScheme: 'light', backgroundColor: '#fff' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-[var(--color-muted)]">Niciun rezultat.</li>
            ) : (
              filtered.map((o) => {
                const active = o.value === stringValue;
                return (
                  <li key={o.value === '' ? '__empty' : o.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => pick(o.value)}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-[var(--color-mist)] ${
                        active ? 'bg-[var(--color-mist)] font-semibold' : ''
                      }`}
                    >
                      <span className="text-[var(--color-ink)]">{o.label}</span>
                      {o.meta ? (
                        <span className="shrink-0 text-xs text-[var(--color-muted)]">{o.meta}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}

      {error ? (
        <span className="block text-xs text-[var(--color-danger)]">{error}</span>
      ) : null}
    </div>
  );
}
