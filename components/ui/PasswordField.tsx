'use client';

import { useMemo, useState } from 'react';
import { checkPassword, generateStrongPassword } from '@/lib/password';
import { Input } from './Input';

type Props = {
  label?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  showStrength?: boolean;
  allowGenerate?: boolean;
  required?: boolean;
  error?: string;
  autoComplete?: string;
};

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 3l18 18M10.5 10.7a2.5 2.5 0 003.5 3.5M9.9 5.1A10.4 10.4 0 0112 5c5 0 9.3 3.1 11 7-0.6 1.4-1.5 2.7-2.7 3.8M6.1 6.1C4.2 7.4 2.7 9.1 1.9 11c1.7 3.9 6 7 10.1 7 1.4 0 2.8-.3 4-.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function PasswordField({
  label = 'Parola',
  name = 'password',
  value,
  onChange,
  showStrength = true,
  allowGenerate = false,
  required,
  error,
  autoComplete = 'new-password',
}: Props) {
  const [visible, setVisible] = useState(false);
  const check = useMemo(() => checkPassword(value), [value]);

  function handleGenerate() {
    const next = generateStrongPassword();
    onChange(next);
    setVisible(true);
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          label={label}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          error={error}
          autoComplete={autoComplete}
          className={allowGenerate ? 'pr-28' : 'pr-12'}
        />
        <div className="absolute right-3 top-[34px] flex items-center gap-2">
          {allowGenerate ? (
            <button
              type="button"
              className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
              onClick={handleGenerate}
            >
              Genereaza
            </button>
          ) : null}
          <button
            type="button"
            className="text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ascunde parola' : 'Arata parola'}
          >
            <EyeIcon open={visible} />
          </button>
        </div>
      </div>

      {showStrength && value ? (
        <div className="space-y-2 rounded-xl bg-[var(--color-mist)] p-3">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < check.score
                    ? check.score < 3
                      ? 'bg-amber-500'
                      : check.score < 5
                        ? 'bg-lime-500'
                        : 'bg-emerald-600'
                    : 'bg-white'
                }`}
              />
            ))}
          </div>
          <ul className="grid gap-1 text-xs text-[var(--color-muted)] sm:grid-cols-2">
            <li className={check.minLength ? 'text-emerald-700' : ''}>Min. 8 caractere</li>
            <li className={check.upper ? 'text-emerald-700' : ''}>Litera mare</li>
            <li className={check.lower ? 'text-emerald-700' : ''}>Litera mica</li>
            <li className={check.number ? 'text-emerald-700' : ''}>Cifra</li>
            <li className={check.special ? 'text-emerald-700' : ''}>Caracter special</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
