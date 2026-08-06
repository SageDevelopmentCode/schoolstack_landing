export type PostSignInRedirectMethod = "otp" | "password" | "session_restored";

export type PostSignInRedirectResult =
  | { redirected: true; href: string }
  | { redirected: false; needsSchoolSelection: true; accessibleSlugs: string[] };

export async function resolvePostSignInRedirect(
  slug?: string,
  method?: PostSignInRedirectMethod,
): Promise<PostSignInRedirectResult> {
  const params = new URLSearchParams();
  if (slug) {
    params.set("slug", slug);
  }
  if (method) {
    params.set("method", method);
  }

  const query = params.toString();
  const response = await fetch(
    query ? `/api/auth/login-destination?${query}` : "/api/auth/login-destination",
  );
  const payload = (await response.json()) as {
    href?: string;
    needsSchoolSelection?: boolean;
    accessibleSlugs?: string[];
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message ?? "Unable to determine where to send you next.");
  }

  if (payload.href) {
    return { redirected: true, href: payload.href };
  }

  if (payload.needsSchoolSelection) {
    return {
      redirected: false,
      needsSchoolSelection: true,
      accessibleSlugs: payload.accessibleSlugs ?? [],
    };
  }

  throw new Error(payload.message ?? "Unable to determine where to send you next.");
}

type AppRouterInstance = {
  replace: (href: string) => void;
  refresh: () => void;
};

export async function attemptPostSignInRedirect(
  router: AppRouterInstance,
  slug?: string,
  method?: PostSignInRedirectMethod,
): Promise<boolean> {
  if (!slug) {
    return false;
  }

  try {
    const result = await resolvePostSignInRedirect(slug, method);
    if (result.redirected) {
      router.replace(result.href);
      router.refresh();
      return true;
    }
  } catch {
    // Fall back to the caller's default completion flow.
  }

  return false;
}
