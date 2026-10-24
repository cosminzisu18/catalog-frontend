// formats a grade (may come as a string from a DB decimal)
export function formatGrade(value: number | string): string {
  const n = Number(value);
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, '');
}

export function fullName(person?: { firstName: string; lastName: string } | null) {
  return person ? `${person.firstName} ${person.lastName}` : '—';
}

// calendar date as dd-mm-yyyy
export function formatDateDdMmYyyy(value?: string | Date | null): string {
  const d = value instanceof Date ? value : value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// month and year, e.g. "octombrie 2026"
export function formatMonthYear(value?: Date | null): string {
  const d = value ?? new Date();
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' });
}

export function gradeText(value: number | string, type?: string): string {
  const text = formatGrade(value);
  return type === 'THESIS' ? `${text} (teza)` : text;
}
