import { fetchSchoolAdminApi } from '@/lib/school-admin-api';
import type {
  AdminStaffHoursPageData,
  AdminStaffHoursView,
} from '@/lib/school-admin/staff-hours/staff-hours-types';

export async function fetchStaffHoursPageData(
  organizationId: string,
  options?: {
    from?: string;
    to?: string;
    staffMemberId?: string | null;
    view?: AdminStaffHoursView;
  },
): Promise<AdminStaffHoursPageData> {
  const params = new URLSearchParams({ organizationId });
  if (options?.from) params.set('from', options.from);
  if (options?.to) params.set('to', options.to);
  if (options?.staffMemberId) {
    params.set('staffMemberId', options.staffMemberId);
  }
  if (options?.view) params.set('view', options.view);

  return fetchSchoolAdminApi<AdminStaffHoursPageData>(
    `/api/school-admin/staff-hours?${params.toString()}`,
  );
}
