import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { getChargeById, listChargesForAssignment, markChargeSent } from "@/lib/tuition/charges";
import { chargeRemainingCents } from "@/lib/tuition/billing-splits";
import { getAssignmentPaymentContext } from "@/lib/tuition/family-checklist-responses";
import { maxTuitionPayCents } from "@/lib/tuition/tuition-pay-amount";
import { createTuitionPaymentRecord } from "@/lib/tuition/payments";
import { getStudentNameForCharge } from "@/lib/tuition/tuition-charge-student";
import { buildTuitionCheckoutLineItem, buildTuitionCheckoutLineItems } from "@/lib/tuition/tuition-checkout-line-item";
import { createAdmissionsCheckoutSession, createTuitionCheckoutSession } from "@/lib/stripe/checkout-session";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import { getStripeClient, getSiteUrl } from "@/lib/stripe/client";
import { isCheckoutPaymentMethod, quoteProcessingFee } from "@/lib/stripe/processing-fee";
import {
  getOrganizationPaymentAccount,
  isPaymentReady,
} from "@/lib/stripe/organization-payment-account";
import {
  attachCheckoutSessionToPayment,
  listPendingPaymentsForTuitionCharge,
  markPaymentFailed,
  updatePaymentCheckoutDetails,
} from "@/lib/stripe/application-payments";
import {
  expireOpenCheckoutSession,
  pendingCheckoutMatchesRequest,
} from "@/lib/stripe/pending-checkout-session";
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
      amountCents?: unknown;
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

    const remainingCents = chargeRemainingCents(charge);
    if (remainingCents <= 0) {
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

    if (
      guardian &&
      charge.guardianId &&
      charge.guardianId !== String(guardian.id)
    ) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "This charge belongs to another payer on the account.",
        code: "forbidden",
      });
    }

    const requestedAmountCents =
      typeof body.amountCents === "number" && Number.isFinite(body.amountCents)
        ? Math.round(body.amountCents)
        : remainingCents;

    if (requestedAmountCents < remainingCents) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Payment must cover at least the remaining balance.",
        code: "invalid_amount",
      });
    }

    const assignmentCharges = await listChargesForAssignment(
      admin,
      charge.assignmentId,
    );
    const { payRemainingYearCents } = getAssignmentPaymentContext(
      assignmentCharges,
      charge.assignmentId,
      charge.id,
    );
    const maxOverpayCents = maxTuitionPayCents({
      remainingCents,
      payRemainingYearCents:
        payRemainingYearCents > remainingCents ? payRemainingYearCents : undefined,
    });
    if (requestedAmountCents > maxOverpayCents) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Payment amount is too large.",
        code: "invalid_amount",
      });
    }

    const paymentAccount = await getOrganizationPaymentAccount(
      admin,
      charge.organizationId,
    );
    const stripeConnectAccountId = paymentAccount?.stripeConnectAccountId;
    if (!paymentAccount || !stripeConnectAccountId || !isPaymentReady(paymentAccount)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "School payments are not set up yet.",
        code: "payments_not_ready",
      });
    }

    const stripeCustomerId = await getOrCreateStripeCustomer(admin, {
      userId: user.id,
      email: user.email,
    });

    const stripe = getStripeClient();
    const isLumpSum = requestedAmountCents > remainingCents;
    const pendingPayments = await listPendingPaymentsForTuitionCharge(
      admin,
      charge.id,
    );

    for (const pendingPayment of pendingPayments) {
      if (!pendingPayment.stripeCheckoutSessionId) continue;

      const existingSession = await stripe.checkout.sessions.retrieve(
        pendingPayment.stripeCheckoutSessionId,
      );

      if (existingSession.status === "open" && existingSession.url) {
        if (
          pendingCheckoutMatchesRequest({
            pendingPayment,
            requestedAmountCents,
            paymentMethod: body.paymentMethod,
            isLumpSum,
            sessionMetadata: existingSession.metadata,
          })
        ) {
          return NextResponse.json({
            checkoutUrl: existingSession.url,
            processingFeeCents:
              typeof existingSession.metadata?.processing_fee_cents === "string"
                ? Number(existingSession.metadata.processing_fee_cents)
                : 0,
            grossAmountCents:
              typeof existingSession.metadata?.gross_amount_cents === "string"
                ? Number(existingSession.metadata.gross_amount_cents)
                : pendingPayment.amountCents,
          });
        }

        await expireOpenCheckoutSession(
          stripe,
          pendingPayment.stripeCheckoutSessionId,
        );
        await markPaymentFailed(admin, pendingPayment.id, {
          stripeCheckoutSessionId: pendingPayment.stripeCheckoutSessionId,
        });
        continue;
      }

      if (existingSession.status === "expired") {
        await markPaymentFailed(admin, pendingPayment.id, {
          stripeCheckoutSessionId: pendingPayment.stripeCheckoutSessionId,
        });
      }
    }

    const studentName = await getStudentNameForCharge(admin, charge.id);
    const quote = quoteProcessingFee(requestedAmountCents, body.paymentMethod);

    const payment = await createTuitionPaymentRecord(admin, {
      organizationId: charge.organizationId,
      familyId: charge.familyId,
      tuitionChargeId: charge.id,
      amountCents: requestedAmountCents,
      label: charge.label,
      payerUserId: user.id,
      currency: charge.currency,
      paymentMethodType: body.paymentMethod,
      chargedAmountCents: quote.grossAmountCents,
      processingFeeCents: quote.processingFeeCents,
    });

    const orgSlug = typeof body.orgSlug === "string" ? body.orgSlug : "school";
    const baseUrl = getSiteUrl();
    const successUrl = `${baseUrl}/school/${orgSlug}/parent/billing?paid=1`;
    const cancelUrl = `${baseUrl}/school/${orgSlug}/parent/billing?cancelled=1`;

    const tuitionMetadata = {
      payment_type: "tuition",
      tuition_charge_id: charge.id,
      organization_id: charge.organizationId,
      ...(studentName ? { student_name: studentName } : {}),
      payment_kind: isLumpSum ? "lump_sum" : "installment",
    };

    let session;
    let processingFeeCents: number;
    let grossAmountCents: number;

    if (isLumpSum) {
      const breakdown = buildTuitionCheckoutLineItems({
        studentName,
        chargeLabel: charge.label,
        remainingCents,
        requestedAmountCents,
        processingFeeCents: quote.processingFeeCents,
        paymentMethod: body.paymentMethod,
      });

      const result = await createTuitionCheckoutSession({
        lineItems: breakdown.lineItems,
        netToSchoolCents: breakdown.netToSchoolCents,
        paymentMethod: body.paymentMethod,
        stripeConnectAccountId,
        stripeCustomerId,
        payerUserId: user.id,
        successUrl,
        cancelUrl,
        paymentId: payment.id,
        paymentIntentMetadata: tuitionMetadata,
        sessionMetadata: tuitionMetadata,
      });

      session = result.session;
      processingFeeCents = result.processingFeeCents;
      grossAmountCents = result.grossAmountCents;
    } else {
      const checkoutLineItem = buildTuitionCheckoutLineItem({
        studentName,
        chargeLabel: charge.label,
        remainingCents,
        requestedAmountCents,
        processingFeeCents: quote.processingFeeCents,
      });

      const result = await createAdmissionsCheckoutSession({
        netAmountCents: requestedAmountCents,
        paymentMethod: body.paymentMethod,
        label: checkoutLineItem.label,
        description: checkoutLineItem.description,
        stripeConnectAccountId,
        stripeCustomerId,
        payerUserId: user.id,
        successUrl,
        cancelUrl,
        paymentId: payment.id,
        paymentIntentMetadata: tuitionMetadata,
        sessionMetadata: tuitionMetadata,
      });

      session = result.session;
      processingFeeCents = result.quote.processingFeeCents;
      grossAmountCents = result.quote.grossAmountCents;
    }

    if (
      processingFeeCents !== quote.processingFeeCents ||
      grossAmountCents !== quote.grossAmountCents
    ) {
      await updatePaymentCheckoutDetails(admin, payment.id, {
        paymentMethodType: body.paymentMethod,
        chargedAmountCents: grossAmountCents,
        processingFeeCents,
      });
    }

    await attachCheckoutSessionToPayment(admin, payment.id, session.id);
    await markChargeSent(admin, charge.id);

    return NextResponse.json({
      checkoutUrl: session.url,
      processingFeeCents,
      grossAmountCents,
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
