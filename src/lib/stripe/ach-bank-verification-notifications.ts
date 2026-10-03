import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type ApplicantContact,
  resolveApplicantContact,
} from "@/lib/admissions/application-notifications";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import {
  PAYMENT_TYPE_LABELS,
} from "@/lib/admissions/payment-records";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import {
  buildEmailNotificationContext,
  sendAchBankVerificationEmail,
  type AchBankVerificationLineItem,
} from "@/lib/emails";
import { notifyAchBankVerificationRequired } from "@/lib/discord";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import { sendAchBankVerificationAdminNotifications } from "@/lib/notifications/payment-admin-notifications";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import {
  type PaymentRecord,
} from "@/lib/stripe/application-payments";
import type { AchVerificationAction } from "@/lib/stripe/payment-intent-bank-verification";
import { hasAchVerificationOpsBeenNotified } from "@/lib/stripe/ach-verification-ops-idempotency";
import {
  logTuitionPaymentCompletedActivities,
  tuitionPaymentCompletedActivityExists,
} from "@/lib/stripe/record-payment-completed";
import {
  logTuitionActivity,
  summarizeAchVerificationRequired,
} from "@/lib/tuition/tuition-activity";
import { formatCents } from "@/lib/tuition/pricing";
import { SITE_URL } from "@/lib/site";

async function loadOrganization(
  admin: SupabaseClient,
  organizationId: string,
): Promise<{ name: string; slug: string } | null> {
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (orgError) throw orgError;
  if (!org?.slug) return null;

  return {
    name: String(org.name),
    slug: String(org.slug),
  };
}

async function resolveTuitionPayerContact(
  admin: SupabaseClient,
  input: {
    familyId: string | null;
    payerUserId: string | null;
  },
): Promise<{ emails: string[]; name: string } | null> {
  if (!input.familyId) return null;

  const emails = await loadFamilyNotificationEmails(admin, input.familyId);
  if (emails.length === 0) return null;

  const { data: family, error: familyError } = await admin
    .from("families")
    .select("name")
    .eq("id", input.familyId)
    .maybeSingle();

  if (familyError) throw familyError;

  let displayName = String(family?.name ?? "Family");

  if (input.payerUserId) {
    const { data: userData, error: userError } =
      await admin.auth.admin.getUserById(input.payerUserId);

    if (!userError && userData.user) {
      const metadata = userData.user.user_metadata ?? {};
      const firstName =
        typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
      const lastName =
        typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      if (fullName) {
        displayName = fullName;
      }
    }
  }

  return { emails, name: displayName };
}

async function resolveAdmissionsPayerContact(
  admin: SupabaseClient,
  payment: PaymentRecord,
): Promise<ApplicantContact | null> {
  if (!payment.applicationId) return null;

  const { data: application, error: applicationError } = await admin
    .from("applications")
    .select("id, family_id, created_by_user_id, primary_guardian_id")
    .eq("id", payment.applicationId)
    .maybeSingle();

  if (applicationError) throw applicationError;
  if (!application) return null;

  return resolveApplicantContact(admin, application);
}

async function resolvePayerLabelForPayments(
  admin: SupabaseClient,
  payments: PaymentRecord[],
): Promise<string> {
  const first = payments[0];
  if (!first) return "Family";

  if (first.paymentType === "tuition" && first.familyId) {
    const contact = await resolveTuitionPayerContact(admin, {
      familyId: first.familyId,
      payerUserId: first.payerUserId,
    });
    if (contact?.name) return contact.name;
  }

  const admissionsContact = await resolveAdmissionsPayerContact(admin, first);
  if (admissionsContact?.displayName) return admissionsContact.displayName;

  if (first.familyId) {
    const { data: family } = await admin
      .from("families")
      .select("name")
      .eq("id", first.familyId)
      .maybeSingle();
    if (family?.name) return String(family.name);
  }

  return "Family";
}

function lineItemsFromPayments(payments: PaymentRecord[]): AchBankVerificationLineItem[] {
  return payments.map((payment) => ({
    label: payment.label ?? "Payment",
    amountCents: payment.chargedAmountCents ?? payment.amountCents,
  }));
}

function lineItemSummaryForDiscord(payments: PaymentRecord[]): string {
  return payments
    .map((payment) => {
      const label = payment.label ?? PAYMENT_TYPE_LABELS[payment.paymentType];
      return `${label} (${formatCents(payment.amountCents)})`;
    })
    .join("; ");
}

