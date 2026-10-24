'use client';

import { AbsenceList } from '@/components/absences/AbsenceList';
import { useDirector } from '@/components/dashboard/DirectorProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { Panel } from '@/components/ui/Panel';

export default function DirectorAbsencesPage() {
  const { dataVersion, classes, openAbsenceMotivation } = useDirector();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Director"
        title="Absente"
        subtitle="Absentele puse de profesori. Doar tu le poti motiva."
      />
      <Panel>
        <AbsenceList
          path="/absences"
          refreshKey={dataVersion}
          showStudent
          showTeacher
          classes={classes}
          onMotivate={openAbsenceMotivation}
          emptyText="Nicio absenta pentru filtrele alese."
        />
      </Panel>
    </div>
  );
}
