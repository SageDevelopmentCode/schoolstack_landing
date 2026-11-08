import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Phase 3 follow-up of docs/parent-portal-audit.md: verify the session locally instead of calling
 * the GoTrue server on every request.
 *
 * `auth.getClaims()` checks the JWT signature against the project's published signing keys
 * (asymmetric ES256 on this project) and refreshes the cookie session when it is expired, so a
 * request costs no network round trip. `auth.getUser()` asks the server and therefore also notices
 * sessions that were revoked (signed out elsewhere, user deleted) before the token expires.
 *
 * Use this only where a revoked session staying valid until the access token expires (1 hour by
 * default) is acceptable: parent portal reads and cookie refresh in the middleware. Keep
 * `getUser()` for admin and teacher access, payments and account changes.
 *
 * The returned user carries what the JWT holds (id, email, phone, metadata); it is not the full
 * GoTrue user record (no identities or timestamps). When claims cannot be verified or are missing,
 * this falls back to `getUser()` so legacy symmetric tokens and error messages keep working.
 */

export type ClaimsUserResult = {
  data: { user: User | null };
  error: { message: string } | null;
};

type ClaimsLike = {
  sub?: unknown;
  aud?: unknown;
  email?: unknown;
  phone?: unknown;
  role?: unknown;
  is_anonymous?: unknown;
  app_metadata?: unknown;
  user_metadata?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function userFromClaims(claims: ClaimsLike): User | null {
  if (typeof claims.sub !== "string" || claims.sub.length === 0) return null;

  const aud = Array.isArray(claims.aud)
    ? String(claims.aud[0] ?? "authenticated")
    : typeof claims.aud === "string"
      ? claims.aud
      : "authenticated";

  return {
    id: claims.sub,
    aud,
    role: typeof claims.role === "string" ? claims.role : "authenticated",
    email: typeof claims.email === "string" ? claims.email : undefined,
    phone: typeof claims.phone === "string" ? claims.phone : undefined,
    is_anonymous: claims.is_anonymous === true,
    app_metadata: asRecord(claims.app_metadata),
    user_metadata: asRecord(claims.user_metadata),
    created_at: "",
  } as User;
}

/** Drop-in for `supabase.auth.getUser(token?)` that verifies the JWT locally first. */
export async function getUserFromClaims(
  supabase: SupabaseClient,
  accessToken?: string | null,
): Promise<ClaimsUserResult> {
  // Kill switch: set AUTH_VERIFY_JWT_LOCALLY=0 to go back to a GoTrue check on every request.
  if (process.env.AUTH_VERIFY_JWT_LOCALLY !== "0") {
    const local = await verifyLocally(supabase, accessToken);
    if (local) return local;
  }

  return accessToken ? supabase.auth.getUser(accessToken) : supabase.auth.getUser();
}

async function verifyLocally(
  supabase: SupabaseClient,
  accessToken?: string | null,
): Promise<ClaimsUserResult | null> {
  try {
    const { data, error } = accessToken
      ? await supabase.auth.getClaims(accessToken)
      : await supabase.auth.getClaims();
    if (!error && data?.claims) {
      const user = userFromClaims(data.claims as ClaimsLike);
      if (user) return { data: { user }, error: null };
    }
  } catch {
    // Fall through to the server check.
  }
  return null;
}
