import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  getAssignmentById,
  unassignTuitionAssignment,
} from "@/lib/tuition/assignments";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/assignments/[id]/unassign";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: assignmentId } = await context.params;

  try {
    const admin = createAdminClient();
    const assignment = await getAssignmentById(admin, assignmentId);

    if (!assignment) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Assignment not found.",
        code: "not_found",
      });
    }

    if (assignment.status !== "active") {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "This tuition assignment is not active.",
        code: "invalid_request",
      });
    }

    await requireSchoolAdminUser(supabase, assignment.organizationId);

    const updated = await unassignTuitionAssignment(admin, assignmentId);

    return NextResponse.json({ assignment: updated });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }
    throw error;
  }
}
