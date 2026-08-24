import type { StaffMemberRecord, StaffEmploymentStatus, StaffPortalRole } from '@/lib/school-admin-api';

export function staffDisplayName(member: Pick<StaffMemberRecord, 'firstName' | 'lastName' | 'email'>): string {
  const name = [member.firstName, member.lastName].filter(Boolean).join(' ');
  return name || member.email || 'Staff member';
}

export function employmentStatusLabel(status: StaffEmploymentStatus): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'on_leave':
      return 'On leave';
    default:
      return status;
  }
}

export function portalRoleLabel(role: StaffPortalRole | null): string {
  if (role === 'teacher') return 'Teacher';
  if (role === 'staff') return 'Staff';
  return '—';
}

export function schoolTeacherLoginPath(slug: string): string {
  return `/school/${slug}/teacher/login`;
}

export function schoolTeacherLoginUrl(slug: string, siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, '');
  return `${base}${schoolTeacherLoginPath(slug)}`;
}

export type StaffPortalLoginStatus = {
  accountLinked: boolean;
  hasEverSignedIn: boolean;
  lastSignInAt: string | null;
};

export function staffPortalLoginStatus(member: StaffMemberRecord): StaffPortalLoginStatus {
  return {
    accountLinked: member.isLinked,
    hasEverSignedIn: member.hasEverSignedIn ?? false,
    lastSignInAt: member.lastSignInAt ?? null,
  };
}

export function formatStaffApiError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;
  const message = error.message;
  if (message.includes('duplicate_staff')) {
    return 'A staff member with this email already exists at this school.';
  }
  if (message.includes('conflicting_membership')) {
    return 'This email is already used for a parent or admin account.';
  }
  if (message.includes('missing_email')) return 'Email is required.';
  if (message.includes('missing_name')) return 'First and last name are required.';
  if (message.includes('missing_role_title')) return 'Job title is required.';
  return message || fallback;
}
