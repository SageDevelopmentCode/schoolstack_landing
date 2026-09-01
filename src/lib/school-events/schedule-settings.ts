import type { SupabaseClient } from "@supabase/supabase-js";
import type { StaffPortalRole } from "@/lib/staff/staff-members";

export type ScheduleEventPermissions = {
  roles: { teacher: boolean; staff: boolean };
  staff_member_ids: string[];
};

export type OrganizationScheduleSettings = {
  event_permissions: ScheduleEventPermissions;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getDefaultScheduleEventPermissions(): ScheduleEventPermissions {
  return {
    roles: { teacher: false, staff: false },
    staff_member_ids: [],
  };
}

export function getDefaultScheduleSettings(): OrganizationScheduleSettings {
  return {
    event_permissions: getDefaultScheduleEventPermissions(),
  };
}

function parseStaffMemberIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const ids: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!UUID_PATTERN.test(trimmed)) continue;
    if (!ids.includes(trimmed)) ids.push(trimmed);
  }
  return ids;
}

export function parseScheduleEventPermissions(
  raw: Record<string, unknown> | undefined,
): ScheduleEventPermissions {
  const defaults = getDefaultScheduleEventPermissions();
  const rolesRaw =
    raw?.roles && typeof raw.roles === "object"
      ? (raw.roles as Record<string, unknown>)
      : undefined;

  return {
    roles: {
      teacher:
        typeof rolesRaw?.teacher === "boolean"
          ? rolesRaw.teacher
          : defaults.roles.teacher,
      staff:
        typeof rolesRaw?.staff === "boolean"
          ? rolesRaw.staff
          : defaults.roles.staff,
    },
    staff_member_ids: parseStaffMemberIds(raw?.staff_member_ids),
  };
}

export function parseOrganizationScheduleSettings(
  raw: Record<string, unknown> | null | undefined,
): OrganizationScheduleSettings {
  const eventPermissionsRaw =
    raw?.event_permissions && typeof raw.event_permissions === "object"
      ? (raw.event_permissions as Record<string, unknown>)
      : undefined;

  return {
    event_permissions: parseScheduleEventPermissions(eventPermissionsRaw),
  };
}

export function validateOrganizationScheduleSettings(
  settings: OrganizationScheduleSettings,
): string | null {
  for (const id of settings.event_permissions.staff_member_ids) {
    if (!UUID_PATTERN.test(id)) {
      return "Invalid staff member id in event permissions.";
    }
  }
  return null;
}

export type EventPermissionSubject = {
  isOrgAdmin?: boolean;
  membershipRole?: string | null;
  staffMemberId?: string | null;
  membershipStatus?: string | null;
};

export function userCanManageOrganizationEvents(
  permissions: ScheduleEventPermissions,
  subject: EventPermissionSubject,
): boolean {
  if (subject.isOrgAdmin) return true;

  if (subject.membershipStatus && subject.membershipStatus !== "active") {
    return false;
  }

  const role = subject.membershipRole;
  if (role !== "teacher" && role !== "staff") return false;

  if (role === "teacher" && permissions.roles.teacher) return true;
  if (role === "staff" && permissions.roles.staff) return true;

  if (
    subject.staffMemberId &&
    permissions.staff_member_ids.includes(subject.staffMemberId)
  ) {
    return true;
  }

  return false;
}

export type StaffMemberForPermissionCount = {
  id: string;
  portalRole: StaffPortalRole | null;
  employmentStatus: string;
};

export function countStaffWithEventPermissions(
  staffMembers: StaffMemberForPermissionCount[],
  permissions: ScheduleEventPermissions,
): number {
  const activeStaff = staffMembers.filter(
    (member) => member.employmentStatus === "active",
  );

  const ids = new Set<string>();
  for (const member of activeStaff) {
    if (
      userCanManageOrganizationEvents(permissions, {
        membershipRole: member.portalRole,
        staffMemberId: member.id,
        membershipStatus: "active",
      })
    ) {
      ids.add(member.id);
    }
  }

  return ids.size;
}

export function formatPermittedStaffCountLabel(count: number): string {
  return count === 1
    ? "1 staff member can manage the school calendar"
    : `${count} staff members can manage the school calendar`;
}

export async function loadOrganizationScheduleSettings(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<OrganizationScheduleSettings> {
  const { data, error } = await supabase
    .from("organization_settings")
    .select("schedule")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;

  return parseOrganizationScheduleSettings(
    data?.schedule as Record<string, unknown> | null | undefined,
  );
}
