'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  buildListQuery,
  type ListQuery,
  type Paginated,
} from '@/lib/pagination';
import { useToast } from '@/components/ui/Toast';

type Options = {
  path: string;
  initialSortBy?: string;
  initialSortOrder?: 'ASC' | 'DESC';
  pageSize?: number;
  extra?: Record<string, string | number | boolean | undefined>;
  refreshKey?: number | string;
  enabled?: boolean;
};

const SEARCH_DEBOUNCE_MS = 300;

// R can be a bigger response, e.g. a page that also carries totals
export function usePaginatedList<T, R extends Paginated<T> = Paginated<T>>({
  path,
  initialSortBy = 'id',
  initialSortOrder = 'ASC',
  pageSize: initialPageSize = 10,
  extra = {},
  refreshKey = 0,
  enabled = true,
}: Options) {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>(initialSortOrder);
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    data: R | null;
  } | null>(null);

  // one request when typing pauses, not one per letter
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  const query: ListQuery = {
    page,
    pageSize,
    search: debouncedSearch,
    sortBy,
    sortOrder,
    ...extra,
  };
  const url = `${path}${buildListQuery(query)}`;
  const requestKey = `${url}#${refreshKey}#${reloadCount}`;

  useEffect(() => {
    if (!enabled) return;
    // ignore the answer of an outdated request (page/filter changed meanwhile)
    let cancelled = false;
    api<R>(url)
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        toast.error(err instanceof Error ? err.message : 'Eroare la incarcare');
        setResult((prev) => ({ key: requestKey, data: prev?.data ?? null }));
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, url, requestKey, toast]);

  const data = result?.data;
  const loading = enabled && result?.key !== requestKey;

  function onSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function onSortChange(nextSortBy: string) {
    if (sortBy === nextSortBy) {
      setSortOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(nextSortBy);
      setSortOrder('ASC');
    }
    setPage(1);
  }

  function onPageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
  }

  const reload = useCallback(() => setReloadCount((n) => n + 1), []);

  return {
    response: data ?? null,
    items: data?.items ?? [],
    total: data?.total ?? 0,
    page,
    pageSize,
    totalPages: data?.totalPages ?? 1,
    search,
    sortBy,
    sortOrder,
    loading,
    setPage,
    onSearchChange,
    onSortChange,
    onPageSizeChange,
    reload,
  };
}

export type PaginatedList<T> = ReturnType<typeof usePaginatedList<T>>;
