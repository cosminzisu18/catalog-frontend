// stable color per subjectId: same subject = same color everywhere
const PALETTE = [
  { bg: '#ccfbf1', border: '#0f766e', text: '#134e4a' }, // teal
  { bg: '#ffedd5', border: '#c2410c', text: '#7c2d12' }, // orange
  { bg: '#dbeafe', border: '#1d4ed8', text: '#1e3a8a' }, // blue
  { bg: '#fce7f3', border: '#be185d', text: '#831843' }, // pink
  { bg: '#ede9fe', border: '#6d28d9', text: '#4c1d95' }, // violet
  { bg: '#ecfccb', border: '#4d7c0f', text: '#365314' }, // lime
  { bg: '#fef3c7', border: '#b45309', text: '#78350f' }, // amber
  { bg: '#e0e7ff', border: '#4338ca', text: '#312e81' }, // indigo
  { bg: '#cffafe', border: '#0e7490', text: '#164e63' }, // cyan
  { bg: '#fee2e2', border: '#b91c1c', text: '#7f1d1d' }, // red
] as const;

export type SubjectColor = (typeof PALETTE)[number];

export function subjectColor(subjectId: number): SubjectColor {
  const idx = Math.abs(Number(subjectId) || 0) % PALETTE.length;
  return PALETTE[idx];
}
