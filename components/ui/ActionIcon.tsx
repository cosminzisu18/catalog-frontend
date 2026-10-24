import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Button } from './Button';

type Variant = 'secondary' | 'ghost' | 'danger';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
};

export function ActionIcon({
  label,
  variant = 'secondary',
  className = '',
  children,
  loading,
  disabled,
  ...props
}: Props) {
  return (
    <Button
      type="button"
      variant={variant}
      title={label}
      aria-label={label}
      disabled={disabled || loading}
      className={`h-9 w-9 shrink-0 !px-0 !py-0 ${loading ? 'opacity-60' : ''} ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}

export function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPower({ off = false }: { off?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2v10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d={
          off
            ? 'M6.7 6.7a7.5 7.5 0 1010.6 0'
            : 'M18.4 6.6a7.5 7.5 0 11-12.8 0'
        }
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconDetails() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 11v5M12 8h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconBook() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5.5A2.5 2.5 0 016.5 3H20v16H6.5A2.5 2.5 0 004 16.5v-11z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8 7h8M8 11h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconMove() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 7l5-5 5 5M12 2v13M7 17l5 5 5-5M12 22V14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 18l-6-6 6-6M9 12h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const actionLinkClass =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-line)] bg-white text-[var(--color-ink)] transition hover:bg-[var(--color-mist)]';

export function ActionLink({
  href,
  label,
  children,
  className = '',
}: {
  href: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={`${actionLinkClass} ${className}`}
    >
      {children}
    </Link>
  );
}

export function BackLink({
  href,
  label = 'Inapoi',
  className = '',
}: {
  href: string;
  label?: string;
  className?: string;
}) {
  return (
    <ActionLink href={href} label={label} className={className}>
      <IconBack />
    </ActionLink>
  );
}
