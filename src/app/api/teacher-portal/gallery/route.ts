import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { isSchoolGalleryEnabled } from "@/lib/school-gallery/gallery-enabled";
import { GalleryError } from "@/lib/school-gallery/gallery-errors";
import { displayNameFromAuthUser } from "@/lib/school-gallery/gallery-photo-auth";
import { parseGalleryListQuery } from "@/lib/school-gallery/gallery-pagination";
import {
  createGalleryPhotoBatch,
  listGalleryPhotosPage,
} from "@/lib/school-gallery/photos";
import { getStaffUserProfile } from "@/lib/staff/teacher-portal-access";
import { TeacherPortalAuthError } from "@/lib/staff/teacher-portal-access";
import { requireTeacherPortalUser } from "@/lib/staff/teacher-portal-access-server";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/gallery";

export async function GET(request: Request) {
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
    const org = await fetchOrganizationWithSettings(supabase, slug);
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

    await requireTeacherPortalUser(supabase, organizationId, request);

    const { limit, offset } = parseGalleryListQuery(
      new URL(request.url).searchParams,
    );
    const page = await listGalleryPhotosPage(supabase, organizationId, {
      limit,
      offset,
    });
    return NextResponse.json(page);
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
      error: "Failed to load gallery photos.",
      cause: error,
      code: "internal_error",
    });
  }
}

export async function POST(request: Request) {
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
    const profile = await getStaffUserProfile(
      supabase,
      user.id,
      organizationId,
      user,
    );

    const formData = await request.formData();
    const photoDate = String(formData.get("photoDate") ?? "").trim();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const photos = await createGalleryPhotoBatch(admin, {
      organizationId,
      photoDate,
      files,
      uploadedBy: user.id,
      actorName: profile.displayName || displayNameFromAuthUser(user),
      actorType: "teacher",
      surface: "teacher_portal",
    });

    return NextResponse.json({ photos });
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
