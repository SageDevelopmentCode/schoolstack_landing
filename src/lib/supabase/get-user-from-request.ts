import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getUserFromClaims } from "@/lib/supabase/get-claims-user";
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

/**
 * Like `getUserFromRequest` but verifies the JWT locally (`getClaims`) instead of calling GoTrue.
 * For parent portal routes only; see `get-claims-user.ts` for the revoked-session trade-off.
 */
export async function getUserFromRequestClaims(
  supabase: SupabaseClient,
  request: Request,
) {
  const accessToken = await resolveRequestAccessToken(request);
  return getUserFromClaims(supabase, accessToken);
}
