'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { buildListQuery, type CursorPage } from '@/lib/pagination';

type Options = {
  path: string;
  limit?: number;
  extra?: Record<string, string | number | boolean | undefined>;
  refreshKey?: number | string;
};

const SEARCH_DEBOUNCE_MS = 300;

type ListState<T> = {
  // the filters these items were loaded for; if they differ from the
  // current ones, the list is reloading
  key: string;
  items: T[];
  nextCursor: string | null;
};

// "load more" list on top of a cursor-paged endpoint
export function useCursorList<T>({
  path,
  limit: initialLimit = 20,
  extra = {},
  refreshKey = 0,
}: Options) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [limit, setLimit] = useState(initialLimit);
  const [reloadCount, setReloadCount] = useState(0);
  const [list, setList] = useState<ListState<T> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  const baseQuery = buildListQuery({ limit, search: debouncedSearch, ...extra });
  const key = `${path}${baseQuery}#${refreshKey}#${reloadCount}`;

  // start again from the first page whenever the filters change
  useEffect(() => {
    let cancelled = false;
    api<CursorPage<T>>(`${path}${baseQuery}`)
      .then((page) => {
        if (!cancelled) {
          setList({ key, items: page.items, nextCursor: page.nextCursor });
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        toast.error(err instanceof Error ? err.message : 'Eroare la incarcare');
        setList({ key, items: [], nextCursor: null });
      });
    return () => {
      cancelled = true;
    };
  }, [path, baseQuery, key, toast]);

  const current = list?.key === key ? list : null;

  const loadMore = useCallback(async () => {
    if (!current?.nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const sep = baseQuery ? '&' : '?';
      const page = await api<CursorPage<T>>(
        `${path}${baseQuery}${sep}cursor=${encodeURIComponent(current.nextCursor)}`,
      );
      // if the filters changed meanwhile, this page is no longer relevant
      setList((prev) =>
        prev?.key === key
          ? {
              key,
              items: [...prev.items, ...page.items],
              nextCursor: page.nextCursor,
            }
          : prev,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Eroare la incarcare');
    } finally {
      setLoadingMore(false);
    }
  }, [current, loadingMore, baseQuery, path, key, toast]);

  return {
    items: current?.items ?? [],
    nextCursor: current?.nextCursor ?? null,
    search,
    limit,
    loading: current === null,
    loadingMore,
    onSearchChange: setSearch,
    onLimitChange: setLimit,
    loadMore,
    reload: useCallback(() => setReloadCount((n) => n + 1), []),
  };
}
