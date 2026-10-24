'use client';

import type { ReactNode } from 'react';
import { ActivityHistory, type ActivityReport } from '@/components/ui/ActivityHistory';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useCursorList } from '@/hooks/useCursorList';
import { PAGE_SIZES } from '@/lib/pagination';

// append-only history with cursor paging (no OFFSET)
export function ActivityFeed({
  path,
  extra,
  refreshKey,
  emptyText,
  filters,
}: {
  path: string;
  extra?: Record<string, string | number | undefined>;
  refreshKey?: number;
  emptyText?: string;
  // extra controls shown next to the search box
  filters?: ReactNode;
}) {
  const list = useCursorList<ActivityReport>({
    path,
    limit: 20,
    extra,
    refreshKey,
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-end">
        <label className="block min-w-0 flex-1 space-y-1.5">
          <span className="text-xs font-medium text-[var(--color-muted)]">
            Cautare
          </span>
          <input
            type="search"
            value={list.search}
            onChange={(e) => list.onSearchChange(e.target.value)}
            placeholder="Cauta in descriere..."
            className="w-full rounded-xl border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
            style={{ colorScheme: 'light', backgroundColor: '#fff' }}
          />
        </label>
        {filters}
        <div className="w-full space-y-1.5 sm:w-28">
          <span className="text-xs font-medium text-[var(--color-muted)]">
            Pe pagina
          </span>
          <Select
            compact
            value={list.limit}
            onChange={(v) => list.onLimitChange(Number(v))}
            options={PAGE_SIZES.map((n) => ({ value: n, label: String(n) }))}
          />
        </div>
      </div>

      <ActivityHistory
        reports={list.items}
        limit={list.items.length || 1}
        emptyText={list.loading ? 'Se incarca...' : emptyText}
      />

      {list.nextCursor ? (
        <div className="flex justify-center pt-1">
          <Button
            variant="secondary"
            loading={list.loadingMore}
            onClick={list.loadMore}
          >
            Incarca mai multe
          </Button>
        </div>
      ) : null}
    </div>
  );
}
