export type Teacher = {
  id: number;
  firstName: string;
  lastName: string;
  hoursTaught: number;
  email: string;
  isActive: boolean;
};

export type Student = {
  id: number;
  firstName: string;
  lastName: string;
  classId: number;
  className: string;
  conductGrade: number;
  email: string;
  isActive: boolean;
  birthDate: string | null;
  age: number | null;
};

// "lookup" versions: full lists, but only the fields needed by
// dropdowns and id -> name maps
export type TeacherOption = Omit<Teacher, 'email'>;
export type StudentOption = Omit<Student, 'email' | 'birthDate' | 'age'>;
export type ClassOption = { id: number; name: string };

export type SchoolClass = {
  id: number;
  name: string;
  description: string | null;
  studentCount: number;
};

export type Subject = {
  id: number;
  name: string;
  teacherCount?: number;
};

export type Report = {
  id: number;
  type: string;
  description: string;
  teacherId: number | null;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
};

export type ConductReq = {
  id: number;
  studentId: number;
  teacherId: number;
  proposedGrade: number;
  teacherReason: string;
  studentName: string;
  className: string;
  currentConduct: number;
  teacherName: string;
};

export type GradeEditReq = {
  id: number;
  gradeId: number;
  studentId: number;
  subjectId: number;
  teacherId: number;
  currentValue: number;
  proposedValue: number;
  teacherReason: string;
  studentName: string;
  className: string;
  subjectName: string;
  teacherName: string;
};
