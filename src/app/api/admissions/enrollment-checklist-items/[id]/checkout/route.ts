import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AuthError,
  requireAuthenticatedUser,
  userOwnsApplication,
} from "@/lib/admissions/application-auth";
import { EnrollmentMaterializationError } from "@/lib/admissions/enrollment-checklist-materialization";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import { getSiteUrl, getStripeClient } from "@/lib/stripe/client";
import {
  attachCheckoutSessionToPayment,
  createPaymentRecord,
} from "@/lib/stripe/application-payments";
import {
  getOrganizationPaymentAccount,
  isPaymentReady,
} from "@/lib/stripe/organization-payment-account";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/enrollment-checklist-items/[id]/checkout";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: instanceId } = await context.params;

  try {
    const user = await requireAuthenticatedUser(supabase);
    const admin = createAdminClient();

    const { data: instance, error: instanceError } = await admin
      .from("enrollment_checklist_items")
      .select(
        `
        id,
        organization_id,
        template_item_id,
        payment_status,
        status,
        enrollment_checklists!inner (
          application_id
        )
      `,
      )
      .eq("id", instanceId)
      .maybeSingle();

    if (instanceError) throw instanceError;
    if (!instance) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Checklist item not found.",
        code: "not_found",
      });
    }

    const organizationId = String(instance.organization_id);
    const checklist = instance.enrollment_checklists as
      | { application_id?: string }
      | { application_id?: string }[]
      | null;
    const checklistRow = Array.isArray(checklist) ? checklist[0] : checklist;
    const applicationId = checklistRow?.application_id
      ? String(checklistRow.application_id)
      : null;

    if (!applicationId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Checklist item is missing application context.",
        code: "invalid_item",
      });
    }

    const ownsApplication = await userOwnsApplication(
      supabase,
      user.id,
      applicationId,
    );
    if (!ownsApplication) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to this checklist item.",
        code: "forbidden",
      });
    }

    if (instance.status === "completed" || instance.payment_status === "paid") {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "This payment has already been completed.",
        code: "already_paid",
      });
    }

    const { data: templateItem, error: templateItemError } = await admin
      .from("enrollment_checklist_template_items")
      .select(
        `
        type,
        label,
        fee_definitions ( label, amount_cents )
      `,
      )
      .eq("id", instance.template_item_id)
      .maybeSingle();

    if (templateItemError) throw templateItemError;

    const feeDefinition = templateItem?.fee_definitions;
    const feeRow = Array.isArray(feeDefinition) ? feeDefinition[0] : feeDefinition;
    const amountCents =
      typeof feeRow?.amount_cents === "number" ? feeRow.amount_cents : 0;
    const paymentLabel =
      typeof feeRow?.label === "string" && feeRow.label.trim()
        ? feeRow.label
        : templateItem?.label;
    if (templateItem?.type !== "payment" || amountCents <= 0) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "This checklist item does not require payment.",
        code: "not_payment_item",
      });
    }

    const paymentAccount = await getOrganizationPaymentAccount(admin, organizationId);
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
      .eq("id", organizationId)
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

    const siteUrl = getSiteUrl();
    const enrollmentPath = `/school/${org.slug}/apply/${applicationId}/enrollment`;
    const successUrl = `${siteUrl}${enrollmentPath}?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}${enrollmentPath}?payment=cancelled`;

    const payment = await createPaymentRecord(admin, {
      organizationId,
      applicationId,
      amountCents,
      currency: "USD",
      paymentType: "enrollment_checklist",
      enrollmentChecklistItemId: instanceId,
      label: paymentLabel ?? "Enrollment payment",
      payerUserId: user.id,
    });

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: paymentLabel ?? "Enrollment payment",
            },
          },
        },
      ],
      payment_intent_data: {
        transfer_data: {
          destination: paymentAccount.stripeConnectAccountId,
        },
        metadata: {
          checklist_item_id: instanceId,
          organization_id: organizationId,
          application_id: applicationId,
          payment_id: payment.id,
        },
      },
      metadata: {
        checklist_item_id: instanceId,
        organization_id: organizationId,
        application_id: applicationId,
        payment_type: "enrollment_checklist",
        payment_id: payment.id,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
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
      organizationId,
      actorType: "parent",
      actorUserId: user.id,
      actorEmail: user.email,
      surface: "parent_portal",
      action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_STARTED,
      entityType: "enrollment_checklist_item",
      entityId: instanceId,
      summary: `Enrollment payment checkout started ($${(amountCents / 100).toFixed(2)})`,
      metadata: {
        amountCents,
        checkoutSessionId: session.id,
        applicationId,
        paymentId: payment.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof AuthError || error instanceof EnrollmentMaterializationError) {
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
