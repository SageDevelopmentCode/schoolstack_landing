import { cookies } from "next/headers";
import { listEventsForOrg } from "./events";
import {
  loadOrganizationScheduleSettings,
  userCanManageOrganizationEvents,
} from "./schedule-settings";
import type { TeacherCalendarInitialData } from "./types";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

async function resolveCanManageEvents(input: {
  organizationId: string;
  staffMemberId: string | null;
  membershipRole: string | null;
  membershipStatus: string | null;
  isOrgAdmin?: boolean;
}): Promise<boolean> {
  const admin = createAdminClient();
  const settings = await loadOrganizationScheduleSettings(admin, input.organizationId);

  return userCanManageOrganizationEvents(settings.event_permissions, {
    isOrgAdmin: input.isOrgAdmin,
    membershipRole: input.membershipRole,
    staffMemberId: input.staffMemberId,
    membershipStatus: input.membershipStatus,
  });
}

export async function loadTeacherCalendarInitialData(input: {
  organizationId: string;
  userId: string;
}): Promise<TeacherCalendarInitialData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [events, membershipResult, staffMemberResult] = await Promise.all([
    listEventsForOrg(supabase, input.organizationId),
    supabase
      .from("organization_memberships")
      .select("role, status")
      .eq("organization_id", input.organizationId)
      .eq("user_id", input.userId)
      .eq("status", "active")
      .maybeSingle(),
    supabase
      .from("staff_members")
      .select("id")
      .eq("organization_id", input.organizationId)
      .eq("user_id", input.userId)
      .maybeSingle(),
  ]);

  const canManageEvents = await resolveCanManageEvents({
    organizationId: input.organizationId,
    staffMemberId: staffMemberResult.data?.id
      ? String(staffMemberResult.data.id)
      : null,
    membershipRole: membershipResult.data?.role
      ? String(membershipResult.data.role)
      : null,
    membershipStatus: membershipResult.data?.status
      ? String(membershipResult.data.status)
      : null,
  });

  return { events, canManageEvents };
}

export async function loadTeacherCalendarPreviewData(input: {
  organizationId: string;
  staffMemberId: string;
  portalRole: "teacher" | "staff" | null;
  membershipStatus: "invited" | "active" | "disabled" | null;
}): Promise<TeacherCalendarInitialData> {
  const admin = createAdminClient();
  const events = await listEventsForOrg(admin, input.organizationId);

  const canManageEvents = await resolveCanManageEvents({
    organizationId: input.organizationId,
    staffMemberId: input.staffMemberId,
    membershipRole: input.portalRole,
    membershipStatus: input.membershipStatus,
  });

  return { events, canManageEvents };
}
