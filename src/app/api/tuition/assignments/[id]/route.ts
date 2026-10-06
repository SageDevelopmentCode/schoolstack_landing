import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AuthError,
} from "@/lib/admissions/application-auth";
import { requireAuthenticatedUser } from "@/lib/admissions/application-auth-server";
import { isPaymentPlanAllowedForBillingStart } from "@/lib/tuition/billing-start";
import {
  getAssignmentById,
  shouldSetBillingStartLocked,
  updateAssignment,
} from "@/lib/tuition/assignments";
import {
  getRatePlanWithDetails,
  resolveRatePlanForEnrollmentAssignment,
} from "@/lib/tuition/rate-plans";
import { getDefaultTierForRatePlan, getTierById } from "@/lib/tuition/rate-tiers";
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
    const user = await requireAuthenticatedUser(supabase, request);
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
      ratePlanId?: string;
      rateTierId?: string | null;
      paymentPlanId?: string;
      effectiveStart?: string | null;
    };

    const { data: enrollment, error: enrollmentError } = await admin
      .from("enrollments")
      .select("program_id")
      .eq("id", assignment.enrollmentId)
      .maybeSingle();

    if (enrollmentError) throw enrollmentError;
    if (!enrollment?.program_id) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Enrollment program not found.",
        code: "invalid_request",
      });
    }

    const programId = String(enrollment.program_id);
    let targetRatePlanId = assignment.ratePlanId;
    let rateTierId = body.rateTierId;
    let paymentPlanId = body.paymentPlanId;
    let metadata: typeof assignment.metadata | undefined;

    if (body.ratePlanId && body.ratePlanId !== assignment.ratePlanId) {
      try {
        const resolved = await resolveRatePlanForEnrollmentAssignment(admin, {
          organizationId: assignment.organizationId,
          programId,
          ratePlanId: body.ratePlanId,
        });
        if (!resolved.ratePlan) {
          return apiError(ROUTE, {
            request,
            status: 400,
            error: "Invalid rate catalog for this enrollment.",
            code: "invalid_rate_plan",
          });
        }
        const newPlan = resolved.ratePlan;
        targetRatePlanId = newPlan.id;
        const defaultPaymentPlan =
          newPlan.paymentPlans.find((plan) => plan.isDefault) ??
          newPlan.paymentPlans[0];
        if (!defaultPaymentPlan) {
          return apiError(ROUTE, {
            request,
            status: 400,
            error: "Rate catalog has no payment schedules.",
            code: "invalid_rate_plan",
          });
        }
        const defaultTier = await getDefaultTierForRatePlan(admin, newPlan.id);
        rateTierId = defaultTier?.id ?? null;
        paymentPlanId = defaultPaymentPlan.id;
        metadata = {
          ...assignment.metadata,
          pendingPaymentPlanSelection: newPlan.paymentPlans.length > 1,
        };
      } catch {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "Invalid rate catalog for this enrollment.",
          code: "invalid_rate_plan",
        });
      }
    }

    if (rateTierId) {
      const tier = await getTierById(admin, rateTierId);
      if (!tier || tier.ratePlanId !== targetRatePlanId) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "Invalid tuition rate tier for this assignment.",
          code: "invalid_tier",
        });
      }
    }

    const ratePlan = await getRatePlanWithDetails(admin, targetRatePlanId);
    if (!ratePlan) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Rate plan not found.",
        code: "not_found",
      });
    }

    let paymentPlanInstallmentCount: number | null = null;
    if (paymentPlanId) {
      const paymentPlan = ratePlan.paymentPlans.find(
        (plan) => plan.id === paymentPlanId,
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

    const ratePlanChanged =
      body.ratePlanId != null && body.ratePlanId !== assignment.ratePlanId;

    if (metadata === undefined && (paymentPlanId != null || body.effectiveStart !== undefined)) {
      metadata = { ...assignment.metadata };
    }
    if (metadata && paymentPlanId != null && !ratePlanChanged) {
      metadata.pendingPaymentPlanSelection = false;
    }
    if (
      metadata &&
      body.effectiveStart !== undefined &&
      shouldSetBillingStartLocked(assignment.effectiveStart, body.effectiveStart)
    ) {
      metadata.billingStartLocked = true;
    }

    const updated = await updateAssignment(admin, assignmentId, {
      ratePlanId:
        body.ratePlanId && body.ratePlanId !== assignment.ratePlanId
          ? targetRatePlanId
          : undefined,
      rateTierId,
      paymentPlanId,
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
