import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  allocateCombinedPaymentAmounts,
  buildCombinedEnrollmentPaymentQuote,
  loadValidatedCombinedCheckoutCandidates,
} from "@/lib/admissions/combined-enrollment-payment";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { EnrollmentMaterializationError } from "@/lib/admissions/enrollment-checklist-materialization";
import { reportEnrollmentChecklistItemApiFailure } from "@/lib/admissions/enrollment-checklist-operational-errors";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import {
  attachCheckoutSessionToPayments,
  createPaymentRecord,
  getPaymentByChecklistItem,
} from "@/lib/stripe/application-payments";
import { createCombinedAdmissionsCheckoutSession } from "@/lib/stripe/checkout-session";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import { getSiteUrl } from "@/lib/stripe/client";
import { isCheckoutPaymentMethod } from "@/lib/stripe/processing-fee";
import {
  getOrganizationPaymentAccount,
  isPaymentReady,
} from "@/lib/stripe/organization-payment-account";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/enrollment-checklist-items/combined-checkout";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let organizationId: string | undefined;
  let actorUserId: string | undefined;
  let actorEmail: string | null = null;
  let requestedChecklistItemIds: string[] = [];

  try {
    const user = await requireAuthenticatedUser(supabase);
    actorUserId = user.id;
    actorEmail = user.email ?? null;
    const admin = createAdminClient();

    const body = (await request.json().catch(() => ({}))) as {
      paymentMethod?: unknown;
      checklistItemIds?: unknown;
    };

    if (!isCheckoutPaymentMethod(body.paymentMethod)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Choose a payment method to continue.",
        code: "invalid_payment_method",
      });
    }

    const checklistItemIds = Array.isArray(body.checklistItemIds)
      ? body.checklistItemIds.filter((value): value is string => typeof value === "string")
      : [];
    requestedChecklistItemIds = checklistItemIds;

    const { data: firstInstance, error: firstInstanceError } = await admin
      .from("enrollment_checklist_items")
      .select("organization_id")
      .in("id", checklistItemIds.slice(0, 1))
      .maybeSingle();

    if (firstInstanceError) throw firstInstanceError;
    if (!firstInstance?.organization_id) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Checklist items not found.",
        code: "not_found",
      });
    }

    organizationId = String(firstInstance.organization_id);
    const resolvedOrganizationId = organizationId;

    const validation = await loadValidatedCombinedCheckoutCandidates(admin, {
      organizationId: resolvedOrganizationId,
      userId: user.id,
      checklistItemIds,
    });

    if (!validation.ok) {
      return apiError(ROUTE, {
        request,
        status: validation.status,
        error: validation.error,
        code: validation.code,
      });
    }

    const candidates = validation.candidates;

    for (const candidate of candidates) {
      const existingPayment = await getPaymentByChecklistItem(
        admin,
        candidate.instanceId,
        { status: "succeeded" },
      );
      if (existingPayment) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "One or more selected payments have already been completed.",
          code: "already_paid",
        });
      }
    }

    const paymentAccount = await getOrganizationPaymentAccount(admin, resolvedOrganizationId);
    if (!isPaymentReady(paymentAccount) || !paymentAccount?.stripeConnectAccountId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Online payments are not set up for this school yet.",
        code: "payments_not_ready",
      });
    }

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("slug")
      .eq("id", resolvedOrganizationId)
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

    const returnApplicationId = candidates[0]?.applicationId;
    if (!returnApplicationId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Combined checkout is missing application context.",
        code: "invalid_items",
      });
    }

    const enrollmentPath = `/school/${org.slug}/apply/${returnApplicationId}/enrollment`;
    const quoteResult = buildCombinedEnrollmentPaymentQuote(
      candidates,
      body.paymentMethod,
    );
    const allocations = allocateCombinedPaymentAmounts(
      candidates.map((candidate) => candidate.amountCents),
      quoteResult.combinedQuote,
    );

    const stripeCustomerId = await getOrCreateStripeCustomer(admin, {
      userId: user.id,
      email: user.email,
    });

    const paymentRecords = await Promise.all(
      candidates.map((candidate, index) => {
        const allocation = allocations[index];
        if (!allocation) {
          throw new Error("Missing payment allocation for combined checkout.");
        }

        return createPaymentRecord(admin, {
          organizationId: resolvedOrganizationId,
          applicationId: candidate.applicationId,
          amountCents: allocation.netAmountCents,
          chargedAmountCents: allocation.chargedAmountCents,
          processingFeeCents: allocation.processingFeeCents,
          paymentMethodType: quoteResult.combinedQuote.paymentMethod,
          currency: "USD",
          paymentType: "enrollment_checklist",
          enrollmentChecklistItemId: candidate.instanceId,
          label: candidate.feeLabel,
          payerUserId: user.id,
        });
      }),
    );

    const paymentIds = paymentRecords.map((payment) => payment.id);
    const checklistItemIdsValue = candidates
      .map((candidate) => candidate.instanceId)
      .join(",");
    const paymentIdsValue = paymentIds.join(",");

    const { session } = await createCombinedAdmissionsCheckoutSession({
      lineItems: candidates.map((candidate) => ({
        label: `${candidate.studentName} — ${candidate.feeLabel}`,
        netAmountCents: candidate.amountCents,
      })),
      paymentMethod: body.paymentMethod,
      stripeConnectAccountId: paymentAccount.stripeConnectAccountId,
      stripeCustomerId,
      payerUserId: user.id,
      successUrl: `${getSiteUrl()}${enrollmentPath}?combined_payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${getSiteUrl()}${enrollmentPath}?combined_payment=cancelled`,
      paymentIds,
      paymentIntentMetadata: {
        organization_id: resolvedOrganizationId,
        checklist_item_ids: checklistItemIdsValue,
        payment_ids: paymentIdsValue,
      },
      sessionMetadata: {
        organization_id: resolvedOrganizationId,
        checklist_item_ids: checklistItemIdsValue,
        payment_ids: paymentIdsValue,
        payment_type: "enrollment_checklist_combined",
      },
    });

    if (session.id) {
      await attachCheckoutSessionToPayments(admin, paymentIds, session.id);
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
      organizationId: resolvedOrganizationId,
      actorType: "parent",
      actorUserId: user.id,
      actorEmail: user.email,
      surface: "parent_portal",
      action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_STARTED,
      entityType: "enrollment_checklist_item",
      entityId: candidates[0]?.instanceId ?? null,
      summary: `Combined enrollment payment checkout started ($${(quoteResult.combinedQuote.grossAmountCents / 100).toFixed(2)})`,
      metadata: {
        amountCents: quoteResult.combinedQuote.netAmountCents,
        chargedAmountCents: quoteResult.combinedQuote.grossAmountCents,
        processingFeeCents: quoteResult.combinedQuote.processingFeeCents,
        paymentMethod: quoteResult.combinedQuote.paymentMethod,
        checkoutSessionId: session.id,
        paymentIds,
        checklistItemIds: candidates.map((candidate) => candidate.instanceId),
        savingsCents: quoteResult.savingsCents,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof EnrollmentMaterializationError && organizationId) {
      await reportEnrollmentChecklistItemApiFailure(createAdminClient(), {
        organizationId,
        applicationId: null,
        instanceId: requestedChecklistItemIds[0] ?? "combined-checkout",
        operation: "enrollment_checklist.combined_checkout",
        error: error.message,
        code: error.code,
        actorUserId,
        actorEmail,
        cause: error,
      });

      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

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
      error: "Failed to start combined checkout.",
      code: "internal_error",
      cause: error,
    });
  }
}
