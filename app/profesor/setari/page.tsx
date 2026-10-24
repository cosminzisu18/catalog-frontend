'use client';

import { AccountSettings } from '@/components/auth/AccountSettings';
import { useTeacher } from '@/components/dashboard/TeacherProvider';

export default function TeacherSettingsPage() {
  const { me } = useTeacher();
  return <AccountSettings profile={me ?? undefined} />;
}
