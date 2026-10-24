export type SubjectAverage = {
  subjectId: number;
  subjectName: string;
  gradeCount: number;
  average: number | null;
  thesis: number | null;
  final: number | null;
};

export type RankedStudent = {
  studentId: number;
  firstName: string;
  lastName: string;
  classId: number;
  className: string;
  conductGrade: number;
  generalAverage: number | null;
};

export type StudentStats = RankedStudent & {
  subjects: SubjectAverage[];
  classAverage: number | null;
  classRank: number | null;
  classSize: number;
};

export type ClassSummary = {
  classId: number;
  className: string;
  studentCount: number;
  average: number | null;
  best: RankedStudent | null;
};

export type ClassesOverview = {
  classes: ClassSummary[];
  topStudents: RankedStudent[];
};

export type ClassDetail = {
  classId: number;
  className: string;
  average: number | null;
  students: RankedStudent[];
  subjects: {
    subjectId: number;
    subjectName: string;
    average: number | null;
    studentCount: number;
  }[];
};

export function formatAverage(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : value.toFixed(2);
}
