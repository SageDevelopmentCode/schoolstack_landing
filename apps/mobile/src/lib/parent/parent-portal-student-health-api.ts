import { getApiAuthHeaders, throwUnauthorized } from '@/lib/auth/auth-session';
import type {
  HealthAllergyItem,
  HealthItemType,
  HealthMedicationItem,
  HealthUpdateItem,
  StudentHealthProfile,
} from '@/lib/student-health/types';
import { emptyStudentHealthProfile } from '@/lib/student-health/types';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

type ParentHealthItem = HealthAllergyItem | HealthMedicationItem | HealthUpdateItem;

async function fetchParentPortalApi<T>(
  path: string,
  options?: { method?: string; body?: unknown },
): Promise<T> {
  const headers = await getApiAuthHeaders();
  if (!headers.Authorization) {
    throwUnauthorized();
  }

  const response = await fetch(`${siteUrl}${path}`, {
    method: options?.method ?? 'GET',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed.');
  }
  return payload;
}

export async function fetchParentStudentHealthProfile(
  organizationId: string,
  studentId: string,
): Promise<StudentHealthProfile> {
  const query = new URLSearchParams({ organizationId }).toString();
  const payload = await fetchParentPortalApi<{ profile?: StudentHealthProfile }>(
    `/api/parent-portal/students/${encodeURIComponent(studentId)}/health?${query}`,
  );
  return payload.profile ?? emptyStudentHealthProfile();
}

export async function createParentStudentHealthItem(
  organizationId: string,
  studentId: string,
  itemType: HealthItemType,
  values: Record<string, unknown>,
): Promise<ParentHealthItem> {
  const payload = await fetchParentPortalApi<{ item: ParentHealthItem }>(
    `/api/parent-portal/students/${encodeURIComponent(studentId)}/health`,
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

export async function updateParentStudentHealthItem(
  organizationId: string,
  studentId: string,
  itemId: string,
  itemType: HealthItemType,
  values: Record<string, unknown>,
): Promise<ParentHealthItem> {
  const payload = await fetchParentPortalApi<{ item: ParentHealthItem }>(
    `/api/parent-portal/students/${encodeURIComponent(studentId)}/health/${encodeURIComponent(itemId)}`,
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

export async function deleteParentStudentHealthItem(
  organizationId: string,
  studentId: string,
  itemId: string,
): Promise<void> {
  const query = new URLSearchParams({ organizationId }).toString();
  await fetchParentPortalApi(
    `/api/parent-portal/students/${encodeURIComponent(studentId)}/health/${encodeURIComponent(itemId)}?${query}`,
    { method: 'DELETE' },
  );
}
