import {
  assertApiAuthenticated,
  getApiAuthHeaders,
} from '@/lib/auth/auth-session';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

type FetchAdminApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
};

export async function fetchAdminApi<T>(
  path: string,
  options: FetchAdminApiOptions = {},
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

export type OrganizationMembershipRecord = {
  id: string;
  organizationId: string;
  userId: string;
  email: string | null;
  role: string;
  status: string;
};

export type ParentPortalLoginStatus = {
  guardianId: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  familyId: string;
  accountLinked: boolean;
  hasEverSignedIn: boolean;
  lastSignInAt: string | null;
};

export type StaffMemberLoginRecord = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  portalRole: string | null;
  membershipStatus: string | null;
  isLinked: boolean;
  hasEverSignedIn: boolean | null;
  lastSignInAt: string | null;
};

export async function fetchOrganizationMemberships(organizationId: string) {
  return fetchAdminApi<{ memberships: OrganizationMembershipRecord[] }>(
    `/api/admin/organizations/${organizationId}/memberships`,
  );
}

export async function fetchOrganizationParentLoginStatus(organizationId: string) {
  return fetchAdminApi<{ statuses: ParentPortalLoginStatus[] }>(
    `/api/admin/organizations/${organizationId}/parent-login-status`,
  );
}

export async function fetchOrganizationStaffLoginStatus(organizationId: string) {
  return fetchAdminApi<{ staffMembers: StaffMemberLoginRecord[] }>(
    `/api/admin/organizations/${organizationId}/staff-login-status`,
  );
}
