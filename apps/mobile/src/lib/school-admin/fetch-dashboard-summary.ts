import type { AdminDashboardSummary } from '@/lib/school-admin/dashboard-summary-types';
import { fetchSchoolAdminApi } from '@/lib/school-admin-api';

export async function fetchAdminDashboardSummary(
  organizationId: string,
  slug: string,
): Promise<AdminDashboardSummary> {
  const params = new URLSearchParams({ organizationId, slug });
  return fetchSchoolAdminApi<AdminDashboardSummary>(
    `/api/school-admin/dashboard-summary?${params.toString()}`,
  );
}

export async function refreshStripeConnectStatus(organizationId: string): Promise<void> {
  const params = new URLSearchParams({ organizationId });
  await fetchSchoolAdminApi(`/api/stripe/connect/status?${params.toString()}`);
}
