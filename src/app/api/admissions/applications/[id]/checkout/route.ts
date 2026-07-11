import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AuthError,
  requireAuthenticatedUser,
  userOwnsApplication,
} from "@/lib/admissions/application-auth";
import {
  getApplicationForSubmit,
  loadPublishedFormForApplication,
} from "@/lib/admissions/application-submit";
import { publicApplicationFormPath } from "@/lib/admissions/application-forms";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import {
  attachCheckoutSessionToPayment,
  createApplicationPayment,
} from "@/lib/stripe/application-payments";
import { createAdmissionsCheckoutSession } from "@/lib/stripe/checkout-session";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import { getSiteUrl } from "@/lib/stripe/client";
import {
  isCheckoutPaymentMethod,
  quoteProcessingFee,
} from "@/lib/stripe/processing-fee";
import {
  getOrganizationPaymentAccount,
  isPaymentReady,
} from "@/lib/stripe/organization-payment-account";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/applications/[id]/checkout";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: applicationId } = await context.params;

  try {
    const user = await requireAuthenticatedUser(supabase);
    const ownsApplication = await userOwnsApplication(
      supabase,
      user.id,
      applicationId,
    );

    if (!ownsApplication) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Application not found.",
        code: "not_found",
      });
    }

    const body = (await request.json().catch(() => ({}))) as {
      paymentMethod?: unknown;
    };
    if (!isCheckoutPaymentMethod(body.paymentMethod)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Choose a payment method to continue.",
        code: "invalid_payment_method",
      });
    }

    const admin = createAdminClient();
    const application = await getApplicationForSubmit(admin, applicationId);

    if (!application) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Application not found.",
        code: "not_found",
      });
    }

    if (application.status !== "draft") {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "This application has already been submitted.",
        code: "not_draft",
      });
    }

    if (application.feeStatus !== "pending") {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "No payment is required for this application.",
        code: "fee_not_pending",
      });
    }

    const { feeConfig, publicSlug } = await loadPublishedFormForApplication(
      admin,
      application,
    );

    if (!feeConfig.enabled) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "This application does not require a fee.",
        code: "fee_disabled",
      });
    }

    const amountCents = feeConfig.amount_cents ?? 0;
    if (amountCents <= 0) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Application fee amount is invalid.",
        code: "invalid_amount",
      });
    }

    const paymentAccount = await getOrganizationPaymentAccount(
      admin,
      application.organizationId,
    );

    if (!isPaymentReady(paymentAccount) || !paymentAccount?.stripeConnectAccountId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Online payments are not set up for this school yet.",
        code: "payments_not_ready",
      });
    }

    if (!publicSlug) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Application form is missing a public URL.",
        code: "missing_slug",
      });
    }

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("slug")
      .eq("id", application.organizationId)
      .maybeSingle();

    if (orgError || !org?.slug) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "org_not_found",
        cause: orgError,
      });
    }

    const feeLabel = feeConfig.label ?? "Application fee";
    const quote = quoteProcessingFee(amountCents, body.paymentMethod);

    const stripeCustomerId = await getOrCreateStripeCustomer(admin, {
      userId: user.id,
      email: user.email,
    });

    const payment = await createApplicationPayment(admin, {
      organizationId: application.organizationId,
      applicationId: application.id,
      amountCents: quote.netAmountCents,
      chargedAmountCents: quote.grossAmountCents,
      processingFeeCents: quote.processingFeeCents,
      paymentMethodType: quote.paymentMethod,
      currency: "USD",
      label: feeLabel,
      payerUserId: user.id,
    });

    const formPath = publicApplicationFormPath(String(org.slug), publicSlug);
    const { session } = await createAdmissionsCheckoutSession({
      netAmountCents: amountCents,
      paymentMethod: body.paymentMethod,
      label: feeLabel,
      stripeConnectAccountId: paymentAccount.stripeConnectAccountId,
      stripeCustomerId,
      payerUserId: user.id,
      successUrl: `${getSiteUrl()}${formPath}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${getSiteUrl()}${formPath}?payment=cancelled`,
      paymentId: payment.id,
      paymentIntentMetadata: {
        application_id: application.id,
        organization_id: application.organizationId,
      },
      sessionMetadata: {
        application_id: application.id,
        organization_id: application.organizationId,
      },
    });

    if (session.id) {
      await attachCheckoutSessionToPayment(admin, payment.id, session.id);
    }

    if (!session.url) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to create checkout session.",
        code: "checkout_failed",
      });
    }

    void logActivityEvent(admin, {
      organizationId: application.organizationId,
      actorType: "parent",
      actorUserId: user.id,
      actorEmail: user.email,
      surface: "public_apply",
      action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_STARTED,
      entityType: "application",
      entityId: application.id,
      summary: `Application fee checkout started ($${(quote.grossAmountCents / 100).toFixed(2)})`,
      metadata: {
        paymentId: payment.id,
        amountCents: quote.netAmountCents,
        chargedAmountCents: quote.grossAmountCents,
        processingFeeCents: quote.processingFeeCents,
        paymentMethod: quote.paymentMethod,
        checkoutSessionId: session.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to start checkout.",
      code: "internal_error",
      cause: error,
    });
  }
}
