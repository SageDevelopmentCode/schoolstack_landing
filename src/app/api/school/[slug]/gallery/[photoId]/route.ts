import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { isSchoolGalleryEnabled } from "@/lib/school-gallery/gallery-enabled";
import { GalleryError } from "@/lib/school-gallery/gallery-errors";
import { assertCanManageGalleryPhoto } from "@/lib/school-gallery/gallery-photo-auth";
import {
  deleteGalleryPhoto,
  updateGalleryPhotoDate,
} from "@/lib/school-gallery/photos";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/gallery/[photoId]";

type RouteContext = {
  params: Promise<{ slug: string; photoId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { slug, photoId } = await context.params;
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
    await assertCanManageGalleryPhoto(admin, org.id, photoId, user.id, true);

    const body = (await request.json()) as { photoDate?: string };
    const photoDate = body.photoDate?.trim() ?? "";
    if (!photoDate) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "photoDate is required.",
        code: "invalid_request",
      });
    }

    const photo = await updateGalleryPhotoDate(admin, org.id, photoId, photoDate);
    return NextResponse.json({ photo });
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
      error: "Failed to update photo.",
      cause: error,
      code: "internal_error",
    });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { slug, photoId } = await context.params;
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
    await assertCanManageGalleryPhoto(admin, org.id, photoId, user.id, true);

    await deleteGalleryPhoto(admin, org.id, photoId);
    return NextResponse.json({ ok: true });
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
      error: "Failed to delete photo.",
      cause: error,
      code: "internal_error",
    });
  }
}
