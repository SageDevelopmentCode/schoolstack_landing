import type { SupabaseClient } from "@supabase/supabase-js";

import { getBearerAccessToken } from "@/lib/supabase/bearer-token";

/** Validates cookie sessions on web and Bearer JWTs from the mobile app. */
export async function getUserFromRequest(
  supabase: SupabaseClient,
  request: Request,
) {
  const accessToken = getBearerAccessToken(request);
  return accessToken
    ? supabase.auth.getUser(accessToken)
    : supabase.auth.getUser();
}
