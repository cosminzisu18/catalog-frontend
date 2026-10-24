'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { formatMonthYear } from '@/lib/format';

export type ShellNavItem = {
  href: string;
  label: string;
  badge?: number;
};

type Props = {
  title: string;
  roleLabel: string;
  nav: ShellNavItem[];
  settingsHref: string;
  children: ReactNode;
};

export function AppShell({ title, roleLabel, nav, settingsHref, children }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const settingsActive =
    pathname === settingsHref || pathname.startsWith(settingsHref + '/');

  function navClass(active: boolean) {
    return `flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
      active
        ? 'bg-white text-[var(--color-ink)] shadow-sm'
        : 'text-white/90 hover:bg-white/10 hover:text-white'
    }`;
  }

  const sidebar = (
    <div className="flex h-full flex-col font-sans">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-200/90">
          Catalog Digital
        </p>
        <h1 className="mt-2 font-display text-2xl text-white">{title}</h1>
        <p className="mt-1 text-sm text-teal-100/70">{roleLabel}</p>
        <p className="mt-1 text-xs capitalize text-teal-100/60">
          {formatMonthYear()}
        </p>
        {user?.schoolName ? (
          <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-xs text-teal-50">
            {user.schoolName}
          </p>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== nav[0]?.href && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={navClass(active)}
            >
              <span className={active ? 'text-[var(--color-ink)]' : 'text-white'}>
                {item.label}
              </span>
              {typeof item.badge === 'number' && item.badge > 0 ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    active
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-white/25 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-white/10 px-3 py-4">
        <Link
          href={settingsHref}
          onClick={() => setOpen(false)}
          className={navClass(settingsActive)}
        >
          <span className={settingsActive ? 'text-[var(--color-ink)]' : 'text-white'}>
            Setari
          </span>
        </Link>
        <p className="truncate px-3 pt-1 text-xs text-white/70">{user?.email}</p>
        <div className="px-1">
          <Button
            variant="danger"
            className="w-full"
            onClick={() => {
              void logout().then(() => router.push('/login'));
            }}
          >
            Deconectare
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans lg:grid lg:grid-cols-[270px_1fr]">
      <aside className="hidden bg-[linear-gradient(180deg,#0f4f4a_0%,#0b3d39_55%,#0a3330_100%)] lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-label="Inchide meniul"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-[min(270px,86vw)] bg-[linear-gradient(180deg,#0f4f4a_0%,#0b3d39_55%,#0a3330_100%)] shadow-2xl">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--color-line)] bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-line)] bg-white text-[var(--color-ink)] transition hover:bg-[var(--color-mist)]"
            aria-label="Deschide meniul"
            title="Meniu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Catalog Digital
            </p>
            <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{title}</p>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl space-y-4 px-3 pb-8 pt-5 sm:space-y-5 sm:px-5 sm:pt-8 lg:px-8 lg:pb-10 lg:pt-12">
          {children}
        </main>
      </div>

    </div>
  );
}
