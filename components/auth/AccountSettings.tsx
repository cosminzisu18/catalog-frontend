'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { InfoList } from '@/components/ui/InfoList';
import { Panel } from '@/components/ui/Panel';

const ROLE_LABEL: Record<string, string> = {
  DIRECTOR: 'Director',
  TEACHER: 'Profesor',
  STUDENT: 'Elev',
};

type Profile = {
  firstName?: string;
  lastName?: string;
  className?: string;
  // a DECIMAL column, so the API sends it as a string ("12.00")
  hoursTaught?: number | string;
};

export function AccountSettings({ profile }: { profile?: Profile }) {
  const { user } = useAuth();
  if (!user) return null;

  const fullName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : null;

  return (
    <div className="space-y-5 font-sans">
      <PageHeader eyebrow="Setari" title="Contul meu" />

      <Panel title="Date cont" subtitle="Informatii despre contul tau">
        <InfoList
          items={[
            fullName && { label: 'Nume', value: fullName },
            { label: 'Email', value: user.email },
            { label: 'Rol', value: ROLE_LABEL[user.role] ?? user.role },
            user.schoolName && { label: 'Scoala', value: user.schoolName },
            profile?.className && { label: 'Clasa', value: profile.className },
            profile?.hoursTaught != null && {
              label: 'Ore predate',
              value: Number(profile.hoursTaught),
            },
          ]}
        />
      </Panel>

      {!user.mustChangePassword ? <ChangePasswordForm /> : null}
    </div>
  );
}
