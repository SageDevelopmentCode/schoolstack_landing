import { assertApiAuthenticated, getApiAuthHeaders } from '@/lib/auth/auth-session';
import { assertPreviewWriteAllowed } from '@/lib/platform-admin/preview-session-store';
import type {
  ClassroomDetail,
  ClassroomStatus,
  ClassroomStaffRole,
  ClassroomSummary,
  ProgramOption,
  SetStudentClassroomsResult,
} from '@/lib/school-admin/classrooms';
import type { StudentHealthProfile } from '@/lib/student-health/types';
import { emptyStudentHealthProfile } from '@/lib/student-health/types';
import type {
  CommitteeActivityItem,
  CommitteeDutyRoleSummary,
  CommitteeJoinRequest,
  CommitteeRole,
} from '@/lib/parent/parent-committees-types';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

type FetchSchoolAdminApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
};

export async function fetchSchoolAdminApi<T>(
  path: string,
  options: FetchSchoolAdminApiOptions = {},
): Promise<T> {
  assertPreviewWriteAllowed(options.method);

  const response = await fetch(`${siteUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: await getApiAuthHeaders(options.body !== undefined),
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  await assertApiAuthenticated(response);
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
  assertPreviewWriteAllowed(method);

  const response = await fetch(`${siteUrl}${path}`, {
    method,
    headers: await getApiAuthHeaders(false),
    body: formData,
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  await assertApiAuthenticated(response);
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
  assignedStudentCount?: number;
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
  programIds: string[];
  classroomNames: string[];
  classroomIds: string[];
  enrolledAt: string;
  assignedTeachers: AssignedTeacher[];
  assignedTeacherNames: string;
  profilePhotoUrl: string | null;
  hasStandingHealthItems: boolean;
};

export class StudentHealthFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StudentHealthFetchError';
  }
}

export async function fetchClassrooms(
  slug: string,
): Promise<{ classrooms: ClassroomSummary[]; programs: ProgramOption[] }> {
  const payload = await fetchSchoolAdminApi<{
    classrooms?: ClassroomSummary[];
    programs?: ProgramOption[];
  }>(`/api/school/${slug}/classrooms`);
  return {
    classrooms: payload.classrooms ?? [],
    programs: payload.programs ?? [],
  };
}

export async function createClassroomApi(
  slug: string,
  input: { name: string; programId?: string | null; status?: ClassroomStatus },
): Promise<ClassroomSummary> {
  const payload = await fetchSchoolAdminApi<{ classroom: ClassroomSummary }>(
    `/api/school/${slug}/classrooms`,
    { method: 'POST', body: input },
  );
  return payload.classroom;
}

export async function updateClassroomApi(
  slug: string,
  classroomId: string,
  input: { name?: string; programId?: string | null; status?: ClassroomStatus },
): Promise<ClassroomSummary> {
  const payload = await fetchSchoolAdminApi<{ classroom: ClassroomSummary }>(
    `/api/school/${slug}/classrooms/${classroomId}`,
    { method: 'PATCH', body: input },
  );
  return payload.classroom;
}

export async function deleteClassroomApi(slug: string, classroomId: string): Promise<void> {
  await fetchSchoolAdminApi(`/api/school/${slug}/classrooms/${classroomId}`, {
    method: 'DELETE',
  });
}

export async function fetchClassroomDetailApi(
  slug: string,
  classroomId: string,
): Promise<ClassroomDetail> {
  const payload = await fetchSchoolAdminApi<{ classroom: ClassroomDetail }>(
    `/api/school/${slug}/classrooms/${classroomId}`,
  );
  return payload.classroom;
}

export async function fetchClassroomStudentsApi(
  slug: string,
  classroomId: string,
): Promise<AdminEnrolledStudentSummary[]> {
  const payload = await fetchSchoolAdminApi<{ students?: AdminEnrolledStudentSummary[] }>(
    `/api/school/${slug}/classrooms/${classroomId}/students`,
  );
  return payload.students ?? [];
}

export async function assignStudentsToClassroomApi(
  slug: string,
  classroomId: string,
  studentIds: string[],
): Promise<void> {
  await fetchSchoolAdminApi(`/api/school/${slug}/classrooms/${classroomId}/students`, {
    method: 'PATCH',
    body: { studentIds },
  });
}

export async function removeStudentFromClassroomApi(
  slug: string,
  classroomId: string,
  studentId: string,
): Promise<void> {
  await fetchSchoolAdminApi(`/api/school/${slug}/classrooms/${classroomId}/students`, {
    method: 'PATCH',
    body: { studentId, action: 'remove' },
  });
}

export async function assignStaffToClassroomApi(
  slug: string,
  classroomId: string,
  staffMemberId: string,
  role: ClassroomStaffRole = 'lead',
): Promise<void> {
  await fetchSchoolAdminApi(`/api/school/${slug}/classrooms/${classroomId}/staff`, {
    method: 'PATCH',
    body: { staffMemberId, role },
  });
}

export async function removeStaffFromClassroomApi(
  slug: string,
  classroomId: string,
  staffMemberId: string,
): Promise<void> {
  await fetchSchoolAdminApi(`/api/school/${slug}/classrooms/${classroomId}/staff`, {
    method: 'PATCH',
    body: { staffMemberId, action: 'remove' },
  });
}

export async function setStudentClassroomsApi(
  slug: string,
  studentId: string,
  classroomIds: string[],
): Promise<SetStudentClassroomsResult> {
  return fetchSchoolAdminApi<SetStudentClassroomsResult>(
    `/api/school/${slug}/students/${studentId}/classroom`,
    { method: 'PATCH', body: { classroomIds } },
  );
}

export async function fetchStudentHealthProfileAdmin(
  slug: string,
  studentId: string,
): Promise<StudentHealthProfile> {
  const payload = await fetchSchoolAdminApi<{ profile?: StudentHealthProfile }>(
    `/api/school/${slug}/students/${studentId}/health`,
  );
  return payload.profile ?? emptyStudentHealthProfile();
}

export async function createStudentHealthItemAdmin(
  slug: string,
  studentId: string,
  itemType: string,
  values: Record<string, unknown>,
): Promise<{ item?: Record<string, unknown> }> {
  return fetchSchoolAdminApi(`/api/school/${slug}/students/${studentId}/health`, {
    method: 'POST',
    body: { itemType, values },
  });
}

export async function updateStudentHealthItemAdmin(
  slug: string,
  studentId: string,
  itemId: string,
  itemType: string,
  values: Record<string, unknown>,
): Promise<{ item?: Record<string, unknown> }> {
  return fetchSchoolAdminApi(
    `/api/school/${slug}/students/${studentId}/health/${itemId}`,
    { method: 'PATCH', body: { itemType, values } },
  );
}

export async function deleteStudentHealthItemAdmin(
  slug: string,
  studentId: string,
  itemId: string,
): Promise<void> {
  await fetchSchoolAdminApi(
    `/api/school/${slug}/students/${studentId}/health/${itemId}`,
    { method: 'DELETE' },
  );
}

export async function fetchStaffAssignedStudents(
  slug: string,
  staffMemberId: string,
): Promise<AdminEnrolledStudentSummary[]> {
  const payload = await fetchSchoolAdminApi<{ students: AdminEnrolledStudentSummary[] }>(
    `/api/school/${slug}/staff/${staffMemberId}/students`,
  );
  return payload.students ?? [];
}

export async function fetchAdminCommitteeJoinRequests(
  organizationId: string,
  options?: { committeeId?: string; status?: CommitteeJoinRequest['status'] },
): Promise<{
  requests: CommitteeJoinRequest[];
  dutyRolesByCommitteeId: Record<string, CommitteeDutyRoleSummary[]>;
}> {
  const query = new URLSearchParams({ organizationId });
  if (options?.committeeId) query.set('committeeId', options.committeeId);
  if (options?.status) query.set('status', options.status);
  const payload = await fetchSchoolAdminApi<{
    requests?: CommitteeJoinRequest[];
    dutyRolesByCommitteeId?: Record<string, CommitteeDutyRoleSummary[]>;
  }>(`/api/school-admin/committees/join-requests?${query}`);
  return {
    requests: payload.requests ?? [],
    dutyRolesByCommitteeId: payload.dutyRolesByCommitteeId ?? {},
  };
}

export async function approveAdminCommitteeJoinRequest(
  requestId: string,
  input: {
    organizationId: string;
    schoolSlug: string;
    memberRole?: CommitteeRole;
    assignDutyRoleId?: string | null;
  },
): Promise<void> {
  await fetchSchoolAdminApi(`/api/school-admin/committees/join-requests/${requestId}/approve`, {
    method: 'POST',
    body: input,
  });
}

export async function declineAdminCommitteeJoinRequest(
  requestId: string,
  input: { organizationId: string; schoolSlug: string },
): Promise<void> {
  await fetchSchoolAdminApi(`/api/school-admin/committees/join-requests/${requestId}/decline`, {
    method: 'POST',
    body: input,
  });
}

export async function fetchAdminCommitteeActivity(
  organizationId: string,
  slug: string,
  options?: { committeeId?: string; limit?: number },
): Promise<CommitteeActivityItem[]> {
  const query = new URLSearchParams({
    organizationId,
    slug,
    limit: String(options?.limit ?? 30),
  });
  if (options?.committeeId) query.set('committeeId', options.committeeId);
  const payload = await fetchSchoolAdminApi<{ items?: CommitteeActivityItem[] }>(
    `/api/school-admin/committees/activity?${query}`,
  );
  return payload.items ?? [];
}
