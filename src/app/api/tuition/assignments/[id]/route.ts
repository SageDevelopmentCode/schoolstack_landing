import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { isPaymentPlanAllowedForBillingStart } from "@/lib/tuition/billing-start";
import {
  getAssignmentById,
  updateAssignment,
} from "@/lib/tuition/assignments";
import { getRatePlanWithDetails } from "@/lib/tuition/rate-plans";
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
      effectiveStart?: string | null;
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

    const ratePlan = await getRatePlanWithDetails(admin, assignment.ratePlanId);
    if (!ratePlan) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Rate plan not found.",
        code: "not_found",
      });
    }

    let paymentPlanInstallmentCount: number | null = null;
    if (body.paymentPlanId) {
      const paymentPlan = ratePlan.paymentPlans.find(
        (plan) => plan.id === body.paymentPlanId,
      );
      if (!paymentPlan) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "Invalid payment plan for this assignment.",
          code: "invalid_payment_plan",
        });
      }
      paymentPlanInstallmentCount = paymentPlan.installmentCount;
    } else {
      const currentPlan = ratePlan.paymentPlans.find(
        (plan) => plan.id === assignment.paymentPlanId,
      );
      paymentPlanInstallmentCount = currentPlan?.installmentCount ?? null;
    }

    const billingStart =
      body.effectiveStart !== undefined
        ? body.effectiveStart
        : assignment.effectiveStart;

    if (
      billingStart &&
      paymentPlanInstallmentCount != null &&
      !isPaymentPlanAllowedForBillingStart(
        paymentPlanInstallmentCount,
        ratePlan.effectiveStart,
        ratePlan.effectiveEnd,
        billingStart,
      )
    ) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error:
          "This payment schedule has too many installments for the remaining school year.",
        code: "invalid_payment_plan",
      });
    }

    if (
      body.effectiveStart &&
      !/^\d{4}-\d{2}-\d{2}$/.test(body.effectiveStart)
    ) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Billing start must be a valid date (YYYY-MM-DD).",
        code: "invalid_billing_start",
      });
    }

    let metadata: typeof assignment.metadata | undefined;
    if (body.paymentPlanId != null || body.effectiveStart !== undefined) {
      metadata = { ...assignment.metadata };
      if (body.paymentPlanId != null) {
        metadata.pendingPaymentPlanSelection = false;
      }
      if (body.effectiveStart !== undefined) {
        metadata.billingStartLocked = true;
      }
    }

    const updated = await updateAssignment(admin, assignmentId, {
      rateTierId: body.rateTierId,
      paymentPlanId: body.paymentPlanId,
      effectiveStart: body.effectiveStart,
      metadata,
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
