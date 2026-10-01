import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import {
  getFamilyIdsForUser,
  userOwnsApplication,
} from "@/lib/admissions/application-auth";
import { getStripeClient } from "@/lib/stripe/client";
import { getPaymentById } from "@/lib/stripe/application-payments";
import { handleCheckoutSessionCompleted } from "@/lib/stripe/webhook-handlers";

const ADMISSIONS_CHECKOUT_PAYMENT_TYPES = new Set([
  "application_fee",
  "enrollment_checklist",
  "enrollment_checklist_combined",
]);

const TUITION_CHECKOUT_PAYMENT_TYPES = new Set(["tuition", "tuition_combined"]);

export const CONFIRMABLE_CHECKOUT_PAYMENT_TYPES = new Set([
  ...ADMISSIONS_CHECKOUT_PAYMENT_TYPES,
  ...TUITION_CHECKOUT_PAYMENT_TYPES,
]);

function parseCsvMetadata(value: string | undefined | null): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export class CheckoutSessionSyncError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "CheckoutSessionSyncError";
    this.code = code;
    this.status = status;
  }
}

export function isAdmissionsCheckoutPaymentType(
  paymentType: string | undefined,
): paymentType is string {
  return (
    typeof paymentType === "string" &&
    ADMISSIONS_CHECKOUT_PAYMENT_TYPES.has(paymentType)
  );
}

export function isTuitionCheckoutPaymentType(
  paymentType: string | undefined,
): paymentType is string {
  return (
    typeof paymentType === "string" &&
    TUITION_CHECKOUT_PAYMENT_TYPES.has(paymentType)
  );
}

export function isConfirmableCheckoutPaymentType(
  paymentType: string | undefined,
): paymentType is string {
  return (
    typeof paymentType === "string" &&
    CONFIRMABLE_CHECKOUT_PAYMENT_TYPES.has(paymentType)
  );
}

/** @deprecated Use assertConfirmableCheckoutSession */
export function assertPaidAdmissionsCheckoutSession(
  session: Stripe.Checkout.Session,
): void {
  assertConfirmableCheckoutSession(session);
}

export function assertConfirmableCheckoutSession(
  session: Stripe.Checkout.Session,
): void {
  const paymentType = session.metadata?.payment_type;
  if (!isConfirmableCheckoutPaymentType(paymentType)) {
    throw new CheckoutSessionSyncError(
      "This checkout session cannot be confirmed here.",
      "unsupported_checkout",
      400,
    );
  }

  if (session.status !== "complete") {
    throw new CheckoutSessionSyncError(
      "This checkout is not complete yet.",
      "checkout_incomplete",
      409,
    );
  }

  if (session.payment_status === "paid") {
    return;
  }

  const achTuition =
    isTuitionCheckoutPaymentType(paymentType) &&
    session.metadata?.payment_method === "us_bank_account";

  if (achTuition) {
    return;
  }

  throw new CheckoutSessionSyncError(
    "This checkout is not paid yet.",
    "checkout_not_paid",
    409,
  );
}

export async function retrieveCheckoutSession(
  checkoutSessionId: string,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  return stripe.checkout.sessions.retrieve(checkoutSessionId);
}

async function userOwnsPaymentFamily(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
  familyId: string | null | undefined,
): Promise<boolean> {
  if (!familyId) return false;
  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  return familyIds.includes(familyId);
}

async function userCanConfirmTuitionPayments(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  userId: string,
  session: Stripe.Checkout.Session,
  paymentIds: string[],
): Promise<boolean> {
  const organizationId =
    typeof session.metadata?.organization_id === "string"
      ? session.metadata.organization_id
      : null;
  if (!organizationId || paymentIds.length === 0) {
    return false;
  }

  for (const paymentId of paymentIds) {
    const payment = await getPaymentById(admin, paymentId);
    if (!payment?.familyId) {
      return false;
    }
    const owns = await userOwnsPaymentFamily(
      supabase,
      userId,
      organizationId,
      payment.familyId,
    );
    if (!owns) {
      return false;
    }
  }

  return true;
}

export async function userCanConfirmAdmissionsCheckoutSession(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  userId: string,
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  const paymentType = session.metadata?.payment_type;
  if (
    paymentType === "enrollment_checklist" ||
    paymentType === "application_fee"
  ) {
    const applicationId =
      typeof session.metadata?.application_id === "string"
        ? session.metadata.application_id
        : null;
    if (!applicationId) return false;
    return userOwnsApplication(supabase, userId, applicationId);
  }

  if (paymentType === "enrollment_checklist_combined") {
    const paymentIds = parseCsvMetadata(session.metadata?.payment_ids);
    if (paymentIds.length === 0) {
      return false;
    }

    for (const paymentId of paymentIds) {
      const payment = await getPaymentById(admin, paymentId);
      if (!payment?.applicationId) {
        return false;
      }
      const ownsApplication = await userOwnsApplication(
        supabase,
        userId,
        payment.applicationId,
      );
      if (!ownsApplication) {
        return false;
      }
    }

    return true;
  }

  return false;
}

export async function userCanConfirmCheckoutSession(
  supabase: SupabaseClient,
  admin: SupabaseClient,
  userId: string,
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  const paymentType = session.metadata?.payment_type;

  if (isAdmissionsCheckoutPaymentType(paymentType)) {
    return userCanConfirmAdmissionsCheckoutSession(supabase, admin, userId, session);
  }

  if (paymentType === "tuition") {
    const paymentId =
      typeof session.metadata?.payment_id === "string"
        ? session.metadata.payment_id
        : null;
    if (!paymentId) return false;
    return userCanConfirmTuitionPayments(supabase, admin, userId, session, [
      paymentId,
    ]);
  }

  if (paymentType === "tuition_combined") {
    const paymentIds = parseCsvMetadata(session.metadata?.payment_ids);
    return userCanConfirmTuitionPayments(
      supabase,
      admin,
      userId,
      session,
      paymentIds,
    );
  }

  return false;
}

export async function syncPaidCheckoutSessionCompleted(
  admin: SupabaseClient,
  checkoutSessionId: string,
): Promise<Stripe.Checkout.Session> {
  const session = await retrieveCheckoutSession(checkoutSessionId);
  assertConfirmableCheckoutSession(session);
  await handleCheckoutSessionCompleted(admin, session);
  return session;
}

export type CheckoutConfirmOutcome = {
  paymentMethod: string | null;
  paymentStatus: Stripe.Checkout.Session.PaymentStatus;
};

export function describeCheckoutConfirmOutcome(
  session: Stripe.Checkout.Session,
): CheckoutConfirmOutcome {
  return {
    paymentMethod:
      typeof session.metadata?.payment_method === "string"
        ? session.metadata.payment_method
        : null,
    paymentStatus: session.payment_status,
  };
}
