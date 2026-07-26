import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AuthError,
  getFamilyIdsForUser,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import {
  finalizeEnrollmentPaymentPlan,
  getAssignmentForEnrollment,
} from "@/lib/tuition/assignments";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/enrollments/[enrollmentId]/payment-plan";

type RouteContext = {
  params: Promise<{ enrollmentId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { enrollmentId } = await context.params;

  try {
    const user = await requireAuthenticatedUser(supabase);
    const admin = createAdminClient();

    const { data: enrollment, error: enrollmentError } = await admin
      .from("enrollments")
      .select("id, organization_id, student_id")
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

    const organizationId = String(enrollment.organization_id);

    const { data: student, error: studentError } = await admin
      .from("students")
      .select("family_id")
      .eq("id", enrollment.student_id)
      .maybeSingle();

    if (studentError) throw studentError;
    if (!student?.family_id) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "Family not found for enrollment.",
        code: "forbidden",
      });
    }

    const familyId = String(student.family_id);
    const familyIds = await getFamilyIdsForUser(supabase, user.id, organizationId);
    const isGuardian = familyIds.includes(familyId);

    if (!isGuardian) {
      const { data: membership } = await admin
        .from("organization_memberships")
        .select("role")
        .eq("organization_id", organizationId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (membership?.role !== "owner" && membership?.role !== "admin") {
        return apiError(ROUTE, {
          request,
          status: 403,
          error: "You do not have access to this enrollment.",
          code: "forbidden",
        });
      }
    }

    const assignment = await getAssignmentForEnrollment(admin, enrollmentId);
    if (!assignment) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Tuition assignment not found.",
        code: "not_found",
      });
    }

    const body = (await request.json()) as { paymentPlanId?: string };
    if (!body.paymentPlanId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Payment plan is required.",
        code: "invalid_request",
      });
    }

    const updated = await finalizeEnrollmentPaymentPlan(admin, {
      assignmentId: assignment.id,
      paymentPlanId: body.paymentPlanId,
    });

    return NextResponse.json({ assignment: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }
    if (error instanceof Error) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: error.message,
        code: "invalid_request",
      });
    }
    throw error;
  }
}
