import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Input({ label, error, hint, className = '', id, required, ...props }: Props) {
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      <span className="text-sm font-medium text-[var(--color-ink)]">
        {label}
        {required ? ' *' : ''}
      </span>
      <input
        id={inputId}
        required={required}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] ${
          error ? 'border-[var(--color-danger)]' : 'border-[var(--color-line)]'
        } ${className}`}
        {...props}
        style={{
          colorScheme: 'light',
          backgroundColor: '#fff',
          color: 'var(--color-ink)',
          ...props.style,
        }}
      />
      {hint && !error ? (
        <span className="block text-xs text-[var(--color-muted)]">{hint}</span>
      ) : null}
      {error ? (
        <span className="block text-xs text-[var(--color-danger)]">{error}</span>
      ) : null}
    </label>
  );
}
