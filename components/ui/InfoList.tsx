import type { ReactNode } from 'react';

type Item = { label: string; value: ReactNode };

// tailwind needs the full class names, so they are listed here
const COLUMNS = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
};

// label / value pairs; falsy items are skipped, so optional rows can be
// written inline with &&
export function InfoList({
  items,
  columns = 2,
}: {
  items: (Item | false | null | undefined | '')[];
  columns?: keyof typeof COLUMNS;
}) {
  return (
    <dl className={`grid gap-3 text-sm ${COLUMNS[columns]}`}>
      {items.filter(Boolean).map((item) => {
        const { label, value } = item as Item;
        return (
          <div key={label}>
            <dt className="text-[var(--color-muted)]">{label}</dt>
            <dd className="mt-0.5 font-semibold text-[var(--color-ink)]">{value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
