'use client';

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  name?: string;
  max?: string;
};

// the value is dd-mm-yyyy; the UI is a single input type="date"
export function DateField({
  label = 'Data',
  value,
  onChange,
  error,
  required,
  name = 'date',
  max,
}: Props) {
  const toIso = (ddmmyyyy: string) => {
    if (!/^\d{2}-\d{2}-\d{4}$/.test(ddmmyyyy)) return '';
    const [dd, mm, yyyy] = ddmmyyyy.split('-');
    return `${yyyy}-${mm}-${dd}`;
  };

  const fromIso = (iso: string) => {
    if (!iso) return '';
    const [yyyy, mm, dd] = iso.split('-');
    return `${dd}-${mm}-${yyyy}`;
  };

  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-[var(--color-ink)]">
        {label}
        {required ? ' *' : ''}
      </span>
      <input
        type="date"
        name={name}
        required={required}
        value={toIso(value)}
        max={max ? toIso(max) : undefined}
        onChange={(e) => onChange(fromIso(e.target.value))}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] ${
          error ? 'border-[var(--color-danger)]' : 'border-[var(--color-line)]'
        }`}
        style={{ colorScheme: 'light', backgroundColor: '#fff' }}
      />
      {error ? (
        <span className="block text-xs text-[var(--color-danger)]">{error}</span>
      ) : null}
    </label>
  );
}
