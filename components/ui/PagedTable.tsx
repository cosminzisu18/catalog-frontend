'use client';

import type { ReactNode } from 'react';
import { DataTable, type DataColumn } from '@/components/ui/DataTable';
import { ListControls, PaginationBar } from '@/components/ui/ListControls';
import type { PaginatedList } from '@/hooks/usePaginatedList';

type Props<T> = {
  list: PaginatedList<T>;
  columns: DataColumn<T>[];
  rowKey: (row: T) => string | number;
  sortOptions: { value: string; label: string }[];
  searchPlaceholder?: string;
  filters?: ReactNode;
  emptyText?: string;
  actions?: (row: T) => ReactNode;
};

// search, sorting, the table and paging for a list from usePaginatedList
export function PagedTable<T>({
  list,
  columns,
  rowKey,
  sortOptions,
  searchPlaceholder,
  filters,
  emptyText,
  actions,
}: Props<T>) {
  return (
    <>
      <ListControls
        search={list.search}
        onSearchChange={list.onSearchChange}
        sortBy={list.sortBy}
        sortOrder={list.sortOrder}
        sortOptions={sortOptions}
        onSortByChange={list.onSortChange}
        onToggleOrder={() => list.onSortChange(list.sortBy)}
        pageSize={list.pageSize}
        onPageSizeChange={list.onPageSizeChange}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
      />

      <DataTable
        columns={columns}
        rows={list.items}
        rowKey={rowKey}
        loading={list.loading}
        emptyText={emptyText}
        actions={actions}
      />

      <PaginationBar
        page={list.page}
        totalPages={list.totalPages}
        total={list.total}
        loading={list.loading}
        onPageChange={list.setPage}
      />
    </>
  );
}
