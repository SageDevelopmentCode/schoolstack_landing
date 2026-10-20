import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  deleteSchoolProfilePhoto,
  SchoolProfilePhotoError,
} from "@/lib/school-admin/school-profile-photos/photos";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/school-profile-photos/[photoId]";

type RouteContext = {
  params: Promise<{ photoId: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { photoId } = await context.params;

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId || !photoId?.trim()) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and photoId are required.",
      code: "missing_fields",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();
    await deleteSchoolProfilePhoto(admin, organizationId, photoId.trim());
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    if (err instanceof SchoolProfilePhotoError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to delete school photo.",
      cause: err,
      code: "internal_error",
    });
  }
}
