'use client';

import type { ReactNode } from 'react';

export type DataColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  // main title on the mobile card
  primary?: boolean;
  className?: string;
  hideOnMobile?: boolean;
};

type Props<T> = {
  columns: DataColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  emptyText?: string;
  loading?: boolean;
  // row actions (desktop + mobile)
  actions?: (row: T) => ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyText = 'Niciun rezultat.',
  loading,
  actions,
}: Props<T>) {
  const primaryCol = columns.find((c) => c.primary) ?? columns[0];
  const secondaryCols = columns.filter(
    (c) => c !== primaryCol && !c.hideOnMobile,
  );

  if (!loading && rows.length === 0) {
    return (
      <p className="rounded-xl bg-[var(--color-mist)] px-4 py-6 text-center text-sm text-[var(--color-muted)]">
        {emptyText}
      </p>
    );
  }

  return (
    <>
      {/* mobile: cards */}
      <ul className="space-y-2 md:hidden">
        {rows.map((row) => (
          <li
            key={rowKey(row)}
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-mist)]/60 px-3.5 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[var(--color-ink)]">
                  {primaryCol?.cell(row)}
                </p>
                <dl className="mt-2 grid gap-1.5 text-sm">
                  {secondaryCols.map((col) => (
                    <div key={col.key} className="flex justify-between gap-3">
                      <dt className="text-[var(--color-muted)]">{col.header}</dt>
                      <dd className="text-right font-medium text-[var(--color-ink)]">
                        {col.cell(row)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              {actions ? (
                <div className="shrink-0 self-center">{actions(row)}</div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {/* desktop: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-[var(--color-muted)]">
              {columns.map((col) => (
                <th key={col.key} className={`py-2.5 pr-3 font-medium ${col.className ?? ''}`}>
                  {col.header}
                </th>
              ))}
              {actions ? <th className="py-2.5 font-medium">Actiuni</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-[var(--color-line)]/70 last:border-0"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`py-3 pr-3 ${col.className ?? ''}`}>
                    {col.cell(row)}
                  </td>
                ))}
                {actions ? (
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">{actions(row)}</div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
