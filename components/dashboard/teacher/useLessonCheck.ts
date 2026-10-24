'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type LessonCheck = { subjectId: string; inLesson: boolean; message: string };

// grades and absences can only be given during the lesson, so the form
// checks it as soon as a subject is picked
export function useLessonCheck(subjectId: string) {
  const [check, setCheck] = useState<LessonCheck | null>(null);

  useEffect(() => {
    if (!subjectId) return;
    let cancelled = false;
    api<{ inLesson: boolean; message: string }>(
      `/timetable/lesson-check?subjectId=${subjectId}`,
    )
      .then((res) => {
        if (!cancelled) setCheck({ subjectId, ...res });
      })
      .catch(() => {
        if (!cancelled) {
          setCheck({
            subjectId,
            inLesson: false,
            message: 'Nu am putut verifica orarul. Poti lucra doar in timpul orei.',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  // an answer for a subject that is no longer selected does not count
  return check?.subjectId === subjectId ? check : null;
}
