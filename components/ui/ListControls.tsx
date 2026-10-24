'use client';

import type { ReactNode } from 'react';
import { PAGE_SIZES } from '@/lib/pagination';
import { Select } from '@/components/ui/Select';

type SortOption = { value: string; label: string };

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  sortOptions: SortOption[];
  onSortByChange: (value: string) => void;
  onToggleOrder: () => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
};

export function ListControls({
  search,
  onSearchChange,
  sortBy,
  sortOrder,
  sortOptions,
  onSortByChange,
  onToggleOrder,
  pageSize,
  onPageSizeChange,
  searchPlaceholder = 'Cauta...',
  filters,
}: Props) {
  return (
    <div className="mb-5 space-y-3">
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-[var(--color-muted)]">Cautare</span>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
          style={{ colorScheme: 'light', backgroundColor: '#fff' }}
        />
      </label>

      {/* right under the search box */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-end">
        <div className="col-span-2 space-y-1.5 sm:col-auto sm:min-w-[11rem] sm:flex-1 sm:max-w-xs">
          <span className="text-xs font-medium text-[var(--color-muted)]">Sorteaza dupa</span>
          <Select
            compact
            value={sortBy}
            onChange={onSortByChange}
            options={sortOptions}
            searchPlaceholder="Cauta sortare..."
            className="w-full"
          />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-medium text-[var(--color-muted)] sm:invisible">
            Ordine
          </span>
          <button
            type="button"
            onClick={onToggleOrder}
            className="flex h-[42px] w-full items-center justify-center rounded-xl border border-[var(--color-line)] bg-white px-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-mist)] sm:w-auto sm:min-w-[5.5rem]"
            title={sortOrder === 'ASC' ? 'Crescator' : 'Descrescator'}
          >
            {sortOrder === 'ASC' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>

        <div className="space-y-1.5 sm:w-28">
          <span className="text-xs font-medium text-[var(--color-muted)]">Pe pagina</span>
          <Select
            compact
            value={String(pageSize)}
            onChange={(v) => onPageSizeChange(Number(v))}
            options={PAGE_SIZES.map((n) => ({ value: n, label: String(n) }))}
            searchPlaceholder="Cauta..."
            className="w-full"
          />
        </div>
      </div>

      {filters ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{filters}</div>
      ) : null}
    </div>
  );
}

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
};

export function PaginationBar({
  page,
  totalPages,
  total,
  onPageChange,
  loading,
}: PaginationProps) {
  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-[var(--color-line)] pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[var(--color-muted)]">
        {loading
          ? 'Se incarca...'
          : `${total} ${total === 1 ? 'rezultat' : 'rezultate'} · pagina ${page}/${totalPages}`}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
          className="rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 font-semibold disabled:opacity-50"
        >
          Inapoi
        </button>
        <button
          type="button"
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(page + 1)}
          className="rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 font-semibold disabled:opacity-50"
        >
          Inainte
        </button>
      </div>
    </div>
  );
}
