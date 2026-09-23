import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadFridayBranchClassRosterEmailPreview } from "@/lib/friday-branch/friday-branch-roster-email";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/friday-branch/classes/[classId]/roster-email-preview";

type RouteContext = {
  params: Promise<{ classId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { classId } = await context.params;

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId || !classId?.trim()) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and classId are required.",
      code: "missing_fields",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);

    const admin = createAdminClient();
    const preview = await loadFridayBranchClassRosterEmailPreview(
      admin,
      organizationId,
      classId.trim(),
    );

    if (!preview) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Friday Branch class not found.",
        code: "not_found",
      });
    }

    return NextResponse.json(preview);
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
      error: "Failed to load Friday Branch roster email preview.",
      code: "internal_error",
      cause: err,
    });
  }
}
