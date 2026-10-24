import type { TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function Textarea({ label, error, className = '', id, required, ...props }: Props) {
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      <span className="text-sm font-medium text-[var(--color-ink)]">
        {label}
        {required ? ' *' : ''}
      </span>
      <textarea
        id={inputId}
        required={required}
        className={`min-h-24 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] ${
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
      {error ? (
        <span className="block text-xs text-[var(--color-danger)]">{error}</span>
      ) : null}
    </label>
  );
}
