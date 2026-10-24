'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { useAction } from '@/hooks/useAction';
import { useLoad } from '@/hooks/useLoad';
import { api } from '@/lib/api';
import type { Paginated } from '@/lib/pagination';
import type { Absence } from '@/lib/absences';
import { DecisionModal } from './director/DecisionModal';
import { MotivateAbsenceModal } from './director/MotivateAbsenceModal';
import { StudentFormModal } from './director/StudentFormModal';
import { SubjectFormModal } from './director/SubjectFormModal';
import { TeacherFormModal } from './director/TeacherFormModal';
import { TeacherSubjectsModal } from './director/TeacherSubjectsModal';
import type {
  ClassOption,
  ConductReq,
  GradeEditReq,
  Report,
  Student,
  StudentOption,
  Subject,
  Teacher,
  TeacherOption,
} from './director/types';

export type * from './director/types';

type DirectorData = {
  teachers: TeacherOption[];
  students: StudentOption[];
  classes: ClassOption[];
  subjects: Subject[];
  recentReports: Report[];
  pending: ConductReq[];
  pendingConductTotal: number;
  pendingGradeEditTotal: number;
};

const EMPTY_DATA: DirectorData = {
  teachers: [],
  students: [],
  classes: [],
  subjects: [],
  recentReports: [],
  pending: [],
  pendingConductTotal: 0,
  pendingGradeEditTotal: 0,
};

// long lists are paged inside each page; here we load only what the
// selects, badges and home dashboard need
async function fetchDirectorData(): Promise<DirectorData> {
  const [teachers, students, subjects, classes, reports, conduct, gradeEdits] =
    await Promise.all([
      api<TeacherOption[]>('/teachers/lookup'),
      api<StudentOption[]>('/students/lookup'),
      api<Subject[]>('/subjects/lookup'),
      api<ClassOption[]>('/classes/lookup'),
      api<{ items: Report[] }>('/reports?limit=8'),
      api<Paginated<ConductReq>>('/conduct/pending?pageSize=5'),
      api<Paginated<GradeEditReq>>('/grades/edit-requests/pending?pageSize=1'),
    ]);

  return {
    teachers,
    students,
    classes,
    subjects,
    recentReports: reports.items,
    pending: conduct.items,
    pendingConductTotal: conduct.total,
    pendingGradeEditTotal: gradeEdits.total,
  };
}

type OpenModal =
  | { id: 'teacher'; teacher: Teacher | null }
  | { id: 'student'; student: Student | null }
  | { id: 'subject' }
  | { id: 'teacherSubjects'; teacherId: number; subjectIds: number[] }
  | { id: 'conduct'; request: ConductReq }
  | { id: 'gradeEdit'; request: GradeEditReq }
  | { id: 'motivate'; absence: Absence }
  | null;

type DirectorContextValue = DirectorData & {
  dataVersion: number;
  reload: () => void;
  // false (with a message) for an inactive director
  canEdit: () => boolean;
  openModal: (id: 'teacher' | 'student' | 'subject') => void;
  openEditTeacher: (teacher: Teacher) => void;
  openEditStudent: (student: Student) => void;
  openTeacherSubjects: (teacherId: number) => Promise<void>;
  openConductDecision: (request: ConductReq) => void;
  openGradeEditDecision: (request: GradeEditReq) => void;
  openAbsenceMotivation: (absence: Absence) => void;
  setTeacherActive: (id: number, isActive: boolean) => Promise<void>;
  setStudentActive: (id: number, isActive: boolean) => Promise<void>;
  removeTeacher: (id: number) => Promise<void>;
  removeStudent: (id: number) => Promise<void>;
  removeSubject: (id: number) => Promise<void>;
  studentMap: Map<number, StudentOption>;
  teacherMap: Map<number, TeacherOption>;
  subjectMap: Map<number, Subject>;
  schoolSlug: string;
};

const DirectorContext = createContext<DirectorContextValue | null>(null);

export function useDirector() {
  const ctx = useContext(DirectorContext);
  if (!ctx) throw new Error('useDirector must be used in DirectorProvider');
  return ctx;
}

