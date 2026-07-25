import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { autoAssignTuitionForEnrollment } from "@/lib/tuition/assignments";
import { listUnassignedEnrollmentsForOrganization } from "@/lib/tuition/tuition-readiness";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/assign-unassigned";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const admin = createAdminClient();
    const body = (await request.json()) as { organizationId?: string };

    if (!body.organizationId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId is required.",
        code: "invalid_request",
      });
    }

    const organizationId = body.organizationId;
    const user = await requireSchoolAdminUser(supabase, organizationId);

    const unassigned = await listUnassignedEnrollmentsForOrganization(
      admin,
      organizationId,
    );

    const results: Array<{
      enrollmentId: string;
      assignmentId: string | null;
      error: string | null;
    }> = [];

    for (const record of unassigned) {
      try {
        const assignment = await autoAssignTuitionForEnrollment(admin, {
          organizationId,
          enrollmentId: record.enrollmentId,
          familyId: record.familyId,
          programId: record.programId,
          assignedByUserId: user.id,
        });

        results.push({
          enrollmentId: record.enrollmentId,
          assignmentId: assignment?.id ?? null,
          error: assignment
            ? null
            : "No active rate plan is available for this program.",
        });
      } catch (error) {
        results.push({
          enrollmentId: record.enrollmentId,
          assignmentId: null,
          error: error instanceof Error ? error.message : "Assignment failed.",
        });
      }
    }

    const assignedCount = results.filter((result) => result.assignmentId).length;
    const failedCount = results.filter((result) => result.error).length;

    return NextResponse.json({
      assignedCount,
      failedCount,
      total: unassigned.length,
      results,
    });
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
