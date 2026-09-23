import { fetchSchoolAdminApi } from '@/lib/school-admin-api';
import type {
  FridayBranchBlock,
  FridayBranchClassDetail,
  FridayBranchClassEnrollmentSummary,
  FridayBranchRecentSignupRow,
  FridayBranchRosterEmailPreview,
} from '@/lib/school-admin/friday-branch/friday-branch-types';

export const MAX_ROSTER_RECIPIENTS = 5;

export async function fetchFridayBranchSchedule(
  organizationId: string,
): Promise<FridayBranchBlock[]> {
  const query = new URLSearchParams({ organizationId }).toString();
  const payload = await fetchSchoolAdminApi<{ blocks: FridayBranchBlock[] }>(
    `/api/school-admin/friday-branch/schedule?${query}`,
  );
  return payload.blocks ?? [];
}

export async function saveFridayBranchSchedule(
  organizationId: string,
  blocks: FridayBranchBlock[],
): Promise<FridayBranchBlock[]> {
  const payload = await fetchSchoolAdminApi<{ blocks: FridayBranchBlock[] }>(
    '/api/school-admin/friday-branch/schedule',
    {
      method: 'PUT',
      body: { organizationId, blocks },
    },
  );
  return payload.blocks ?? [];
}

export async function fetchFridayBranchEnrollmentCounts(
  organizationId: string,
  classIds: string[],
): Promise<Record<string, FridayBranchClassEnrollmentSummary>> {
  if (classIds.length === 0) return {};

  const query = new URLSearchParams({
    organizationId,
    classIds: classIds.join(','),
  }).toString();

  const payload = await fetchSchoolAdminApi<{
    counts?: Record<string, FridayBranchClassEnrollmentSummary>;
  }>(`/api/school-admin/friday-branch/enrollment-counts?${query}`);

  return payload.counts ?? {};
}

export async function fetchFridayBranchRecentActivity(
  organizationId: string,
): Promise<FridayBranchRecentSignupRow[]> {
  const query = new URLSearchParams({ organizationId }).toString();
  const payload = await fetchSchoolAdminApi<{ signups?: FridayBranchRecentSignupRow[] }>(
    `/api/school-admin/friday-branch/recent-activity?${query}`,
  );
  return payload.signups ?? [];
}

export async function fetchFridayBranchClassDetail(
  organizationId: string,
  classId: string,
): Promise<FridayBranchClassDetail> {
  const query = new URLSearchParams({ organizationId }).toString();
  return fetchSchoolAdminApi<FridayBranchClassDetail>(
    `/api/school-admin/friday-branch/classes/${encodeURIComponent(classId)}?${query}`,
  );
}

export async function fetchFridayBranchRosterEmailPreview(
  organizationId: string,
  classId: string,
): Promise<FridayBranchRosterEmailPreview> {
  const query = new URLSearchParams({ organizationId }).toString();
  return fetchSchoolAdminApi<FridayBranchRosterEmailPreview>(
    `/api/school-admin/friday-branch/classes/${encodeURIComponent(classId)}/roster-email-preview?${query}`,
  );
}

export async function sendFridayBranchClassRoster(
  organizationId: string,
  classId: string,
  emails: string[],
): Promise<void> {
  await fetchSchoolAdminApi(
    `/api/school-admin/friday-branch/classes/${encodeURIComponent(classId)}/send-roster`,
    {
      method: 'POST',
      body: { organizationId, emails },
    },
  );
}

export function normalizeRosterEmails(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const email = value.trim().toLowerCase();
    if (!email || !email.includes('@') || seen.has(email)) continue;
    seen.add(email);
    result.push(email);
    if (result.length >= MAX_ROSTER_RECIPIENTS) break;
  }

  return result;
}
