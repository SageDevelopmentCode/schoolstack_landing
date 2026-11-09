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

export async function postAdminStaffHoursAdjustmentReview(input: {
  organizationId: string;
  requestId: string;
  decision: "approved" | "denied";
}): Promise<AdminStaffHoursPageData> {
  const response = await fetch("/api/school-admin/staff-hours/adjustments/review", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => null)) as
    | AdminStaffHoursPageData
    | { error?: string; code?: string }
    | null;

  if (!response.ok) {
    throwPortalJsonApiError(payload, response.status, "Failed to review the adjustment.");
  }

  return payload as AdminStaffHoursPageData;
}

export async function patchAdminStaffHoursAdjustmentSettings(input: {
  organizationId: string;
  adjustmentsRequireApproval: boolean;
}): Promise<void> {
  const response = await fetch("/api/school-admin/staff-hours/adjustments/settings", {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => null)) as
    | { adjustmentsRequireApproval?: boolean }
    | { error?: string; code?: string }
    | null;

  if (!response.ok) {
    throwPortalJsonApiError(payload, response.status, "Failed to save staff hours settings.");
  }
}
