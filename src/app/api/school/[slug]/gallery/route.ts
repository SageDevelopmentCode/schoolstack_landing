import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { isSchoolGalleryEnabled } from "@/lib/school-gallery/gallery-enabled";
import { GalleryError } from "@/lib/school-gallery/gallery-errors";
import { displayNameFromAuthUser } from "@/lib/school-gallery/gallery-photo-auth";
import { parseGalleryListQuery } from "@/lib/school-gallery/gallery-pagination";
import {
  createGalleryPhotoBatch,
  listGalleryPhotosPage,
} from "@/lib/school-gallery/photos";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/gallery";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
    const admin = createAdminClient();
    const org = await fetchOrganizationWithSettings(admin, slug);

    if (!org || !isSchoolGalleryEnabled(org.features)) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    await requireSchoolAdminUser(supabase, org.id, request);

    const { limit, offset } = parseGalleryListQuery(
      new URL(request.url).searchParams,
    );
    const page = await listGalleryPhotosPage(admin, org.id, { limit, offset });
    return NextResponse.json(page);
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
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
      cause: error,
      code: "internal_error",
    });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
    const admin = createAdminClient();
    const org = await fetchOrganizationWithSettings(admin, slug);

    if (!org || !isSchoolGalleryEnabled(org.features)) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    const user = await requireSchoolAdminUser(supabase, org.id, request);

    const formData = await request.formData();
    const photoDate = String(formData.get("photoDate") ?? "").trim();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const photos = await createGalleryPhotoBatch(admin, {
      organizationId: org.id,
      photoDate,
      files,
      uploadedBy: user.id,
      actorName: displayNameFromAuthUser(user),
      actorType: "school_admin",
      surface: "school_admin",
    });

    return NextResponse.json({ photos });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
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

    if (error instanceof Error && error.message.includes("Photo date")) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: error.message,
        code: "invalid_request",
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to upload photos.",
      cause: error,
      code: "internal_error",
    });
  }
}
