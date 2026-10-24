export type Role = 'DIRECTOR' | 'TEACHER' | 'STUDENT';

export type AuthUser = {
  id: number;
  email: string;
  role: Role;
  schoolId: number | null;
  mustChangePassword: boolean;
  // true = director without a name; the dashboard is blocked until it is set
  mustCompleteProfile?: boolean;
  schoolSlug: string | null;
  schoolName: string | null;
  // false = can see the dashboard but can't change anything
  isActiveDirector?: boolean;
};

// the session lives only in httpOnly cookies; the browser stores neither
// the token nor the profile. On load, the profile comes from /auth/me.

// fired by api.ts when the session can't be refreshed anymore
export const SESSION_EXPIRED_EVENT = 'catalog:session-expired';

export function dashboardPath(role: Role): string {
  if (role === 'DIRECTOR') return '/director';
  if (role === 'TEACHER') return '/profesor';
  return '/elev';
}

export function settingsPath(role: Role): string {
  return `${dashboardPath(role)}/setari`;
}
