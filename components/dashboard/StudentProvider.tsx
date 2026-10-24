'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLoad } from '@/hooks/useLoad';
import { api } from '@/lib/api';
import type { Paginated } from '@/lib/pagination';
import type { AbsencePage, AbsenceSummary } from '@/lib/absences';
import type { StudentStats } from '@/lib/stats';

export type Student = {
  id: number;
  firstName: string;
  lastName: string;
  className: string;
  conductGrade: number;
  // computed on the server over all grades, not just the current page
  average: string | null;
  gradeCount: number;
};

export type Grade = {
  id: number;
  subjectId: number;
  subjectName: string;
  value: number;
  type: 'NORMAL' | 'THESIS';
  gradedOn: string;
};

export type Subject = { id: number; name: string };

export type ConductHistoryItem = {
  id: number;
  proposedGrade: number;
  teacherReason: string;
  teacherName: string;
  directorReason: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type StudentData = {
  me: Student | null;
  recentGrades: Grade[];
  subjects: Subject[];
  conductHistory: ConductHistoryItem[];
  stats: StudentStats | null;
  absences: AbsenceSummary | null;
};

type StudentContextValue = StudentData & {
  subjectMap: Map<number, Subject>;
};

const StudentContext = createContext<StudentContextValue | null>(null);

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudent must be used in StudentProvider');
  return ctx;
}

async function fetchStudentData(): Promise<StudentData> {
  const [me, grades, subjects, conduct, stats, absences] = await Promise.all([
    api<Student>('/students/me'),
    api<Paginated<Grade>>(
      '/grades/my-grades?pageSize=6&sortBy=gradedOn&sortOrder=DESC',
    ),
    api<Subject[]>('/subjects/lookup'),
    api<Paginated<ConductHistoryItem>>(
      '/conduct/my-history?pageSize=20&sortBy=createdAt&sortOrder=DESC',
    ),
    api<StudentStats>('/stats/me'),
    api<AbsencePage>('/absences/me?pageSize=1'),
  ]);
  return {
    me,
    recentGrades: grades.items,
    subjects,
    conductHistory: conduct.items,
    stats,
    absences: absences.summary,
  };
}

const EMPTY_DATA: StudentData = {
  me: null,
  recentGrades: [],
  subjects: [],
  conductHistory: [],
  stats: null,
  absences: null,
};

export function StudentProvider({ children }: { children: ReactNode }) {
  const data = useLoad(fetchStudentData, 'student').data ?? EMPTY_DATA;
  const subjectMap = useMemo(
    () => new Map(data.subjects.map((s) => [s.id, s])),
    [data.subjects],
  );

  const value = useMemo(() => ({ ...data, subjectMap }), [data, subjectMap]);

  return (
    <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
  );
}
