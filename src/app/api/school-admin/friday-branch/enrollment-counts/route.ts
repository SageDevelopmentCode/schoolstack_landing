import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadFridayBranchEnrollmentCountsByClassId } from "@/lib/school-admin/friday-branch/friday-branch-enrollment-counts";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/friday-branch/enrollment-counts";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const classIds = (searchParams.get("classIds")?.trim() ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => UUID_RE.test(value));

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  if (classIds.length === 0) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "classIds is required.",
      code: "missing_fields",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);

    const admin = createAdminClient();
    const counts = await loadFridayBranchEnrollmentCountsByClassId(
      admin,
      organizationId,
      classIds,
    );

    return NextResponse.json({ counts });
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
      error: "Failed to load Friday Branch enrollment counts.",
      code: "internal_error",
      cause: err,
    });
  }
}
