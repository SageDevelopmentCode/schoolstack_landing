import type { AdminStaffHoursPageData, AdminStaffHoursView } from "@/lib/school-admin/staff-hours/staff-hours-types";

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
    | { error?: string }
    | null;

  if (!response.ok) {
    const message =
      payload && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : "Failed to load staff hours.";
    throw new Error(message);
  }

  return payload as AdminStaffHoursPageData;
}
