import { throwPortalJsonApiError } from "@/lib/portal-json-api-error";
import type { AdminStaffHoursPageData, AdminStaffHoursView } from "@/lib/school-admin/staff-hours/staff-hours-types";

export { PortalJsonApiError as StaffHoursApiError } from "@/lib/portal-json-api-error";

export async function fetchAdminStaffHoursPageData(
  organizationId: string,
  options?: {
    from?: string;
    to?: string;
    staffMemberId?: string | null;
    view?: AdminStaffHoursView;
  },
): Promise<AdminStaffHoursPageData> {
  const params = new URLSearchParams({ organizationId });
  if (options?.from) params.set("from", options.from);
  if (options?.to) params.set("to", options.to);
  if (options?.staffMemberId) {
    params.set("staffMemberId", options.staffMemberId);
  }
  if (options?.view) params.set("view", options.view);

  const response = await fetch(
    `/api/school-admin/staff-hours?${params.toString()}`,
    { credentials: "same-origin" },
  );

  const payload = (await response.json().catch(() => null)) as
    | AdminStaffHoursPageData
    | { error?: string; code?: string }
    | null;

  if (!response.ok) {
    throwPortalJsonApiError(payload, response.status, "Failed to load staff hours.");
  }

  return payload as AdminStaffHoursPageData;
}
