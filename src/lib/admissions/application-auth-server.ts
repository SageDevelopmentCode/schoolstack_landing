import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import { AuthError } from "@/lib/admissions/application-auth";
import { signedInErrorMessage } from "@/lib/supabase/bearer-token";
import { getUserFromRequest } from "@/lib/supabase/get-user-from-request";
import { signedInErrorForRequest } from "@/lib/supabase/resolve-request-access-token";

export async function requireAuthenticatedUser(
  supabase: SupabaseClient,
  request?: Request,
): Promise<User> {
  const {
    data: { user },
    error,
  } = request
    ? await getUserFromRequest(supabase, request)
    : await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError(
      request
        ? await signedInErrorForRequest(request, error)
        : signedInErrorMessage(null, error),
      "unauthenticated",
      401,
    );
  }

  return user;
}
