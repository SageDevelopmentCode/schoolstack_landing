import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  countUnreadTeacherActivityNotifications,
  fetchUnreadTeacherActivityNotificationCount,
  getStaffUserIdForMember,
} from "@/lib/school-teacher/activity-notifications";

const getCachedTeacherUnreadCount = cache(
  async (
    organizationId: string,
    slug: string,
    staffMemberId: string,
    userId: string | null,
    teacherBasePath?: string,
  ): Promise<number> => {
    const { createAdminClient } = await import("@/utils/supabase/admin");
    const admin = createAdminClient();

    if (userId) {
      return fetchUnreadTeacherActivityNotificationCount(
        admin,
        userId,
        organizationId,
        slug,
        staffMemberId,
        { teacherBasePath },
      );
    }

    return countUnreadTeacherActivityNotifications(
      admin,
      organizationId,
      slug,
      staffMemberId,
      null,
      { teacherBasePath },
    );
  },
);

export async function getTeacherPortalActivityUnreadCount(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    slug: string;
    staffMemberId: string;
    userId?: string | null;
    teacherBasePath?: string;
  },
): Promise<number> {
  let userId = input.userId ?? null;
  if (!userId) {
    userId = await getStaffUserIdForMember(supabase, input.staffMemberId);
  }

  return getCachedTeacherUnreadCount(
    input.organizationId,
    input.slug,
    input.staffMemberId,
    userId,
    input.teacherBasePath,
  );
}
