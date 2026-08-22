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
  try {
    await fetchSchoolAdminApi(`/api/admissions/applications/${applicationId}/start-enrollment`);
    return true;
  } catch {
    return false;
  }
}

export async function markApplicationEnrolled(applicationId: string): Promise<void> {
  await fetchSchoolAdminApi(`/api/admissions/applications/${applicationId}/mark-enrolled`, {
    method: 'POST',
    body: {},
  });
}

export type StaffMemberRecord = {
  id: string;
  firstName: string;
  lastName: string;
  employmentStatus: 'active' | 'inactive' | 'on_leave';
};

export async function fetchStaffMembers(slug: string): Promise<StaffMemberRecord[]> {
  const payload = await fetchSchoolAdminApi<{ staffMembers?: StaffMemberRecord[] }>(
    `/api/school/${slug}/staff`,
  );
  return payload.staffMembers ?? [];
}

export async function assignStudentTeacher(
  slug: string,
  studentId: string,
  staffMemberId: string | null,
): Promise<{ assignedTeacherId: string | null; assignedTeacherName: string | null }> {
  return fetchSchoolAdminApi(`/api/school/${slug}/students/${studentId}/teacher`, {
    method: 'PATCH',
    body: { staffMemberId },
  });
}
