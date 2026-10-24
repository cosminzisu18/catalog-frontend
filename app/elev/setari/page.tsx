'use client';

import { AccountSettings } from '@/components/auth/AccountSettings';
import { useStudent } from '@/components/dashboard/StudentProvider';

export default function StudentSettingsPage() {
  const { me } = useStudent();
  return <AccountSettings profile={me ?? undefined} />;
}
