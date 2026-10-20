import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { isSchoolGalleryEnabled } from "@/lib/school-gallery/gallery-enabled";
import { GalleryError } from "@/lib/school-gallery/gallery-errors";
import { assertCanManageGalleryPhoto } from "@/lib/school-gallery/gallery-photo-auth";
import {
  deleteGalleryPhoto,
  updateGalleryPhotoDate,
} from "@/lib/school-gallery/photos";
import { TeacherPortalAuthError } from "@/lib/staff/teacher-portal-access";
import { requireTeacherPortalUser } from "@/lib/staff/teacher-portal-access-server";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/gallery/[photoId]";

type RouteContext = {
  params: Promise<{ photoId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { photoId } = await context.params;
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const slug = searchParams.get("slug")?.trim() ?? "";

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

    const user = await requireTeacherPortalUser(supabase, organizationId, request);
    await assertCanManageGalleryPhoto(
      admin,
      organizationId,
      photoId,
      user.id,
      false,
    );

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

    const photo = await updateGalleryPhotoDate(
      admin,
      organizationId,
      photoId,
      photoDate,
    );
    return NextResponse.json({ photo });
  } catch (error) {
    if (error instanceof TeacherPortalAuthError) {
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
  const { photoId } = await context.params;
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const slug = searchParams.get("slug")?.trim() ?? "";

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

    const user = await requireTeacherPortalUser(supabase, organizationId, request);
    await assertCanManageGalleryPhoto(
      admin,
      organizationId,
      photoId,
      user.id,
      false,
    );

    await deleteGalleryPhoto(admin, organizationId, photoId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof TeacherPortalAuthError) {
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
