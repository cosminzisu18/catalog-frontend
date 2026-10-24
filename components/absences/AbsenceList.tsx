'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { DataColumn } from '@/components/ui/DataTable';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { AbsenceBadge } from '@/components/ui/StatusBadge';
import { PagedTable } from '@/components/ui/PagedTable';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import {
  ABSENCE_STATUS_OPTIONS,
  type Absence,
  type AbsencePage,
} from '@/lib/absences';

const SORT_OPTIONS = [
  { value: 'absentOn', label: 'Data' },
  { value: 'studentName', label: 'Elev' },
  { value: 'subjectName', label: 'Materie' },
];

type Props = {
  path: string;
  extra?: Record<string, string | number | undefined>;
  refreshKey?: number;
  showStudent?: boolean;
  showTeacher?: boolean;
  // shown as a class filter when given
  classes?: { id: number; name: string }[];
  // director only
  onMotivate?: (absence: Absence) => void;
  emptyText?: string;
};

// absences with totals, a status filter and paging
export function AbsenceList({
  path,
  extra = {},
  refreshKey,
  showStudent = false,
  showTeacher = false,
  classes,
  onMotivate,
  emptyText = 'Nicio absenta.',
}: Props) {
  const [motivated, setMotivated] = useState('');
  const [classId, setClassId] = useState('');

  const list = usePaginatedList<Absence, AbsencePage>({
    path,
    initialSortBy: 'absentOn',
    initialSortOrder: 'DESC',
    refreshKey,
    extra: { ...extra, motivated, classId },
  });
  const summary = list.response?.summary;

  function changeFilter(set: (value: string) => void) {
    return (value: string) => {
      set(value);
      list.setPage(1);
    };
  }

  const columns: DataColumn<Absence>[] = [
    ...(showStudent
      ? [
          {
            key: 'student',
            header: 'Elev',
            primary: true,
            cell: (a: Absence) => `${a.studentName} (${a.className})`,
          },
        ]
      : []),
    {
      key: 'subject',
      header: 'Materie',
      primary: !showStudent,
      cell: (a) => a.subjectName,
    },
    { key: 'date', header: 'Data', cell: (a) => a.absentOn },
    ...(showTeacher
      ? [
          {
            key: 'teacher',
            header: 'Profesor',
            hideOnMobile: true,
            cell: (a: Absence) => a.teacherName,
          },
        ]
      : []),
    {
      key: 'status',
      header: 'Status',
      cell: (a) => <AbsenceBadge motivated={a.motivated} />,
    },
    {
      key: 'reason',
      header: 'Motiv',
      hideOnMobile: true,
      cell: (a) => a.motivatedReason ?? '—',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total absente" value={summary?.total ?? '—'} />
        <StatCard label="Motivate" value={summary?.motivated ?? '—'} />
        <StatCard label="Nemotivate" value={summary?.unmotivated ?? '—'} />
      </div>

      <div>
        <PagedTable
          list={list}
          sortOptions={
            showStudent
              ? SORT_OPTIONS
              : SORT_OPTIONS.filter((o) => o.value !== 'studentName')
          }
          searchPlaceholder={showStudent ? 'Cauta elev sau materie...' : 'Cauta materie...'}
          filters={
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Status"
                value={motivated}
                onChange={changeFilter(setMotivated)}
                options={ABSENCE_STATUS_OPTIONS}
                emptyLabel="Toate"
              />
              {classes ? (
                <Select
                  label="Clasa"
                  value={classId}
                  onChange={changeFilter(setClassId)}
                  options={classes.map((c) => ({ value: c.id, label: c.name }))}
                  emptyLabel="Toate clasele"
                />
              ) : null}
            </div>
          }
          columns={columns}
          rowKey={(a) => a.id}
          emptyText={emptyText}
          actions={
            onMotivate
              ? (a) =>
                  a.motivated ? null : (
                    <Button
                      variant="secondary"
                      className="!px-3 !py-1.5"
                      onClick={() => onMotivate(a)}
                    >
                      Motiveaza
                    </Button>
                  )
              : undefined
          }
        />
      </div>
    </div>
  );
}
