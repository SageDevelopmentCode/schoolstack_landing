import { getSupabaseClient } from '@/lib/supabase';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

type FetchSchoolAdminApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
};

async function getAuthHeaders(includeJson = false): Promise<Record<string, string>> {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('You must be signed in to continue.');
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
  };
}

export async function fetchSchoolAdminApi<T>(
  path: string,
  options: FetchSchoolAdminApiOptions = {},
): Promise<T> {
  const response = await fetch(`${siteUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: await getAuthHeaders(options.body !== undefined),
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(typeof payload.error === 'string' ? payload.error : 'Request failed.');
  }

  return payload;
}

export async function fetchSchoolAdminApiFormData<T>(
  path: string,
  formData: FormData,
  method: 'POST' | 'PATCH' = 'POST',
): Promise<T> {
  const response = await fetch(`${siteUrl}${path}`, {
    method,
    headers: await getAuthHeaders(false),
    body: formData,
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(typeof payload.error === 'string' ? payload.error : 'Request failed.');
  }

  return payload;
}

export async function patchApplicationStatus(applicationId: string, status: string): Promise<void> {
  await fetchSchoolAdminApi(`/api/admissions/applications/${applicationId}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function fetchWithdrawnDecisionActions(
  applicationId: string,
): Promise<Array<{ status: string; label: string; variant: 'primary' | 'secondary' | 'danger' }>> {
  const payload = await fetchSchoolAdminApi<{
    decisionActions?: Array<{ status: string; label: string; variant: 'primary' | 'secondary' | 'danger' }>;
  }>(`/api/admissions/applications/${applicationId}/status`);
  return payload.decisionActions ?? [];
}

export async function checkPublishedEnrollmentChecklist(applicationId: string): Promise<boolean> {
  const preview = await getPublishedEnrollmentChecklistPreview(applicationId);
  return preview.hasChecklist;
}

export async function getPublishedEnrollmentChecklistPreview(
  applicationId: string,
): Promise<{ hasChecklist: boolean; templateName: string | null }> {
  try {
    const payload = await fetchSchoolAdminApi<{ templateName?: string }>(
      `/api/admissions/applications/${applicationId}/start-enrollment`,
    );
    return {
      hasChecklist: true,
      templateName: typeof payload.templateName === 'string' ? payload.templateName : null,
    };
  } catch {
    return { hasChecklist: false, templateName: null };
  }
}

export async function markApplicationEnrolled(applicationId: string): Promise<void> {
  await fetchSchoolAdminApi(`/api/admissions/applications/${applicationId}/mark-enrolled`, {
    method: 'POST',
    body: {},
  });
}

export type StaffPortalRole = 'teacher' | 'staff';

export type StaffEmploymentStatus = 'active' | 'inactive' | 'on_leave';

export type StaffMemberRecord = {
  id: string;
  organizationId: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  roleTitle: string | null;
  employmentStatus: StaffEmploymentStatus;
  portalRole: StaffPortalRole | null;
  membershipStatus: 'invited' | 'active' | 'disabled' | null;
  isLinked: boolean;
  hasEverSignedIn?: boolean;
  lastSignInAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateStaffMemberInput = {
  email: string;
  firstName: string;
  lastName: string;
  roleTitle: string;
  portalRole: StaffPortalRole;
};

export type UpdateStaffMemberInput = {
  firstName: string;
  lastName: string;
  roleTitle: string;
  employmentStatus: StaffEmploymentStatus;
  portalRole: StaffPortalRole;
};

export async function fetchStaffMembers(slug: string): Promise<StaffMemberRecord[]> {
  const payload = await fetchSchoolAdminApi<{ staffMembers?: StaffMemberRecord[] }>(
    `/api/school/${slug}/staff`,
  );
  return payload.staffMembers ?? [];
}

export async function createStaffMember(
  slug: string,
  input: CreateStaffMemberInput,
): Promise<StaffMemberRecord> {
  const payload = await fetchSchoolAdminApi<{ staffMember: StaffMemberRecord }>(
    `/api/school/${slug}/staff`,
    { method: 'POST', body: input },
  );
  return payload.staffMember;
}

export async function updateStaffMember(
  slug: string,
  staffMemberId: string,
  input: UpdateStaffMemberInput,
): Promise<StaffMemberRecord> {
  const payload = await fetchSchoolAdminApi<{ staffMember: StaffMemberRecord }>(
    `/api/school/${slug}/staff/${staffMemberId}`,
    { method: 'PATCH', body: input },
  );
  return payload.staffMember;
}

export async function deactivateStaffPortalAccess(
  slug: string,
  staffMemberId: string,
): Promise<StaffMemberRecord> {
  const payload = await fetchSchoolAdminApi<{ staffMember: StaffMemberRecord }>(
    `/api/school/${slug}/staff/${staffMemberId}`,
    { method: 'PATCH', body: { action: 'deactivatePortalAccess' } },
  );
  return payload.staffMember;
}

export async function reactivateStaffPortalAccess(
  slug: string,
  staffMemberId: string,
): Promise<StaffMemberRecord> {
  const payload = await fetchSchoolAdminApi<{ staffMember: StaffMemberRecord }>(
    `/api/school/${slug}/staff/${staffMemberId}`,
    { method: 'PATCH', body: { action: 'reactivatePortalAccess' } },
  );
  return payload.staffMember;
}

export async function setStudentTeachersApi(
  slug: string,
  studentId: string,
  staffMemberIds: string[],
): Promise<{
  assignedTeachers: { id: string; name: string }[];
  assignedTeacherNames: string;
}> {
  return fetchSchoolAdminApi(`/api/school/${slug}/students/${studentId}/teacher`, {
    method: 'PATCH',
    body: { staffMemberIds },
  });
}

export async function assignStudentsToStaffApi(
  slug: string,
  staffMemberId: string,
  studentIds: string[],
): Promise<void> {
  await fetchSchoolAdminApi(`/api/school/${slug}/staff/${staffMemberId}/students`, {
    method: 'PATCH',
    body: { studentIds },
  });
}

export async function unassignStudentFromStaffApi(
  slug: string,
  staffMemberId: string,
  studentId: string,
): Promise<void> {
  await fetchSchoolAdminApi(`/api/school/${slug}/staff/${staffMemberId}/students`, {
    method: 'PATCH',
    body: { action: 'unassign', studentId },
  });
}

/** @deprecated Use setStudentTeachersApi instead */
export async function assignStudentTeacher(
  slug: string,
  studentId: string,
  staffMemberId: string | null,
): Promise<{
  assignedTeachers: { id: string; name: string }[];
  assignedTeacherNames: string;
}> {
  return setStudentTeachersApi(
    slug,
    studentId,
    staffMemberId ? [staffMemberId] : [],
  );
}

export type AssignedTeacher = {
  id: string;
  name: string;
};

export type AdminEnrolledStudentSummary = {
  id: string;
  firstName: string;
  lastName: string;
  grade: string | null;
  dateOfBirth: string | null;
  status: string;
  familyId: string;
  familyName: string | null;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  programNames: string[];
  enrolledAt: string;
  assignedTeachers: AssignedTeacher[];
  assignedTeacherNames: string;
  profilePhotoUrl: string | null;
};

export async function fetchStaffAssignedStudents(
  slug: string,
  staffMemberId: string,
): Promise<AdminEnrolledStudentSummary[]> {
  const payload = await fetchSchoolAdminApi<{ students: AdminEnrolledStudentSummary[] }>(
    `/api/school/${slug}/staff/${staffMemberId}/students`,
  );
  return payload.students ?? [];
}
