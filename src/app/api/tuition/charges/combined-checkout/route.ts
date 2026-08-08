import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  attachCheckoutSessionToPayments,
  listPendingPaymentsForTuitionCharge,
  markPaymentFailed,
} from "@/lib/stripe/application-payments";
import {
  expireOpenCheckoutSession,
  pendingCombinedCheckoutMatchesRequest,
} from "@/lib/stripe/pending-checkout-session";
import { createCombinedAdmissionsCheckoutSession } from "@/lib/stripe/checkout-session";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import { getStripeClient, getSiteUrl } from "@/lib/stripe/client";
import { isCheckoutPaymentMethod } from "@/lib/stripe/processing-fee";
import {
  getOrganizationPaymentAccount,
  isPaymentReady,
} from "@/lib/stripe/organization-payment-account";
import { getChargeById, listChargesForFamily, markChargeSent } from "@/lib/tuition/charges";
import { chargeRemainingCents } from "@/lib/tuition/billing-splits";
import {
  attachStudentNamesToCombinedCandidates,
  buildCombinedTuitionPaymentQuote,
  validateCombinedTuitionChargeIds,
} from "@/lib/tuition/combined-tuition-payment";
import { createTuitionPaymentRecord } from "@/lib/tuition/payments";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/charges/combined-checkout";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const user = await requireAuthenticatedUser(supabase);
    const admin = createAdminClient();

    const body = (await request.json().catch(() => ({}))) as {
      paymentMethod?: unknown;
      orgSlug?: string;
      chargeIds?: unknown;
    };

    if (!isCheckoutPaymentMethod(body.paymentMethod)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Choose a payment method to continue.",
        code: "invalid_payment_method",
      });
    }

    const chargeIds = Array.isArray(body.chargeIds)
      ? body.chargeIds.filter((value): value is string => typeof value === "string")
      : [];

    const loadedCharges = (
      await Promise.all(chargeIds.map((chargeId) => getChargeById(admin, chargeId)))
    ).filter((charge): charge is NonNullable<typeof charge> => charge != null);

    const firstLoadedCharge = loadedCharges[0];
    const allFamilyCharges = firstLoadedCharge
      ? await listChargesForFamily(admin, firstLoadedCharge.familyId)
      : [];
    const allOpenChargesOnDueDate = firstLoadedCharge
      ? allFamilyCharges.filter(
          (charge) =>
            charge.dueDate === firstLoadedCharge.dueDate &&
            ["scheduled", "sent", "overdue"].includes(charge.status) &&
            chargeRemainingCents(charge) > 0,
        )
      : [];

    const validation = validateCombinedTuitionChargeIds({
      chargeIds,
      charges: loadedCharges,
      allOpenChargesOnDueDate,
    });

    if (!validation.ok) {
      return apiError(ROUTE, {
        request,
        status: validation.status,
        error: validation.error,
        code: validation.code,
      });
    }

    const candidates = await attachStudentNamesToCombinedCandidates(
      admin,
      validation.candidates,
    );
    const firstCharge = candidates[0]!.charge;

    const { data: guardian, error: guardianError } = await admin
      .from("guardians")
      .select("id")
      .eq("family_id", firstCharge.familyId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (guardianError) throw guardianError;

    const { data: membership, error: membershipError } = await admin
      .from("organization_memberships")
      .select("role")
      .eq("organization_id", firstCharge.organizationId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (membershipError) throw membershipError;

    const isAdmin = membership?.role === "owner" || membership?.role === "admin";
    if (!guardian && !isAdmin) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to pay these charges.",
        code: "forbidden",
      });
    }

    for (const candidate of candidates) {
      if (
        guardian &&
        candidate.charge.guardianId &&
        candidate.charge.guardianId !== String(guardian.id)
      ) {
        return apiError(ROUTE, {
          request,
          status: 403,
          error: "One or more charges belong to another payer on the account.",
          code: "forbidden",
        });
      }
    }

    const paymentAccount = await getOrganizationPaymentAccount(
      admin,
      firstCharge.organizationId,
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

    const stripe = getStripeClient();
    const quoteResult = buildCombinedTuitionPaymentQuote(
      candidates,
      body.paymentMethod,
    );
    const tuitionChargeIds = candidates.map((candidate) => candidate.charge.id);
    const totalNetCents = quoteResult.combinedQuote.netAmountCents;
    const expiredCheckoutSessionIds = new Set<string>();

    for (const candidate of candidates) {
      const pendingPayments = await listPendingPaymentsForTuitionCharge(
        admin,
        candidate.charge.id,
      );

      for (const pendingPayment of pendingPayments) {
        if (!pendingPayment.stripeCheckoutSessionId) continue;

        const checkoutSessionId = pendingPayment.stripeCheckoutSessionId;
        const existingSession = await stripe.checkout.sessions.retrieve(
          checkoutSessionId,
        );

        if (existingSession.status === "open" && existingSession.url) {
          if (
            pendingCombinedCheckoutMatchesRequest({
              tuitionChargeIds,
              totalNetCents,
              paymentMethod: body.paymentMethod,
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

          if (!expiredCheckoutSessionIds.has(checkoutSessionId)) {
            await expireOpenCheckoutSession(stripe, checkoutSessionId);
            expiredCheckoutSessionIds.add(checkoutSessionId);
          }

          await markPaymentFailed(admin, pendingPayment.id, {
            stripeCheckoutSessionId: checkoutSessionId,
          });
          continue;
        }

        if (existingSession.status === "expired") {
          await markPaymentFailed(admin, pendingPayment.id, {
            stripeCheckoutSessionId: checkoutSessionId,
          });
        }
      }
    }

    const stripeCustomerId = await getOrCreateStripeCustomer(admin, {
      userId: user.id,
      email: user.email,
    });

    const paymentRecords = await Promise.all(
      candidates.map((candidate, index) => {
        const allocation = quoteResult.allocations[index];
        if (!allocation) {
          throw new Error("Missing payment allocation for combined checkout.");
        }

        return createTuitionPaymentRecord(admin, {
          organizationId: candidate.charge.organizationId,
          familyId: candidate.charge.familyId,
          tuitionChargeId: candidate.charge.id,
          amountCents: allocation.netAmountCents,
          chargedAmountCents: allocation.chargedAmountCents,
          processingFeeCents: allocation.processingFeeCents,
          paymentMethodType: quoteResult.combinedQuote.paymentMethod,
          label: candidate.charge.label,
          payerUserId: user.id,
          currency: candidate.charge.currency,
        });
      }),
    );

    const paymentIds = paymentRecords.map((payment) => payment.id);
    const tuitionChargeIdsValue = candidates
      .map((candidate) => candidate.charge.id)
      .join(",");
    const paymentIdsValue = paymentIds.join(",");
    const orgSlug = typeof body.orgSlug === "string" ? body.orgSlug : "school";
    const baseUrl = getSiteUrl();
    const successUrl = `${baseUrl}/school/${orgSlug}/parent/billing?paid=1`;
    const cancelUrl = `${baseUrl}/school/${orgSlug}/parent/billing?cancelled=1`;

    const { session } = await createCombinedAdmissionsCheckoutSession({
      lineItems: candidates.map((candidate) => ({
        label: `${candidate.studentName} — ${candidate.charge.label}`,
        netAmountCents: candidate.amountCents,
      })),
      paymentMethod: body.paymentMethod,
      stripeConnectAccountId,
      stripeCustomerId,
      payerUserId: user.id,
      successUrl,
      cancelUrl,
      paymentIds,
      paymentIntentMetadata: {
        organization_id: firstCharge.organizationId,
        tuition_charge_ids: tuitionChargeIdsValue,
        payment_ids: paymentIdsValue,
        payment_type: "tuition_combined",
      },
      sessionMetadata: {
        organization_id: firstCharge.organizationId,
        tuition_charge_ids: tuitionChargeIdsValue,
        payment_ids: paymentIdsValue,
        payment_type: "tuition_combined",
      },
    });

    if (session.id) {
      await attachCheckoutSessionToPayments(admin, paymentIds, session.id);
    }

    for (const candidate of candidates) {
      await markChargeSent(admin, candidate.charge.id);
    }

    if (!session.url) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to create checkout session.",
        code: "checkout_failed",
      });
    }

    return NextResponse.json({
      checkoutUrl: session.url,
      processingFeeCents: quoteResult.combinedQuote.processingFeeCents,
      grossAmountCents: quoteResult.combinedQuote.grossAmountCents,
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
