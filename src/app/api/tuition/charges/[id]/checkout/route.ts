import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { getChargeById, markChargeSent } from "@/lib/tuition/charges";
import { createTuitionPaymentRecord } from "@/lib/tuition/payments";
import { createAdmissionsCheckoutSession } from "@/lib/stripe/checkout-session";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import { getSiteUrl } from "@/lib/stripe/client";
import { isCheckoutPaymentMethod } from "@/lib/stripe/processing-fee";
import {
  getOrganizationPaymentAccount,
  isPaymentReady,
} from "@/lib/stripe/organization-payment-account";
import { attachCheckoutSessionToPayment } from "@/lib/stripe/application-payments";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/charges/[id]/checkout";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: chargeId } = await context.params;

  try {
    const user = await requireAuthenticatedUser(supabase);
    const admin = createAdminClient();

    const body = (await request.json().catch(() => ({}))) as {
      paymentMethod?: unknown;
      orgSlug?: string;
    };

    if (!isCheckoutPaymentMethod(body.paymentMethod)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Choose a payment method to continue.",
        code: "invalid_payment_method",
      });
    }

    const charge = await getChargeById(admin, chargeId);
    if (!charge) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Charge not found.",
        code: "not_found",
      });
    }

    if (charge.status === "paid") {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "This charge has already been paid.",
        code: "already_paid",
      });
    }

    const { data: guardian, error: guardianError } = await admin
      .from("guardians")
      .select("id")
      .eq("family_id", charge.familyId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (guardianError) throw guardianError;

    const { data: membership, error: membershipError } = await admin
      .from("organization_memberships")
      .select("role")
      .eq("organization_id", charge.organizationId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (membershipError) throw membershipError;

    const isAdmin = membership?.role === "owner" || membership?.role === "admin";
    if (!guardian && !isAdmin) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to pay this charge.",
        code: "forbidden",
      });
    }

    const paymentAccount = await getOrganizationPaymentAccount(
      admin,
      charge.organizationId,
    );
    if (!paymentAccount || !isPaymentReady(paymentAccount)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "School payments are not set up yet.",
        code: "payments_not_ready",
      });
    }

    const stripeCustomerId = await getOrCreateStripeCustomer(admin, user.id);
    const payment = await createTuitionPaymentRecord(admin, {
      organizationId: charge.organizationId,
      familyId: charge.familyId,
      tuitionChargeId: charge.id,
      amountCents: charge.amountCents,
      label: charge.label,
      payerUserId: user.id,
      currency: charge.currency,
    });

    const orgSlug = typeof body.orgSlug === "string" ? body.orgSlug : "school";
    const baseUrl = getSiteUrl();
    const successUrl = `${baseUrl}/school/${orgSlug}/parent/billing?paid=1`;
    const cancelUrl = `${baseUrl}/school/${orgSlug}/parent/billing?cancelled=1`;

    const { session, quote } = await createAdmissionsCheckoutSession({
      netAmountCents: charge.amountCents,
      paymentMethod: body.paymentMethod,
      label: charge.label,
      stripeConnectAccountId: paymentAccount.stripeConnectAccountId,
      stripeCustomerId,
      payerUserId: user.id,
      successUrl,
      cancelUrl,
      paymentId: payment.id,
      paymentIntentMetadata: {
        payment_type: "tuition",
        tuition_charge_id: charge.id,
        organization_id: charge.organizationId,
      },
      sessionMetadata: {
        payment_type: "tuition",
        tuition_charge_id: charge.id,
        organization_id: charge.organizationId,
      },
    });

    await attachCheckoutSessionToPayment(admin, payment.id, session.id);
    await markChargeSent(admin, charge.id);

    return NextResponse.json({
      checkoutUrl: session.url,
      processingFeeCents: quote.processingFeeCents,
      grossAmountCents: quote.grossAmountCents,
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
