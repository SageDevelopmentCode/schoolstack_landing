import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import {
  getAssignmentById,
  updateAssignment,
} from "@/lib/tuition/assignments";
import { getTierById } from "@/lib/tuition/rate-tiers";
import { schoolAdminActivityContext } from "@/lib/tuition/tuition-activity";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/assignments/[id]";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: assignmentId } = await context.params;

  try {
    const user = await requireAuthenticatedUser(supabase);
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

    const { data: membership, error: membershipError } = await admin
      .from("organization_memberships")
      .select("role")
      .eq("organization_id", assignment.organizationId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (membershipError) throw membershipError;
    if (membership?.role !== "owner" && membership?.role !== "admin") {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "Admin access required.",
        code: "forbidden",
      });
    }

    const body = (await request.json()) as {
      rateTierId?: string | null;
      paymentPlanId?: string;
    };

    if (body.rateTierId) {
      const tier = await getTierById(admin, body.rateTierId);
      if (!tier || tier.ratePlanId !== assignment.ratePlanId) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "Invalid tuition rate tier for this assignment.",
          code: "invalid_tier",
        });
      }
    }

    if (body.paymentPlanId) {
      const { data: paymentPlan, error: planError } = await admin
        .from("tuition_payment_plans")
        .select("id, rate_plan_id")
        .eq("id", body.paymentPlanId)
        .maybeSingle();

      if (planError) throw planError;
      if (!paymentPlan || String(paymentPlan.rate_plan_id) !== assignment.ratePlanId) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "Invalid payment plan for this assignment.",
          code: "invalid_payment_plan",
        });
      }
    }

    const updated = await updateAssignment(admin, assignmentId, {
      rateTierId: body.rateTierId,
      paymentPlanId: body.paymentPlanId,
      metadata:
        body.paymentPlanId != null
          ? { pendingPaymentPlanSelection: false }
          : undefined,
    }, { context: schoolAdminActivityContext(user) });

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
    throw error;
  }
}
