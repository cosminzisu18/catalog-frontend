export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// cursor response (reports): no OFFSET / COUNT
export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
};

export type ListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: string | number | boolean | undefined;
};

export function buildListQuery(params: ListQuery): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export const PAGE_SIZES = [5, 10, 20, 50] as const;
