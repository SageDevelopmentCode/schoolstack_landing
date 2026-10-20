import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  assertCanAddSchoolProfilePhotos,
  countSchoolProfilePhotos,
  createSchoolProfilePhotosBatch,
  getNextSchoolProfilePhotoSortOrder,
  listSchoolProfilePhotos,
  SchoolProfilePhotoError,
} from "@/lib/school-admin/school-profile-photos/photos";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/school-profile-photos";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();
    const photos = await listSchoolProfilePhotos(admin, organizationId);
    return NextResponse.json({ photos });
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

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load school photos.",
      cause: err,
      code: "internal_error",
    });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const formData = await request.formData();
    const organizationId = String(formData.get("organizationId") ?? "").trim();

    if (!organizationId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId is required.",
        code: "missing_fields",
      });
    }

    const user = await requireSchoolAdminUser(supabase, organizationId, request);

    const fileMap = new Map<string, File>();
    const single = formData.get("file");
    if (single instanceof File && single.size > 0) {
      fileMap.set(`${single.name}:${single.size}`, single);
    }
    for (const entry of formData.getAll("files")) {
      if (entry instanceof File && entry.size > 0) {
        fileMap.set(`${entry.name}:${entry.size}`, entry);
      }
    }
    const files = [...fileMap.values()];

    const admin = createAdminClient();
    const currentCount = await countSchoolProfilePhotos(admin, organizationId);
    assertCanAddSchoolProfilePhotos(currentCount, files.length);

    const startSortOrder = await getNextSchoolProfilePhotoSortOrder(
      admin,
      organizationId,
    );
    const created = await createSchoolProfilePhotosBatch(admin, {
      organizationId,
      files,
      uploadedBy: user.id,
      startSortOrder,
    });

    return NextResponse.json({ photos: created });
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
      error: "Failed to upload school photos.",
      cause: err,
      code: "internal_error",
    });
  }
}