function familyEmailSentFromResults(
  results: PromiseSettledResult<{ ok: boolean }>[],
): boolean {
  return results.some(
    (result) => result.status === "fulfilled" && result.value.ok === true,
  );
}

async function logOutboundEmailSettledFailures(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    operation: string;
    entityType: string;
    entityId: string;
  },
  results: PromiseSettledResult<{ ok: boolean }>[],
): Promise<void> {
  const failures = results.filter(
    (result) =>
      result.status === "rejected" ||
      (result.status === "fulfilled" && !result.value.ok),
  );
  if (failures.length === 0) return;

  await logNotificationFailure(admin, {
    organizationId: input.organizationId,
    operation: input.operation,
    error: `${failures.length} email(s) failed`,
    entityType: input.entityType,
    entityId: input.entityId,
  });
}

async function sendAchBankVerificationOpsNotifications(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    checkoutSessionId: string;
    payments: PaymentRecord[];
    familyEmailSent: boolean;
    payerLabel: string;
    payerEmail?: string | null;
    forceOps?: boolean;
  },
): Promise<void> {
  const payments = input.payments.filter(Boolean);
  if (payments.length === 0) return;

  const firstPayment = payments[0]!;
  const alreadyNotified = await hasAchVerificationOpsBeenNotified(
    admin,
    input.organizationId,
    firstPayment.id,
  );

  if (alreadyNotified && !input.forceOps) {
    return;
  }

  const org = await loadOrganization(admin, input.organizationId);
  if (!org) return;

  const paymentIds = payments.map((payment) => payment.id);
  const lineItems = lineItemsFromPayments(payments);

  if (!alreadyNotified) {
    await logActivityEvent(admin, {
      organizationId: input.organizationId,
      actorType: "system",
      surface: "system",
      action: ACTIVITY_ACTIONS.PAYMENT_ACH_VERIFICATION_REQUIRED,
      entityType: "application_payment",
      entityId: firstPayment.id,
      summary: "ACH bank verification required before payment can settle",
      severity: "warning",
      metadata: {
        checkoutSessionId: input.checkoutSessionId,
        paymentIds,
        primaryPaymentId: firstPayment.id,
        familyId: firstPayment.familyId,
        payerLabel: input.payerLabel,
        paymentType: firstPayment.paymentType,
        lineItems,
        familyEmailSent: input.familyEmailSent,
      },
    });

    if (firstPayment.paymentType === "tuition") {
      await logTuitionActivity(admin, {
        organizationId: input.organizationId,
        action: ACTIVITY_ACTIONS.PAYMENT_ACH_VERIFICATION_REQUIRED,
        entityType: "tuition_charge",
        entityId: firstPayment.tuitionChargeId ?? firstPayment.id,
        summary: "ACH bank verification required",
        changeSummary: summarizeAchVerificationRequired({
          payerLabel: input.payerLabel,
          chargeLabels: payments.map((p) => p.label ?? "Tuition"),
          familyEmailSent: input.familyEmailSent,
        }),
        logWhenEmpty: true,
        severity: "warning",
        metadata: {
          checkoutSessionId: input.checkoutSessionId,
          paymentIds,
          familyId: firstPayment.familyId,
          familyEmailSent: input.familyEmailSent,
        },
        context: { actorType: "system", surface: "system" },
      });
    }
  }

  const financesUrl = `${SITE_URL}${schoolAdminPath(org.slug, "finances", "transactions")}`;

  try {
    await notifyAchBankVerificationRequired({
      schoolName: org.name,
      payerLabel: input.payerLabel,
      payerEmail: input.payerEmail ?? null,
      paymentTypeLabel: PAYMENT_TYPE_LABELS[firstPayment.paymentType],
      paymentIds,
      lineItemSummary: lineItemSummaryForDiscord(payments),
      financesUrl,
      familyEmailSent: input.familyEmailSent,
    });
  } catch (error) {
    await logNotificationFailure(admin, {
      organizationId: input.organizationId,
      operation: "ach_bank_verification_discord",
      error,
      entityType: "payment",
      entityId: firstPayment.id,
    });
  }

  void sendAchBankVerificationAdminNotifications(admin, {
    organizationId: input.organizationId,
    payments,
    payerLabel: input.payerLabel,
    familyEmailSent: input.familyEmailSent,
  });
}

