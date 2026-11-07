import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { isSchoolGalleryEnabled } from "@/lib/school-gallery/gallery-enabled";
import { GalleryError } from "@/lib/school-gallery/gallery-errors";
import { parseGalleryListQuery } from "@/lib/school-gallery/gallery-pagination";
import { listGalleryPhotosPage } from "@/lib/school-gallery/photos";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";

const ROUTE = "/api/parent-portal/gallery";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    programScope: "optional",
    missingOrganizationMessage: "organizationId and slug are required.",
    fallbackErrorMessage: "Failed to load gallery photos.",
  },
  async ({ request, supabase, organizationId }) => {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug")?.trim() ?? "";
    if (!slug) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId and slug are required.",
        code: "missing_fields",
      });
    }

    try {
      const admin = createAdminClient();
      const org = await fetchOrganizationWithSettings(slug);
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
  },
);
