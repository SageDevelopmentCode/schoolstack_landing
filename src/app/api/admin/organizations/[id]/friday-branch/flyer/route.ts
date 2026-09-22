import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  FRIDAY_BRANCH_CLASS_FLYER_BUCKET,
  getFridayBranchClassFlyer,
} from "@/lib/school-admin/friday-branch/friday-branch-class-flyer-storage";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/organizations/[id]/friday-branch/flyer";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function contentDispositionInline(fileName: string): string {
  const safe = fileName.replace(/["\r\n]/g, "_");
  return `inline; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function GET(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: organizationId } = await context.params;
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId")?.trim() ?? "";
  const familyId = searchParams.get("familyId")?.trim() ?? "";

  if (!classId || !familyId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "classId and familyId are required.",
      code: "missing_fields",
    });
  }

  try {
    await requirePlatformAdminUser(supabase);

    const admin = createAdminClient();
    const flyer = await getFridayBranchClassFlyer(admin, organizationId, classId);

    if (!flyer) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Class flyer not found.",
        code: "not_found",
      });
    }

    const { data: classRow, error: classError } = await admin
      .from("friday_branch_classes")
      .select("family_visible")
      .eq("id", classId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (classError) throw classError;
    if (!classRow?.family_visible) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Class flyer not found.",
        code: "not_found",
      });
    }

    const { data: fileBlob, error: downloadError } = await admin.storage
      .from(FRIDAY_BRANCH_CLASS_FLYER_BUCKET)
      .download(flyer.storagePath);

    if (downloadError || !fileBlob) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to this flyer.",
        code: "forbidden",
        cause: downloadError,
      });
    }

    const bytes = await fileBlob.arrayBuffer();

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDispositionInline(flyer.fileName),
        "Cache-Control": "private, no-store",
      },
    });
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

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load class flyer.",
      cause: error,
      code: "internal_error",
    });
  }
}
