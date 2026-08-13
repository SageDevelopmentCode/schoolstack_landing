import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { requireTuitionOrgAdmin } from "@/lib/tuition/api-auth";
import { markOverdueCharges } from "@/lib/tuition/charge-generator";
import { applyLateFeesForOrganization, getGraceDaysForSettings } from "@/lib/tuition/late-fees";
import { processAutopayForOrganization } from "@/lib/tuition/autopay";
import { getTuitionOrgSettings } from "@/lib/tuition/org-settings";
import { evaluateRulesForOrganization } from "@/lib/tuition/rules-engine";
import {
  ACTIVITY_ACTIONS,
  logTuitionActivity,
  schoolAdminActivityContext,
  summarizeBillingRunSummary,
} from "@/lib/tuition/tuition-activity";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/process-due";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const user = await requireAuthenticatedUser(supabase);
    const admin = createAdminClient();
    const body = (await request.json()) as {
      organizationId?: string;
      graceDays?: number;
    };

    if (!body.organizationId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId is required.",
        code: "invalid_request",
      });
    }

    await requireTuitionOrgAdmin(admin, body.organizationId, user.id);

    const settings = await getTuitionOrgSettings(admin, body.organizationId);
    const graceDays = body.graceDays ?? getGraceDaysForSettings(settings);

    const overdueCount = await markOverdueCharges(
      admin,
      body.organizationId,
      graceDays,
    );
    const rulesEvaluated = await evaluateRulesForOrganization(
      admin,
      body.organizationId,
    );
    const lateFeeResult = await applyLateFeesForOrganization(
      admin,
      body.organizationId,
    );
    const autopayResult = await processAutopayForOrganization(
      admin,
      body.organizationId,
    );

    void logTuitionActivity(admin, {
      organizationId: body.organizationId,
      action: ACTIVITY_ACTIONS.TUITION_BILLING_RUN_COMPLETED,
      entityType: "organization",
      entityId: body.organizationId,
      summary: "Manual tuition billing run completed",
      changeSummary: summarizeBillingRunSummary(
        {
          overdueCount,
          rulesEvaluated,
          lateFeesApplied: lateFeeResult.applied,
          lateFeesNotified: lateFeeResult.notified,
          autopayProcessed: autopayResult.processed,
          autopayFailed: autopayResult.failed,
          autopaySkipped: autopayResult.skipped,
        },
        { manual: true },
      ),
      logWhenEmpty: true,
      metadata: { manual: true },
      context: schoolAdminActivityContext(user),
    });

    if (lateFeeResult.applied > 0) {
      void logTuitionActivity(admin, {
        organizationId: body.organizationId,
        action: ACTIVITY_ACTIONS.TUITION_LATE_FEE_APPLIED,
        entityType: "organization",
        entityId: body.organizationId,
        summary: `Applied ${lateFeeResult.applied} late fee${lateFeeResult.applied === 1 ? "" : "s"}`,
        changeSummary: {
          changedFields: ["lateFees"],
          changes: [
            `Applied ${lateFeeResult.applied} late fee${lateFeeResult.applied === 1 ? "" : "s"}`,
          ],
        },
        logWhenEmpty: true,
        context: schoolAdminActivityContext(user),
      });
    }

    return NextResponse.json({
      overdueCount,
      rulesEvaluated,
      lateFeesApplied: lateFeeResult.applied,
      lateFeesNotified: lateFeeResult.notified,
      autopayProcessed: autopayResult.processed,
      autopayFailed: autopayResult.failed,
      autopaySkipped: autopayResult.skipped,
    });
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
