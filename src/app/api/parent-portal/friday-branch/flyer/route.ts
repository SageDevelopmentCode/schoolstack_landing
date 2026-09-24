import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  FRIDAY_BRANCH_CLASS_FLYER_BUCKET,
  getFridayBranchClassFlyer,
} from "@/lib/school-admin/friday-branch/friday-branch-class-flyer-storage";
import {
  ParentFridayBranchAuthError,
  requireParentFridayBranchAccess,
} from "@/lib/parent-portal/friday-branch/parent-friday-branch-auth";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/friday-branch/flyer";

function contentDispositionInline(fileName: string): string {
  const safe = fileName.replace(/["\r\n]/g, "_");
  return `inline; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const classId = searchParams.get("classId")?.trim() ?? "";

  if (!organizationId || !classId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and classId are required.",
      code: "missing_fields",
    });
  }

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

  try {
    await requireParentFridayBranchAccess(supabase, user, organizationId);

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
    if (error instanceof ParentFridayBranchAuthError) {
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
