type Props = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ label, value, hint }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white/90 p-4 shadow-[0_10px_30px_rgba(15,40,60,0.04)]">
      <p className="text-xs font-medium text-[var(--color-muted)]">{label}</p>
      <p className="mt-1 font-display text-3xl text-[var(--color-ink)]">{value}</p>
      {hint ? (
        <p className="mt-1 text-xs text-[var(--color-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