export function DirectorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const { run } = useAction();
  const [modal, setModal] = useState<OpenModal>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const data = useLoad(fetchDirectorData, dataVersion).data ?? EMPTY_DATA;

  // dataVersion goes up after every change, so the provider and the
  // paged lists reload together
  const reload = useCallback(() => setDataVersion((v) => v + 1), []);

  const canEdit = useCallback(() => {
    if (user?.role === 'DIRECTOR' && !user.isActiveDirector) {
      toast.error('Doar directorul activ poate face aceasta actiune');
      return false;
    }
    return true;
  }, [toast, user]);

  // every modal is opened through here, so an inactive director gets
  // the message instead of a form that would fail on save
  const open = useCallback(
    (next: Exclude<OpenModal, null>) => {
      if (canEdit()) setModal(next);
    },
    [canEdit],
  );

  const openModal = useCallback(
    (id: 'teacher' | 'student' | 'subject') => {
      if (id === 'teacher') open({ id, teacher: null });
      else if (id === 'student') open({ id, student: null });
      else open({ id });
    },
    [open],
  );

  const openEditTeacher = useCallback(
    (teacher: Teacher) => open({ id: 'teacher', teacher }),
    [open],
  );

  const openEditStudent = useCallback(
    (student: Student) => open({ id: 'student', student }),
    [open],
  );

  const openConductDecision = useCallback(
    (request: ConductReq) => open({ id: 'conduct', request }),
    [open],
  );

  const openGradeEditDecision = useCallback(
    (request: GradeEditReq) => open({ id: 'gradeEdit', request }),
    [open],
  );

  const openAbsenceMotivation = useCallback(
    (absence: Absence) => open({ id: 'motivate', absence }),
    [open],
  );

  const openTeacherSubjects = useCallback(
    async (teacherId: number) => {
      if (!canEdit()) return;
      try {
        const subjectIds = await api<number[]>(`/subjects/teacher/${teacherId}`);
        setModal({ id: 'teacherSubjects', teacherId, subjectIds });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Eroare');
      }
    },
    [canEdit, toast],
  );

  const closeModal = useCallback(() => setModal(null), []);

  const onSaved = useCallback(() => {
    setModal(null);
    reload();
  }, [reload]);

  // table actions (activate, delete): request -> message -> reload
  const rowAction = useCallback(
    async (request: () => Promise<unknown>, successMessage: string) => {
      if (!canEdit()) return;
      if (await run(request, successMessage)) reload();
    },
    [canEdit, run, reload],
  );

  const removeSubject = useCallback(
    (id: number) =>
      rowAction(
        () => api(`/subjects/${id}`, { method: 'DELETE' }),
        'Materie stearsa',
      ),
    [rowAction],
  );

  const setTeacherActive = useCallback(
    (id: number, isActive: boolean) =>
      rowAction(
        () =>
          api(`/teachers/${id}/active`, {
            method: 'PATCH',
            body: JSON.stringify({ isActive }),
          }),
        isActive ? 'Profesor activat' : 'Profesor dezactivat',
      ),
    [rowAction],
  );

  const setStudentActive = useCallback(
    (id: number, isActive: boolean) =>
      rowAction(
        () =>
          api(`/students/${id}/active`, {
            method: 'PATCH',
            body: JSON.stringify({ isActive }),
          }),
        isActive ? 'Elev activat' : 'Elev dezactivat',
      ),
    [rowAction],
  );

  const removeTeacher = useCallback(
    (id: number) =>
      rowAction(
        () => api(`/teachers/${id}`, { method: 'DELETE' }),
        'Profesor sters',
      ),
    [rowAction],
  );

  const removeStudent = useCallback(
    (id: number) =>
      rowAction(
        () => api(`/students/${id}`, { method: 'DELETE' }),
        'Elev sters',
      ),
    [rowAction],
  );

  const { teachers, students, subjects, classes } = data;

  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s])),
    [students],
  );
  const teacherMap = useMemo(
    () => new Map(teachers.map((t) => [t.id, t])),
    [teachers],
  );
  const subjectMap = useMemo(
    () => new Map(subjects.map((s) => [s.id, s])),
    [subjects],
  );

  const schoolSlug = user?.schoolSlug || 'slug';

  const value = useMemo(
    () => ({
      ...data,
      dataVersion,
      reload,
      canEdit,
      openModal,
      openEditTeacher,
      openEditStudent,
      openTeacherSubjects,
      openConductDecision,
      openGradeEditDecision,
      openAbsenceMotivation,
      setTeacherActive,
      setStudentActive,
      removeTeacher,
      removeStudent,
      removeSubject,
      studentMap,
      teacherMap,
      subjectMap,
      schoolSlug,
    }),
    [
      data,
      dataVersion,
      reload,
      canEdit,
      openModal,
      openEditTeacher,
      openEditStudent,
      openTeacherSubjects,
      openConductDecision,
      openGradeEditDecision,
      openAbsenceMotivation,
      setTeacherActive,
      setStudentActive,
      removeTeacher,
      removeStudent,
      removeSubject,
      studentMap,
      teacherMap,
      subjectMap,
      schoolSlug,
    ],
  );

  return (
    <DirectorContext.Provider value={value}>
      {children}

      {modal?.id === 'teacher' ? (
        <TeacherFormModal
          teacher={modal.teacher}
          onClose={closeModal}
          onSaved={onSaved}
        />
      ) : null}

      {modal?.id === 'student' ? (
        <StudentFormModal
          student={modal.student}
          classes={classes}
          onClose={closeModal}
          onSaved={onSaved}
        />
      ) : null}

      {modal?.id === 'subject' ? (
        <SubjectFormModal onClose={closeModal} onSaved={onSaved} />
      ) : null}

      {modal?.id === 'teacherSubjects' ? (
        <TeacherSubjectsModal
          teacherId={modal.teacherId}
          initialSubjectIds={modal.subjectIds}
          subjects={subjects}
          onClose={closeModal}
          onSaved={onSaved}
        />
      ) : null}

      {modal?.id === 'conduct' ? (
        <DecisionModal
          title="Decide cererea de purtare"
          subtitle={`Nota propusa: ${Number(modal.request.proposedGrade)}`}
          teacherReason={modal.request.teacherReason}
          decideUrl={`/conduct/${modal.request.id}/decide`}
          messages={{ approved: 'Cerere aprobata', rejected: 'Cerere respinsa' }}
          onClose={closeModal}
          onSaved={onSaved}
        />
      ) : null}

      {modal?.id === 'gradeEdit' ? (
        <DecisionModal
          title="Decide editarea notei"
          subtitle={`${Number(modal.request.currentValue)} → ${Number(modal.request.proposedValue)}`}
          teacherReason={modal.request.teacherReason}
          decideUrl={`/grades/edit-requests/${modal.request.id}/decide`}
          approveLabel="Aproba editarea"
          messages={{
            approved: 'Editare nota aprobata',
            rejected: 'Cerere editare respinsa',
          }}
          onClose={closeModal}
          onSaved={onSaved}
        />
      ) : null}

      {modal?.id === 'motivate' ? (
        <MotivateAbsenceModal
          absence={modal.absence}
          onClose={closeModal}
          onSaved={onSaved}
        />
      ) : null}
    </DirectorContext.Provider>
  );
}
