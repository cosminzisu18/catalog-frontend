import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
};

const styles: Record<NonNullable<Props['variant']>, string> = {
  primary:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-sm',
  secondary:
    'bg-white text-[var(--color-ink)] border border-[var(--color-line)] hover:bg-[var(--color-mist)]',
  ghost: 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-mist)]',
  danger: 'bg-[var(--color-danger)] text-white hover:opacity-90',
};

export function Button({
  variant = 'primary',
  loading,
  className = '',
  children,
  disabled,
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Se incarca...' : children}
    </button>
  );
}
