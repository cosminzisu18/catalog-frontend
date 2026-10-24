'use client';

import { AbsenceList } from '@/components/absences/AbsenceList';
import { useTeacher } from '@/components/dashboard/TeacherProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';

export default function TeacherAbsencesPage() {
  const { dataVersion, openModal } = useTeacher();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Profesor"
        title="Absente"
        subtitle="Absentele puse de tine. Doar directorul le poate motiva."
        actions={<Button onClick={() => openModal('absence')}>Pune absenta</Button>}
      />
      <Panel>
        <AbsenceList
          path="/absences/mine"
          refreshKey={dataVersion}
          showStudent
          emptyText="Nu ai pus nicio absenta."
        />
      </Panel>
    </div>
  );
}
