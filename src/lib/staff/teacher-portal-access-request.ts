import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { getRequestUser } from "@/lib/auth/session";
import { createClient } from "@/utils/supabase/server";
import {
  TeacherPortalAuthError,
  getStaffMemberIdForUser,
  getStaffUserProfile,
  userHasTeacherPortalAccess,
} from "@/lib/staff/teacher-portal-access";

export const getCachedUserHasTeacherPortalAccess = cache(
  async (userId: string, organizationId: string): Promise<boolean> => {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    return userHasTeacherPortalAccess(supabase, userId, organizationId);
  },
);

export const getCachedStaffMemberIdForUser = cache(
  async (userId: string, organizationId: string): Promise<string | null> => {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    return getStaffMemberIdForUser(supabase, userId, organizationId);
  },
);

export const getCachedStaffUserProfile = cache(
  async (userId: string, organizationId: string) => {
    const user = await getRequestUser();
    if (!user) {
      throw new TeacherPortalAuthError(
        "You must be signed in to continue. (missing_token)",
        "unauthenticated",
        401,
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    return getStaffUserProfile(supabase, userId, organizationId, user);
  },
);

/** Teacher `[feature]` RSC pages: layout already redirects unauthenticated users. */
export async function getTeacherPortalPageUser(
  organizationId: string,
): Promise<User> {
  const user = await getRequestUser();
  if (!user) {
    throw new TeacherPortalAuthError(
      "You must be signed in to continue. (missing_token)",
      "unauthenticated",
      401,
    );
  }

  const allowed = await getCachedUserHasTeacherPortalAccess(
    user.id,
    organizationId,
  );
  if (!allowed) {
    throw new TeacherPortalAuthError(
      "You do not have staff access to this school.",
      "forbidden",
      403,
    );
  }

  return user;
}