export async function sendAchBankVerificationNotificationsForPayments(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    checkoutSessionId: string;
    payments: PaymentRecord[];
    verificationAction: AchVerificationAction;
    sendFamily?: boolean;
    sendOps?: boolean;
    forceOps?: boolean;
  },
): Promise<void> {
  try {
    const payments = input.payments.filter(Boolean);
    if (payments.length === 0) return;

    const sendFamily = input.sendFamily !== false;
    const sendOps = input.sendOps !== false;

    const org = await loadOrganization(admin, input.organizationId);
    if (!org) {
      console.warn(
        "ACH verification email: organization not found",
        input.checkoutSessionId,
      );
      return;
    }

    const firstPayment = payments[0]!;
    const lineItems = lineItemsFromPayments(payments);
    const notificationContext = buildEmailNotificationContext({
      organizationId: input.organizationId,
      organizationSlug: org.slug,
      surface: "web",
      entityType: "payment",
      entityId: firstPayment.id,
    });

    let familyEmailSent = false;
    let payerLabel = await resolvePayerLabelForPayments(admin, payments);
    let payerEmail: string | null = null;

    if (sendFamily) {
      if (firstPayment.paymentType === "tuition" && firstPayment.familyId) {
        const contact = await resolveTuitionPayerContact(admin, {
          familyId: firstPayment.familyId,
          payerUserId: firstPayment.payerUserId,
        });
        if (contact) {
          payerLabel = contact.name;
          payerEmail = contact.emails[0] ?? null;
          const billingUrl = `${SITE_URL}/school/${org.slug}/parent/billing`;
          const results = await Promise.allSettled(
            contact.emails.map((email) =>
              sendAchBankVerificationEmail({
                email,
                name: contact.name,
                schoolName: org.name,
                verificationUrl: input.verificationAction.hostedVerificationUrl,
                portalUrl: billingUrl,
                lineItems,
                microdepositType: input.verificationAction.microdepositType,
                arrivalDate: input.verificationAction.arrivalDate,
                notificationContext,
              }),
            ),
          );
          familyEmailSent = familyEmailSentFromResults(results);
          await logOutboundEmailSettledFailures(admin, {
            organizationId: input.organizationId,
            operation: "ach_bank_verification_family_email",
            entityType: "payment",
            entityId: firstPayment.id,
          }, results);
        } else {
          console.warn(
            "ACH verification email: no tuition payer contact",
            input.checkoutSessionId,
          );
        }
      } else {
        const admissionsContact = await resolveAdmissionsPayerContact(
          admin,
          firstPayment,
        );
        if (admissionsContact) {
          payerLabel = admissionsContact.displayName;
          payerEmail = admissionsContact.emails[0] ?? null;
          const applyUrl = `${SITE_URL}/school/${org.slug}/apply`;
          const results = await Promise.allSettled(
            admissionsContact.emails.map((email) =>
              sendAchBankVerificationEmail({
                email,
                name: admissionsContact.displayName,
                schoolName: org.name,
                verificationUrl: input.verificationAction.hostedVerificationUrl,
                portalUrl: applyUrl,
                lineItems,
                microdepositType: input.verificationAction.microdepositType,
                arrivalDate: input.verificationAction.arrivalDate,
                notificationContext,
              }),
            ),
          );
          familyEmailSent = familyEmailSentFromResults(results);
          await logOutboundEmailSettledFailures(admin, {
            organizationId: input.organizationId,
            operation: "ach_bank_verification_family_email",
            entityType: "payment",
            entityId: firstPayment.id,
          }, results);
        } else {
          console.warn(
            "ACH verification email: no admissions payer contact",
            input.checkoutSessionId,
          );
        }
      }
    } else {
      payerEmail = null;
    }

    if (sendOps) {
      await sendAchBankVerificationOpsNotifications(admin, {
        organizationId: input.organizationId,
        checkoutSessionId: input.checkoutSessionId,
        payments,
        familyEmailSent,
        payerLabel,
        payerEmail,
        forceOps: input.forceOps,
      });
    }
  } catch (error) {
    console.error(
      "ACH bank verification notification failed:",
      input.checkoutSessionId,
      error,
    );
  }
}

