import type { Paginated } from './pagination';

export type Absence = {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  subjectId: number;
  subjectName: string;
  teacherName: string;
  // dd-mm-yyyy
  absentOn: string;
  motivated: boolean;
  motivatedReason: string | null;
  motivatedAt: string | null;
};

export type AbsenceSummary = {
  total: number;
  motivated: number;
  unmotivated: number;
};

// totals are for the current filters, before the motivated filter
export type AbsencePage = Paginated<Absence> & { summary: AbsenceSummary };

// values for the status filter: '' = all
export const ABSENCE_STATUS_OPTIONS = [
  { value: 'false', label: 'Nemotivate' },
  { value: 'true', label: 'Motivate' },
];
