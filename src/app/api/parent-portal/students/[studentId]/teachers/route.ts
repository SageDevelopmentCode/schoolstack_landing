import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  loadAssignedTeachersForStudent,
  userIsGuardianForStudent,
} from "@/lib/admissions/parent-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/parent-portal/students/[studentId]/teachers";

type RouteContext = {
  params: Promise<{ studentId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { studentId } = await context.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

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
      error: "You do not have permission to view this student's teachers.",
      code: "forbidden",
    });
  }

  const admin = createAdminClient();

  try {
    const teachers = await loadAssignedTeachersForStudent(
      admin,
      organizationId,
      studentId,
    );

    return NextResponse.json({ teachers });
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load assigned teachers.",
      code: "internal_error",
      cause: error,
    });
  }
}
