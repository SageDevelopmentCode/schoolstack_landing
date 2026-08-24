import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { ensureBillingAccount } from "@/lib/tuition/assignments";
import { resolveGuardianIdForUser } from "@/lib/tuition/payment-settlement";
import { createTuitionSetupCheckoutSession } from "@/lib/stripe/checkout-session";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import { buildTuitionCheckoutReturnUrls, parseCheckoutReturnTo } from "@/lib/stripe/checkout-return-urls";
import {
  getOrganizationPaymentAccount,
  isPaymentReady,
} from "@/lib/stripe/organization-payment-account";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/tuition/payment-method/setup";

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

  try {
    const user = await requireAuthenticatedUser(supabase);
    const admin = createAdminClient();

    const body = (await request.json()) as {
      organizationId?: unknown;
      familyId?: unknown;
      orgSlug?: unknown;
      returnTo?: unknown;
    };

    const organizationId =
      typeof body.organizationId === "string" ? body.organizationId : null;
    const familyId = typeof body.familyId === "string" ? body.familyId : null;
    const orgSlug = typeof body.orgSlug === "string" ? body.orgSlug : "school";

    if (!organizationId || !familyId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId and familyId are required.",
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
        error: "You do not have access to manage payment methods for this family.",
        code: "forbidden",
      });
    }

    const paymentAccount = await getOrganizationPaymentAccount(admin, organizationId);
    if (!paymentAccount || !isPaymentReady(paymentAccount)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "School payments are not set up yet.",
        code: "payments_not_ready",
      });
    }

    await ensureBillingAccount(admin, organizationId, familyId);

    const stripeCustomerId = await getOrCreateStripeCustomer(admin, {
      userId: user.id,
      email: user.email,
    });

    const returnTo = parseCheckoutReturnTo(body.returnTo);
    const { successUrl, cancelUrl } = buildTuitionCheckoutReturnUrls({
      orgSlug,
      returnTo,
      flow: "setup",
    });

    const session = await createTuitionSetupCheckoutSession({
      stripeCustomerId,
      payerUserId: user.id,
      organizationId,
      familyId,
      guardianId,
      successUrl,
      cancelUrl,
    });

    if (!session.url) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Could not start card setup.",
        code: "checkout_failed",
      });
    }

    return NextResponse.json({ checkoutUrl: session.url });
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
