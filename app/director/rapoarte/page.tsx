'use client';

import { useState } from 'react';
import { useDirector } from '@/components/dashboard/DirectorProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { ActivityFeed } from '@/components/ui/ActivityFeed';
import { Panel } from '@/components/ui/Panel';
import { Select } from '@/components/ui/Select';

export default function DirectorReportsPage() {
  const { dataVersion, teachers } = useDirector();
  const [teacherId, setTeacherId] = useState('');

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Director"
        title="Rapoarte"
        subtitle="Istoricul activitatii din scoala (doar citire)"
      />
      <Panel>
        <ActivityFeed
          path="/reports"
          refreshKey={dataVersion}
          extra={{ teacherId: teacherId || undefined }}
          emptyText="Niciun raport pentru filtrele alese."
          filters={
            <div className="w-full space-y-1.5 sm:w-56">
              <span className="text-xs font-medium text-[var(--color-muted)]">
                Profesor
              </span>
              <Select
                compact
                value={teacherId}
                onChange={setTeacherId}
                emptyLabel="Toti profesorii"
                options={teachers.map((t) => ({
                  value: t.id,
                  label: `${t.firstName} ${t.lastName}`,
                }))}
              />
            </div>
          }
        />
      </Panel>
    </div>
  );
}
