import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { userIsGuardianForStudent } from "@/lib/admissions/parent-portal-access";
import { loadStudentAttendanceHistory } from "@/lib/school-admin/attendance/attendance-history";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/students/[studentId]/attendance/history";

type RouteContext = {
  params: Promise<{ studentId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { studentId } = await context.params;
  const supabase = await createClientFromRequest(request);

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

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const limitParam = searchParams.get("limit")?.trim();
  const offsetParam = searchParams.get("offset")?.trim();
  const limit = limitParam ? Number.parseInt(limitParam, 10) : 20;
  const offset = offsetParam ? Number.parseInt(offsetParam, 10) : 0;

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  const isGuardian = await userIsGuardianForStudent(
    supabase,
    user.id,
    organizationId,
    studentId,
  );

  if (!isGuardian) {
    return apiError(ROUTE, {
      request,
      status: 403,
      error: "You do not have permission to view this student's attendance history.",
      code: "forbidden",
    });
  }

  try {
    const admin = createAdminClient();
    const history = await loadStudentAttendanceHistory(admin, organizationId, studentId, {
      limit: Number.isFinite(limit) ? limit : 20,
      offset: Number.isFinite(offset) ? offset : 0,
    });

    return NextResponse.json(history);
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load attendance history.",
      code: "internal_error",
      cause: error,
    });
  }
}
