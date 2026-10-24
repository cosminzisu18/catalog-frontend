import type { ActivityReport } from '@/components/ui/ActivityHistory';

export type Teacher = {
  id: number;
  firstName: string;
  lastName: string;
  hoursTaught: number;
};

export type Subject = { id: number; name: string };

export type Student = {
  id: number;
  firstName: string;
  lastName: string;
  className: string;
  conductGrade: number;
};

export type GradeType = 'NORMAL' | 'THESIS';

export type Grade = {
  id: number;
  studentId: number;
  subjectId: number;
  value: number;
  type: GradeType;
  gradedOn: string;
  studentName: string;
  className: string;
  subjectName: string;
};

export type Report = ActivityReport;
