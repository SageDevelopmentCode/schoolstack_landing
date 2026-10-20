import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { userHasAccessForOptionalProgramScope } from "@/lib/admissions/program-parent-portal-access";
import { isSchoolGalleryEnabled } from "@/lib/school-gallery/gallery-enabled";
import { GalleryError } from "@/lib/school-gallery/gallery-errors";
import { parseGalleryListQuery } from "@/lib/school-gallery/gallery-pagination";
import { listGalleryPhotosPage } from "@/lib/school-gallery/photos";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";

const ROUTE = "/api/parent-portal/gallery";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const {
    data: { user },
    error: authError,
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: await signedInErrorForRequest(request, authError),
      code: "unauthorized",
    });
  }

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId")?.trim() ?? "";
  const programId = url.searchParams.get("programId")?.trim() ?? "";
  const slug = url.searchParams.get("slug")?.trim() ?? "";

  if (!organizationId || !slug) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and slug are required.",
      code: "missing_fields",
    });
  }

  try {
    const admin = createAdminClient();
    const org = await fetchOrganizationWithSettings(admin, slug);
    if (!org || org.id !== organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }
    if (!isSchoolGalleryEnabled(org.features)) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Gallery is not available.",
        code: "not_found",
      });
    }

    const hasAccess = await userHasAccessForOptionalProgramScope(
      supabase,
      user.id,
      organizationId,
      programId,
    );
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to the parent portal.",
        code: "forbidden",
      });
    }

    const { limit, offset } = parseGalleryListQuery(url.searchParams);
    const page = await listGalleryPhotosPage(supabase, organizationId, {
      limit,
      offset,
    });
    return NextResponse.json(page);
  } catch (error) {
    if (error instanceof GalleryError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load gallery photos.",
      cause: error,
      code: "internal_error",
    });
  }
}
