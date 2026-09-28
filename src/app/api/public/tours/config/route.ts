import { NextResponse } from "next/server";
import { loadPublicTourOrgBySlug, publicTourConfigResponse } from "@/lib/admissions/public-tour-org";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/public/tours/config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();

  if (!slug) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "slug is required.",
      code: "invalid_request",
    });
  }

  try {
    const admin = createAdminClient();
    const org = await loadPublicTourOrgBySlug(admin, slug);
    if (!org || !org.enabled) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Tour booking is not available.",
        code: "not_found",
      });
    }

    return NextResponse.json(publicTourConfigResponse(org));
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load tour page.",
      cause: error,
    });
  }
}
