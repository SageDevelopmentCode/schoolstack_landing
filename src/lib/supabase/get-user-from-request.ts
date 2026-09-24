import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { resolveRequestAccessToken } from "@/lib/supabase/resolve-request-access-token";

/** Validates cookie sessions on web and Bearer JWTs from the mobile app. */
export async function getUserFromRequest(
  supabase: SupabaseClient,
  request: Request,
) {
  const accessToken = await resolveRequestAccessToken(request);
  return accessToken
    ? supabase.auth.getUser(accessToken)
    : supabase.auth.getUser();
}