async function sendDeferredTuitionReceiptsForPayments(
  admin: SupabaseClient,
  payments: PaymentRecord[],
): Promise<void> {
  const { sendTuitionPaymentReceiptNotifications } = await import(
    "@/lib/tuition/payment-receipt-notifications"
  );
  const { sendPaymentReceivedAdminNotifications } = await import(
    "@/lib/notifications/payment-admin-notifications"
  );

  for (const payment of payments) {
    if (payment.paymentType !== "tuition" || payment.status !== "succeeded") {
      continue;
    }
    const prior = payment.stripeProviderStatus;
    if (prior !== "requires_action" && prior !== "processing") {
      continue;
    }
    void sendTuitionPaymentReceiptNotifications(admin, payment.id);
    void sendPaymentReceivedAdminNotifications(admin, payment.id);

    const exists = await tuitionPaymentCompletedActivityExists(
      admin,
      payment.organizationId,
      payment.id,
    );
    if (!exists) {
      void logTuitionPaymentCompletedActivities(admin, {
        organizationId: payment.organizationId,
        checkoutSessionId: payment.stripeCheckoutSessionId ?? undefined,
        payment,
        chargeId: payment.tuitionChargeId,
      });
    }
  }
}

export async function sendDeferredTuitionReceiptsIfAchSettled(
  admin: SupabaseClient,
  input: {
    sessionPaymentStatus: string;
    payments: PaymentRecord[];
  },
): Promise<void> {
  if (input.sessionPaymentStatus !== "paid") return;
  await sendDeferredTuitionReceiptsForPayments(admin, input.payments);
}

export async function sendDeferredTuitionReceiptsForInFlightAchPayments(
  admin: SupabaseClient,
  payments: PaymentRecord[],
): Promise<void> {
  await sendDeferredTuitionReceiptsForPayments(admin, payments);
}

export async function sendDeferredAdmissionsReceiptsIfAchSettled(
  admin: SupabaseClient,
  input: {
    sessionPaymentStatus: string;
    payments: PaymentRecord[];
  },
): Promise<void> {
  if (input.sessionPaymentStatus !== "paid") return;

  const { sendPaymentCompletedNotifications } = await import(
    "@/lib/admissions/payment-notifications"
  );

  for (const payment of input.payments) {
    if (payment.paymentType === "tuition" || payment.status !== "succeeded") {
      continue;
    }
    const prior = payment.stripeProviderStatus;
    if (prior !== "requires_action" && prior !== "processing") {
      continue;
    }
    void sendPaymentCompletedNotifications(admin, payment.id);
  }
}

export async function sendTuitionAchSettlementFailedNotifications(
  admin: SupabaseClient,
  input: {
    payment: PaymentRecord;
    settlementFailure: boolean;
    chargeReopened?: boolean;
  },
): Promise<void> {
  try {
    const { payment } = input;
    if (payment.paymentType !== "tuition" || !payment.familyId) {
      return;
    }

    const org = await loadOrganization(admin, payment.organizationId);
    if (!org) return;

    const contact = await resolveTuitionPayerContact(admin, {
      familyId: payment.familyId,
      payerUserId: payment.payerUserId,
    });
    if (!contact) return;

    const { buildEmailNotificationContext, sendTuitionAchSettlementFailedEmail } =
      await import("@/lib/emails");

    const billingUrl = `${SITE_URL}/school/${org.slug}/parent/billing`;
    const notificationContext = buildEmailNotificationContext({
      organizationId: payment.organizationId,
      organizationSlug: org.slug,
      surface: "web",
      entityType: "payment",
      entityId: payment.id,
    });

    const results = await Promise.allSettled(
      contact.emails.map((email) =>
        sendTuitionAchSettlementFailedEmail({
          email,
          name: contact.name,
          schoolName: org.name,
          billingUrl,
          chargeLabel: payment.label ?? "Tuition",
          amountCents: payment.amountCents,
          settlementFailure: input.settlementFailure,
          chargeReopened: input.chargeReopened,
          notificationContext,
        }),
      ),
    );
    await logOutboundEmailSettledFailures(admin, {
      organizationId: payment.organizationId,
      operation: "tuition_ach_settlement_failed_email",
      entityType: "payment",
      entityId: payment.id,
    }, results);
  } catch (error) {
    console.error(
      "Tuition ACH settlement failed notification error:",
      input.payment.id,
      error,
    );
  }
}
