export const MOBILE_ACCESS_TOKEN_HEADER = "x-schoolstack-access-token";

type HeaderReader = {
  get(name: string): string | null;
};

export function readAccessTokenFromHeaders(headerStore: HeaderReader): string | null {
  const authHeader = headerStore.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    if (token) return token;
  }

  const customToken = headerStore.get(MOBILE_ACCESS_TOKEN_HEADER)?.trim();
  return customToken || null;
}

export function getBearerAccessToken(request: Request): string | null {
  return readAccessTokenFromHeaders(request.headers);
}

type AuthFailure = {
  message?: string;
  code?: string;
} | null;

export function signedInErrorMessage(
  accessToken: string | null,
  authError?: AuthFailure,
): string {
  if (!accessToken) {
    return "You must be signed in to continue. (missing_token)";
  }

  const raw = authError?.code?.trim() || authError?.message?.trim() || "unknown";
  const safe = raw.replace(/[^a-zA-Z0-9_:-]/g, "_").slice(0, 80);
  return `You must be signed in to continue. (rejected_token:${safe})`;
}
