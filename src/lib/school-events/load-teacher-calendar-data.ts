import { cookies } from "next/headers";
import { listEventsForOrg } from "./events";
import {
  resolveCanManageOrganizationEvents,
  userHasOrganizationEventManageAccess,
} from "./event-manage-access";
import type { TeacherCalendarInitialData } from "./types";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function loadTeacherCalendarInitialData(input: {
  organizationId: string;
  userId: string;
}): Promise<TeacherCalendarInitialData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [events, canManageEvents] = await Promise.all([
    listEventsForOrg(supabase, input.organizationId),
    userHasOrganizationEventManageAccess({
      organizationId: input.organizationId,
      userId: input.userId,
    }),
  ]);

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

  const canManageEvents = await resolveCanManageOrganizationEvents({
    organizationId: input.organizationId,
    staffMemberId: input.staffMemberId,
    membershipRole: input.portalRole,
    membershipStatus: input.membershipStatus,
  });

  return { events, canManageEvents };
}
