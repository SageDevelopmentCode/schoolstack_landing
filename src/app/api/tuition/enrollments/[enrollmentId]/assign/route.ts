import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { autoAssignTuitionForEnrollment } from "@/lib/tuition/assignments";
import { resolveRatePlanForEnrollmentAssignment } from "@/lib/tuition/rate-plans";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/enrollments/[enrollmentId]/assign";

type RouteContext = {
  params: Promise<{ enrollmentId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { enrollmentId } = await context.params;

  try {
    const admin = createAdminClient();

    const { data: enrollment, error: enrollmentError } = await admin
      .from("enrollments")
      .select("id, organization_id, student_id, program_id, status")
      .eq("id", enrollmentId)
      .maybeSingle();

    if (enrollmentError) throw enrollmentError;
    if (!enrollment) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Enrollment not found.",
        code: "not_found",
      });
    }

    if (enrollment.status !== "enrolled" && enrollment.status !== "pending") {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Only active enrollments can be assigned tuition.",
        code: "invalid_request",
      });
    }

    const organizationId = String(enrollment.organization_id);
    const programId = String(enrollment.program_id);
    const user = await requireSchoolAdminUser(supabase, organizationId);

    const body = (await request.json().catch(() => ({}))) as {
      ratePlanId?: string;
    };

    const resolved = await resolveRatePlanForEnrollmentAssignment(admin, {
      organizationId,
      programId,
      ratePlanId: body.ratePlanId,
    });
    if (resolved.ambiguous) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Choose a rate catalog for this student.",
        code: "rate_catalog_required",
      });
    }

    const { data: student, error: studentError } = await admin
      .from("students")
      .select("family_id")
      .eq("id", enrollment.student_id)
      .maybeSingle();

    if (studentError) throw studentError;
    if (!student?.family_id) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Family not found for enrollment.",
        code: "invalid_request",
      });
    }

    const assignment = await autoAssignTuitionForEnrollment(admin, {
      organizationId,
      enrollmentId,
      familyId: String(student.family_id),
      programId,
      assignedByUserId: user.id,
      ratePlanId: body.ratePlanId,
    });

    if (!assignment) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error:
          "No active rate plan is available for this program. Publish a rate plan first.",
        code: "no_rate_plan",
      });
    }

    return NextResponse.json({ assignment });
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
