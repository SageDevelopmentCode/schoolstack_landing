import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  MobilePreviewAccessError,
  validateFamilyInOrganization,
} from "@/lib/admin/mobile-preview/access";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { isSchoolGalleryEnabled } from "@/lib/school-gallery/gallery-enabled";
import { GalleryError } from "@/lib/school-gallery/gallery-errors";
import { parseGalleryListQuery } from "@/lib/school-gallery/gallery-pagination";
import { listGalleryPhotosPage } from "@/lib/school-gallery/photos";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/organizations/[id]/gallery";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: organizationId } = await context.params;

  const { searchParams } = new URL(request.url);
  const familyId = searchParams.get("familyId")?.trim() ?? "";
  const slug = searchParams.get("slug")?.trim() ?? "";

  if (!familyId || !slug) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "familyId and slug are required.",
      code: "missing_fields",
    });
  }

  try {
    await requirePlatformAdminUser(supabase, request);

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

    await validateFamilyInOrganization(admin, organizationId, familyId);

    const { limit, offset } = parseGalleryListQuery(searchParams);
    const page = await listGalleryPhotosPage(admin, organizationId, {
      limit,
      offset,
    });

    return NextResponse.json(page);
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    if (error instanceof MobilePreviewAccessError) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

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
      code: "internal_error",
      cause: error,
    });
  }
}
