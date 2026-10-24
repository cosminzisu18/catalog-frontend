'use client';

import { useParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import {
  useDirector,
  type Teacher,
} from '@/components/dashboard/DirectorProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { ActivityFeed } from '@/components/ui/ActivityFeed';
import {
  ActionIcon,
  BackLink,
  IconBook,
  IconEdit,
} from '@/components/ui/ActionIcon';
import { InfoList } from '@/components/ui/InfoList';
import { Panel } from '@/components/ui/Panel';
import { ActiveBadge } from '@/components/ui/StatusBadge';
import { LoadingText } from '@/components/ui/LoadingText';
import { useLoad } from '@/hooks/useLoad';
import { api } from '@/lib/api';
import { fullName } from '@/lib/format';
import type { TimetableSlot } from '@/lib/timetable';

export default function DirectorTeacherDetailPage() {
  return (
    <Suspense fallback={<LoadingText />}>
      <TeacherDetail />
    </Suspense>
  );
}

function TeacherDetail() {
  const { id } = useParams<{ id: string }>();
  const teacherId = Number(id);
  const { subjects, subjectMap, dataVersion, openEditTeacher, openTeacherSubjects } =
    useDirector();

  const details = useLoad(async () => {
    const [teacher, slots, subjectIds] = await Promise.all([
      api<Teacher>(`/teachers/${teacherId}`),
      api<TimetableSlot[]>(`/timetable?teacherId=${teacherId}`),
      api<number[]>(`/subjects/teacher/${teacherId}`),
    ]);
    return { teacher, slots, subjectIds };
  }, `${teacherId}#${dataVersion}`).data;

  const teacherSubjects = useMemo(
    () => subjects.filter((s) => details?.subjectIds.includes(s.id)),
    [subjects, details],
  );

  if (!details) return <LoadingText />;
  const { teacher, slots } = details;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <BackLink href="/director/profesori" />
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow="Profesor"
            title={fullName(teacher)}
            actions={
              <div className="flex flex-wrap gap-1.5">
                <ActionIcon
                  label="Materii"
                  onClick={() => void openTeacherSubjects(teacherId)}
                >
                  <IconBook />
                </ActionIcon>
                <ActionIcon
                  label="Modifica"
                  onClick={() => openEditTeacher(teacher)}
                >
                  <IconEdit />
                </ActionIcon>
              </div>
            }
          />
        </div>
      </div>

      <Panel title="Date profesor">
        <InfoList
          columns={3}
          items={[
            { label: 'Email', value: teacher.email },
            { label: 'Ore predate', value: Number(teacher.hoursTaught) },
            { label: 'Status', value: <ActiveBadge isActive={teacher.isActive} /> },
          ]}
        />
      </Panel>

      <Panel title="Materii predate">
        {teacherSubjects.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">Nicio materie alocata.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {teacherSubjects.map((s) => (
              <li
                key={s.id}
                className="rounded-full bg-[var(--color-mist)] px-3 py-1 text-sm font-medium"
              >
                {s.name}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Orar">
        <TimetableGrid slots={slots} subjectMap={subjectMap} showClass />
      </Panel>

      <Panel title="Activitate">
        <ActivityFeed
          path="/reports"
          extra={{ teacherId }}
          refreshKey={dataVersion}
        />
      </Panel>
    </div>
  );
}
