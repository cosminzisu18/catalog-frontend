'use client';

import { AbsenceList } from '@/components/absences/AbsenceList';
import { PageHeader } from '@/components/layout/PageHeader';
import { Panel } from '@/components/ui/Panel';

export default function StudentAbsencesPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Elev"
        title="Absentele mele"
        subtitle="Absentele se motiveaza de catre director."
      />
      <Panel>
        <AbsenceList
          path="/absences/me"
          showTeacher
          emptyText="Nu ai nicio absenta."
        />
      </Panel>
    </div>
  );
}
