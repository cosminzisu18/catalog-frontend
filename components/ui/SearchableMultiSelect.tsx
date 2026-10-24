'use client';

import { useMemo, useState } from 'react';

export type SearchOption = { value: number; label: string; meta?: string };

type Props = {
  label: string;
  options: SearchOption[];
  value: number[];
  onChange: (value: number[]) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
};

export function SearchableMultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Cauta...',
  error,
  required,
}: Props) {
  const [query, setQuery] = useState('');

  const selected = useMemo(() => {
    const map = new Map(options.map((o) => [o.value, o]));
    return value.map((id) => map.get(id)).filter(Boolean) as SearchOption[];
  }, [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((o) => {
      if (value.includes(o.value)) return false;
      if (!q) return true;
      return (
        o.label.toLowerCase().includes(q) ||
        (o.meta ? o.meta.toLowerCase().includes(q) : false)
      );
    });
  }, [options, query, value]);

  function toggle(id: number) {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...value, id]);
    }
  }

  function remove(id: number) {
    onChange(value.filter((x) => x !== id));
  }

  return (
    <div className="block space-y-1.5">
      <span className="text-sm font-medium text-[var(--color-ink)]">
        {label}
        {required ? ' *' : ''}
      </span>

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => remove(o.value)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-mist)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink)]"
              title="Elimina"
            >
              {o.label}
              <span aria-hidden className="text-[var(--color-muted)]">
                ×
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] ${
          error ? 'border-[var(--color-danger)]' : 'border-[var(--color-line)]'
        }`}
        style={{ colorScheme: 'light', backgroundColor: '#fff' }}
      />

      <div className="max-h-44 overflow-y-auto rounded-xl border border-[var(--color-line)] bg-white">
        {filtered.length === 0 ? (
          <p className="px-3 py-3 text-sm text-[var(--color-muted)]">
            {options.length === 0
              ? 'Nicio optiune disponibila.'
              : query
                ? 'Niciun rezultat.'
                : 'Toti elevii selectati.'}
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-line)]/70 py-1">
            {filtered.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => {
                    toggle(o.value);
                    setQuery('');
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-[var(--color-mist)]"
                >
                  <span className="font-medium text-[var(--color-ink)]">{o.label}</span>
                  {o.meta ? (
                    <span className="shrink-0 text-xs text-[var(--color-muted)]">{o.meta}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? (
        <span className="block text-xs text-[var(--color-danger)]">{error}</span>
      ) : null}
    </div>
  );
}
