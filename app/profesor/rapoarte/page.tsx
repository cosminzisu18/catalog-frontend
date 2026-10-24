'use client';

import { useTeacher } from '@/components/dashboard/TeacherProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { ActivityFeed } from '@/components/ui/ActivityFeed';
import { Panel } from '@/components/ui/Panel';

export default function TeacherReportsPage() {
  const { dataVersion } = useTeacher();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Profesor"
        title="Rapoarte"
        subtitle="Istoricul activitatii tale"
      />
      <Panel>
        <ActivityFeed path="/reports/mine" refreshKey={dataVersion} />
      </Panel>
    </div>
  );
}
