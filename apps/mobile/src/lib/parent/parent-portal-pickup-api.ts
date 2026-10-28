import { getApiAuthHeaders, throwUnauthorized } from '@/lib/auth/auth-session';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

export type AuthorizedPickupContact = {
  id: string;
  organizationId: string;
  studentId: string;
  familyId: string;
  firstName: string;
  lastName: string;
  relationship: string | null;
  phone: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FamilyPickupReuseOption = {
  studentId: string;
  studentName: string;
  contacts: AuthorizedPickupContact[];
};

export type PickupContactInput = {
  firstName: string;
  lastName: string;
  relationship?: string | null;
  phone?: string | null;
  notes?: string | null;
};

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

export async function fetchParentStudentPickupContacts(
  organizationId: string,
  studentId: string,
): Promise<AuthorizedPickupContact[]> {
  const query = new URLSearchParams({ organizationId }).toString();
  const payload = await fetchParentPortalApi<{ contacts?: AuthorizedPickupContact[] }>(
    `/api/parent-portal/students/${encodeURIComponent(studentId)}/authorized-pickup?${query}`,
  );
  return payload.contacts ?? [];
}

export async function fetchParentStudentPickupReuseOptions(
  organizationId: string,
  studentId: string,
): Promise<FamilyPickupReuseOption[]> {
  const query = new URLSearchParams({ organizationId }).toString();
  const payload = await fetchParentPortalApi<{ options?: FamilyPickupReuseOption[] }>(
    `/api/parent-portal/students/${encodeURIComponent(studentId)}/authorized-pickup/reuse-options?${query}`,
  );
  return payload.options ?? [];
}

export async function createParentStudentPickupContact(
  organizationId: string,
  studentId: string,
  input: PickupContactInput,
): Promise<void> {
  await fetchParentPortalApi(
    `/api/parent-portal/students/${encodeURIComponent(studentId)}/authorized-pickup`,
    {
      method: 'POST',
      body: { organizationId, ...input },
    },
  );
}

export async function updateParentStudentPickupContact(
  organizationId: string,
  studentId: string,
  contactId: string,
  input: PickupContactInput,
): Promise<void> {
  await fetchParentPortalApi(
    `/api/parent-portal/students/${encodeURIComponent(studentId)}/authorized-pickup/${encodeURIComponent(contactId)}`,
    {
      method: 'PATCH',
      body: { organizationId, ...input },
    },
  );
}

export async function deleteParentStudentPickupContact(
  organizationId: string,
  studentId: string,
  contactId: string,
): Promise<void> {
  const query = new URLSearchParams({ organizationId }).toString();
  await fetchParentPortalApi(
    `/api/parent-portal/students/${encodeURIComponent(studentId)}/authorized-pickup/${encodeURIComponent(contactId)}?${query}`,
    { method: 'DELETE' },
  );
}
