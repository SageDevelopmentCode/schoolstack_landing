import {
  assertApiAuthenticated,
  getApiAuthHeaders,
  throwUnauthorized,
} from '@/lib/auth/auth-session';
import type { OrganizationBranding } from '@/lib/organization-settings/types';
import type { AdminEnrolledStudentSummary } from '@/lib/school-admin/enrolled-students';
import type { BulletinPost } from '@/lib/school-bulletin/types';
import type { OrganizationEvent } from '@/lib/school-events/types';
import type {
  HealthAllergyItem,
  HealthItemType,
  HealthMedicationItem,
  HealthUpdateItem,
  StudentHealthProfile,
} from '@/lib/student-health/types';
import { emptyStudentHealthProfile } from '@/lib/student-health/types';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

type FetchTeacherApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
};

export async function fetchTeacherApi<T>(
  path: string,
  options: FetchTeacherApiOptions = {},
): Promise<T> {
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

export async function fetchTeacherApiFormData<T>(
  path: string,
  formData: FormData,
  method: 'POST' | 'PATCH' = 'POST',
): Promise<T> {
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

export async function submitTeacherSupportRequest(
  input: import('@/lib/support-request').SubmitPortalSupportRequestInput,
): Promise<void> {
  const formData = new FormData();
  formData.append('organizationId', input.organizationId);
  formData.append('topic', input.topic);
  formData.append('description', input.description.trim());

  if (input.sourcePagePath?.trim()) {
    formData.append('sourcePagePath', input.sourcePagePath.trim());
  }

  for (const file of input.attachments ?? []) {
    formData.append('attachments', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType ?? 'application/octet-stream',
    } as unknown as Blob);
  }

  await fetchTeacherApiFormData('/api/teacher-portal/support-requests', formData);
}

export type StaffUserProfile = {
  email: string;
  displayName: string;
  profilePhotoUrl: string | null;
};

export type StaffPortalRole = 'teacher' | 'staff';

export type TeacherDashboardFocusIcon = 'message' | 'calendar' | 'students' | 'signups';

export type TeacherDashboardFocusItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: TeacherDashboardFocusIcon;
};

export type StaffClassroomOption = {
  id: string;
  name: string;
  studentCount: number;
  role?: string;
};

export type TeacherDashboardSummary = {
  focusItems: TeacherDashboardFocusItem[];
  assignedStudents: AdminEnrolledStudentSummary[];
  upcomingEvents: OrganizationEvent[];
  messagesUnreadCount: number;
  bulletinEnabled: boolean;
  bulletinPosts: BulletinPost[];
  staffClassrooms: StaffClassroomOption[];
  staffMemberId: string | null;
};

export type OrganizationFeatures = {
  teacher?: Record<string, boolean>;
  admin?: Record<string, boolean>;
  feature_nav?: {
    teacher?: Record<string, boolean>;
  };
};

export type TeacherHomeData = {
  branding: OrganizationBranding;
  schoolSlug: string;
  schoolName: string;
  organizationId: string;
  features: OrganizationFeatures;
  userProfile: StaffUserProfile;
  roleTitle: string | null;
  portalRole: StaffPortalRole | null;
  summary: TeacherDashboardSummary;
};

export async function fetchTeacherHomeData(
  organizationId: string,
  slug: string,
): Promise<TeacherHomeData> {
  const query = new URLSearchParams({ organizationId, slug }).toString();
  return fetchTeacherApi<TeacherHomeData>(`/api/teacher-portal/home?${query}`);
}

export async function fetchTeacherStudentHealthProfile(
  organizationId: string,
  studentId: string,
): Promise<StudentHealthProfile> {
  const query = new URLSearchParams({ organizationId }).toString();
  const payload = await fetchTeacherApi<{ profile?: StudentHealthProfile }>(
    `/api/teacher-portal/students/${encodeURIComponent(studentId)}/health?${query}`,
  );
  return payload.profile ?? emptyStudentHealthProfile();
}

type TeacherHealthItem = HealthAllergyItem | HealthMedicationItem | HealthUpdateItem;

export async function createTeacherStudentHealthItem(
  organizationId: string,
  studentId: string,
  itemType: HealthItemType,
  values: Record<string, unknown>,
): Promise<TeacherHealthItem> {
  const payload = await fetchTeacherApi<{ item: TeacherHealthItem }>(
    `/api/teacher-portal/students/${encodeURIComponent(studentId)}/health`,
    {
      method: 'POST',
      body: { organizationId, itemType, values },
    },
  );
  if (!payload.item) {
    throw new Error('Failed to save health item.');
  }
  return payload.item;
}

export async function updateTeacherStudentHealthItem(
  organizationId: string,
  studentId: string,
  itemId: string,
  itemType: HealthItemType,
  values: Record<string, unknown>,
): Promise<TeacherHealthItem> {
  const payload = await fetchTeacherApi<{ item: TeacherHealthItem }>(
    `/api/teacher-portal/students/${encodeURIComponent(studentId)}/health/${encodeURIComponent(itemId)}`,
    {
      method: 'PATCH',
      body: { organizationId, itemType, values },
    },
  );
  if (!payload.item) {
    throw new Error('Failed to update health item.');
  }
  return payload.item;
}

export async function deleteTeacherStudentHealthItem(
  organizationId: string,
  studentId: string,
  itemId: string,
): Promise<void> {
  const query = new URLSearchParams({ organizationId }).toString();
  await fetchTeacherApi(
    `/api/teacher-portal/students/${encodeURIComponent(studentId)}/health/${encodeURIComponent(itemId)}?${query}`,
    { method: 'DELETE' },
  );
}

export async function fetchTeacherMessagesUnreadCount(
  organizationId: string,
  schoolName: string,
): Promise<number> {
  const query = new URLSearchParams({ organizationId, schoolName }).toString();
  try {
    const payload = await fetchTeacherApi<{ unreadCount?: number }>(
      `/api/teacher-portal/messages/unread-count?${query}`,
    );
    return typeof payload.unreadCount === 'number' ? payload.unreadCount : 0;
  } catch (error) {
    if (error instanceof Error && error.message === 'You must be signed in to continue.') {
      throwUnauthorized();
    }
    throw error;
  }
}
