import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import {
  TeacherPortalAuthError,
  userHasTeacherPortalAccess,
} from "@/lib/staff/teacher-portal-access";
import { getUserFromRequest } from "@/lib/supabase/get-user-from-request";
import { signedInErrorForRequest } from "@/lib/supabase/resolve-request-access-token";

export async function requireTeacherPortalUser(
  supabase: SupabaseClient,
  organizationId: string,
  request?: Request,
): Promise<User> {
  const {
    data: { user },
    error,
  } = request
    ? await getUserFromRequest(supabase, request)
    : await supabase.auth.getUser();

  if (error || !user) {
    throw new TeacherPortalAuthError(
      request
        ? await signedInErrorForRequest(request, error)
        : "You must be signed in to continue. (missing_token)",
      "unauthenticated",
      401,
    );
  }

  const allowed = await userHasTeacherPortalAccess(
    supabase,
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
