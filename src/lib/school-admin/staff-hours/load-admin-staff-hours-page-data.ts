import type { SupabaseClient } from "@supabase/supabase-js";
import { listStaffMembers } from "@/lib/staff/staff-members";
import { staffDisplayName } from "@/lib/staff/staff-display";
import { parseMyHoursDateKey } from "@/lib/school-teacher/my-hours/my-hours-mutations";
import { loadAdminStaffHoursLive } from "@/lib/school-admin/staff-hours/load-admin-staff-hours-live";
import { loadAdminStaffHoursSummary } from "@/lib/school-admin/staff-hours/load-admin-staff-hours-summary";
import type {
  AdminStaffHoursPageData,
  AdminStaffHoursView,
} from "@/lib/school-admin/staff-hours/staff-hours-types";
import {
  defaultAdminStaffHoursSummaryRange,
  loadOrganizationTimezoneForStaffHours,
} from "@/lib/school-admin/staff-hours/staff-hours-org-utils";

export type LoadAdminStaffHoursOptions = {
  from?: string;
  to?: string;
  staffMemberId?: string | null;
  view?: AdminStaffHoursView;
};

export async function loadAdminStaffHoursPageData(
  admin: SupabaseClient,
  organizationId: string,
  options?: LoadAdminStaffHoursOptions,
): Promise<AdminStaffHoursPageData> {
  const timezone = await loadOrganizationTimezoneForStaffHours(
    admin,
    organizationId,
  );
  const defaults = defaultAdminStaffHoursSummaryRange(timezone);
  const summaryFrom = options?.from
    ? parseMyHoursDateKey(options.from)
    : defaults.from;
  const summaryTo = options?.to
    ? parseMyHoursDateKey(options.to)
    : defaults.to;
  const view = options?.view ?? "all";
  const staffMemberId = options?.staffMemberId?.trim() || null;

  const members = await listStaffMembers(admin, organizationId);
  const staffOptions = members
    .filter((member) => member.employmentStatus === "active")
    .map((member) => ({
      id: member.id,
      name: staffDisplayName(member),
    }));

  const now = new Date();
  const emptySummary = {
    summaryRows: [] as AdminStaffHoursPageData["summaryRows"],
    sessions: [] as AdminStaffHoursPageData["sessions"],
  };
  const emptyLive = {
    liveRows: [] as AdminStaffHoursPageData["liveRows"],
    todayClosedSessions: [] as AdminStaffHoursPageData["todayClosedSessions"],
  };

  const [live, summary] = await Promise.all([
    view === "summary"
      ? Promise.resolve(emptyLive)
      : loadAdminStaffHoursLive(
          admin,
          organizationId,
          members,
          timezone,
          defaults.referenceDateKey,
          now,
        ),
    view === "live"
      ? Promise.resolve(emptySummary)
      : loadAdminStaffHoursSummary(admin, organizationId, members, {
          from: summaryFrom,
          to: summaryTo,
          staffMemberId,
          timezone,
        }),
  ]);

  return {
    timezone,
    referenceDateKey: defaults.referenceDateKey,
    summaryFrom,
    summaryTo,
    liveRows: live.liveRows,
    todayClosedSessions: live.todayClosedSessions,
    summaryRows: summary.summaryRows,
    sessions: summary.sessions,
    staffOptions,
  };
}
