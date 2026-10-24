import { type NextRequest, NextResponse } from "next/server";
import {
  ADMIN_PREVIEW_EMBED_COOKIE,
  ADMIN_PREVIEW_EMBED_PARAM,
  isAdminPreviewEmbeddablePath,
  isAdminPreviewEmbedSearchParam,
} from "@/lib/admin/preview-device-viewport";
import { updateSession } from "@/utils/supabase/middleware";

function isSchoolAdminLoginPath(pathname: string): boolean {
  return /^\/school\/[^/]+\/admin\/login$/.test(pathname);
}

function isSchoolAdminPath(pathname: string): boolean {
  return /^\/school\/[^/]+\/admin(\/.*)?$/.test(pathname);
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isPlatformLoginRoute = pathname === "/admin/login";

  if (isAdminRoute && !isPlatformLoginRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPlatformLoginRoute && user) {
    const next = request.nextUrl.searchParams.get("next") || "/admin";
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = next;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (isSchoolAdminPath(pathname) && !isSchoolAdminLoginPath(pathname) && !user) {
    const schoolAdminMatch = pathname.match(/^\/school\/([^/]+)\/admin/);
    const slug = schoolAdminMatch?.[1];

    if (slug) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = `/school/${slug}/admin/login`;
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (
    isAdminPreviewEmbeddablePath(pathname) &&
    request.cookies.get(ADMIN_PREVIEW_EMBED_COOKIE)?.value === "1" &&
    !isAdminPreviewEmbedSearchParam(
      request.nextUrl.searchParams.get(ADMIN_PREVIEW_EMBED_PARAM),
    ) &&
    request.headers.get("sec-fetch-dest") === "iframe"
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.searchParams.set(ADMIN_PREVIEW_EMBED_PARAM, "1");
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/auth/callback",
    "/school/:slug/admin",
    "/school/:slug/admin/:path*",
  ],
};
