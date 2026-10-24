'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLoad } from '@/hooks/useLoad';
import { api } from '@/lib/api';
import type { Paginated } from '@/lib/pagination';
import { AbsenceFormModal } from './teacher/AbsenceFormModal';
import { ConductRequestModal } from './teacher/ConductRequestModal';
import { GradeEditRequestModal } from './teacher/GradeEditRequestModal';
import { GradeFormModal } from './teacher/GradeFormModal';
import { HoursModal } from './teacher/HoursModal';
import type { Grade, Report, Student, Subject, Teacher } from './teacher/types';

export type * from './teacher/types';

type TeacherData = {
  me: Teacher | null;
  subjects: Subject[];
  students: Student[];
  recentGrades: Grade[];
  gradeTotal: number;
  recentReports: Report[];
};

const EMPTY_DATA: TeacherData = {
  me: null,
  subjects: [],
  students: [],
  recentGrades: [],
  gradeTotal: 0,
  recentReports: [],
};

async function fetchTeacherData(): Promise<TeacherData> {
  const [me, subjects, students, grades, reports] = await Promise.all([
    api<Teacher>('/teachers/me'),
    api<Subject[]>('/subjects/lookup'),
    // only students from classes where this teacher has lessons
    api<Student[]>('/students/lookup'),
    api<Paginated<Grade>>(
      '/grades/mine?pageSize=6&sortBy=gradedOn&sortOrder=DESC',
    ),
    api<{ items: Report[] }>('/reports/mine?limit=5'),
  ]);
  return {
    me,
    subjects,
    students,
    recentGrades: grades.items,
    gradeTotal: grades.total,
    recentReports: reports.items,
  };
}

type OpenModal =
  | { id: 'grade' | 'absence' | 'hours' | 'conduct' }
  | { id: 'requestEdit'; gradeId: number; currentValue: number }
  | null;

type TeacherContextValue = TeacherData & {
  dataVersion: number;
  studentMap: Map<number, Student>;
  subjectMap: Map<number, Subject>;
  openModal: (id: 'grade' | 'absence' | 'hours' | 'conduct') => void;
  openGradeEditRequest: (grade: Grade) => void;
};

const TeacherContext = createContext<TeacherContextValue | null>(null);

export function useTeacher() {
  const ctx = useContext(TeacherContext);
  if (!ctx) throw new Error('useTeacher must be used in TeacherProvider');
  return ctx;
}

export function TeacherProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<OpenModal>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const data = useLoad(fetchTeacherData, dataVersion).data ?? EMPTY_DATA;

  const openModal = useCallback(
    (id: 'grade' | 'absence' | 'hours' | 'conduct') => setModal({ id }),
    [],
  );

  const openGradeEditRequest = useCallback(
    (grade: Grade) =>
      setModal({
        id: 'requestEdit',
        gradeId: grade.id,
        currentValue: Number(grade.value),
      }),
    [],
  );

  const closeModal = useCallback(() => setModal(null), []);

  const onSaved = useCallback(() => {
    setModal(null);
    setDataVersion((v) => v + 1);
  }, []);

  const { subjects, students } = data;

  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s])),
    [students],
  );
  const subjectMap = useMemo(
    () => new Map(subjects.map((s) => [s.id, s])),
    [subjects],
  );

  const value = useMemo(
    () => ({
      ...data,
      dataVersion,
      studentMap,
      subjectMap,
      openModal,
      openGradeEditRequest,
    }),
    [data, dataVersion, studentMap, subjectMap, openModal, openGradeEditRequest],
  );

  return (
    <TeacherContext.Provider value={value}>
      {children}

      {modal?.id === 'grade' ? (
        <GradeFormModal
          subjects={subjects}
          students={students}
          onClose={closeModal}
          onSaved={onSaved}
        />
      ) : null}

      {modal?.id === 'absence' ? (
        <AbsenceFormModal
          subjects={subjects}
          students={students}
          onClose={closeModal}
          onSaved={onSaved}
        />
      ) : null}

      {modal?.id === 'requestEdit' ? (
        <GradeEditRequestModal
          gradeId={modal.gradeId}
          currentValue={modal.currentValue}
          onClose={closeModal}
          onSaved={onSaved}
        />
      ) : null}

      {modal?.id === 'hours' ? (
        <HoursModal onClose={closeModal} onSaved={onSaved} />
      ) : null}

      {modal?.id === 'conduct' ? (
        <ConductRequestModal
          students={students}
          onClose={closeModal}
          onSaved={onSaved}
        />
      ) : null}
    </TeacherContext.Provider>
  );
}
