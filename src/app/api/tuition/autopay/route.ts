import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { ensureBillingAccount } from "@/lib/tuition/assignments";
import {
  getDefaultPaymentMethodForGuardian,
  formatPaymentMethodLabel,
} from "@/lib/tuition/payment-methods";
import {
  getAutopayEnabledForGuardian,
  resolveGuardianIdForUser,
  setAutopayForGuardian,
} from "@/lib/tuition/payment-settlement";
import { rowToBillingAccount } from "@/lib/tuition/row-mappers";
import {
  ACTIVITY_ACTIONS,
  logTuitionActivity,
  parentActivityContext,
  summarizeAutopayToggle,
} from "@/lib/tuition/tuition-activity";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/autopay";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const user = await requireAuthenticatedUser(supabase);
    const admin = createAdminClient();

    const body = (await request.json()) as {
      organizationId?: unknown;
      familyId?: unknown;
      enabled?: unknown;
    };

    const organizationId =
      typeof body.organizationId === "string" ? body.organizationId : null;
    const familyId = typeof body.familyId === "string" ? body.familyId : null;
    const enabled = typeof body.enabled === "boolean" ? body.enabled : null;

    if (!organizationId || !familyId || enabled === null) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId, familyId, and enabled are required.",
        code: "invalid_request",
      });
    }

    const guardianId = await resolveGuardianIdForUser(admin, {
      familyId,
      userId: user.id,
    });

    if (!guardianId) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to update autopay for this family.",
        code: "forbidden",
      });
    }

    await ensureBillingAccount(admin, organizationId, familyId);
    await setAutopayForGuardian(admin, {
      organizationId,
      familyId,
      guardianId,
      enabled,
    });

    const { data: account, error: accountError } = await admin
      .from("tuition_billing_accounts")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("family_id", familyId)
      .maybeSingle();

    if (accountError) throw accountError;

    const billingAccount = account ? rowToBillingAccount(account) : null;
    const autopayEnabled = billingAccount
      ? getAutopayEnabledForGuardian(billingAccount, guardianId)
      : enabled;

    const savedPaymentMethod = billingAccount
      ? await getDefaultPaymentMethodForGuardian(admin, {
          billingAccountId: billingAccount.id,
          guardianId,
          defaultPaymentMethodId: billingAccount.defaultPaymentMethodId,
        })
      : null;

    const savedPaymentMethodLabel = formatPaymentMethodLabel(savedPaymentMethod);

    const { data: family } = await admin
      .from("families")
      .select("name")
      .eq("id", familyId)
      .maybeSingle();

    const familyName =
      typeof family?.name === "string" ? family.name : undefined;

    void logTuitionActivity(admin, {
      organizationId,
      action: enabled
        ? ACTIVITY_ACTIONS.TUITION_AUTOPAY_ENABLED
        : ACTIVITY_ACTIONS.TUITION_AUTOPAY_DISABLED,
      entityType: "family",
      entityId: familyId,
      summary: enabled ? "Autopay enabled" : "Autopay disabled",
      changeSummary: summarizeAutopayToggle({
        enabled,
        familyName,
        paymentMethodLabel: enabled ? savedPaymentMethodLabel ?? undefined : undefined,
      }),
      logWhenEmpty: true,
      metadata: {
        familyId,
        familyName: familyName ?? null,
        guardianId,
        enabled,
      },
      context: parentActivityContext(user),
    });

    return NextResponse.json({
      autopayEnabled,
      savedPaymentMethod,
      savedPaymentMethodLabel,
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
