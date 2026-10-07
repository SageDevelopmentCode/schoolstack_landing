import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type ApplicantContact,
  resolveApplicantContact,
} from "@/lib/admissions/application-notifications";
import {
  logNotificationFailure,
  logOutboundEmailSettledFailures,
  type OutboundEmailSendResult,
} from "@/lib/admissions/notification-logging";
import {
  PAYMENT_TYPE_LABELS,
} from "@/lib/admissions/payment-records";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import {
  buildEmailNotificationContext,
  sendAchBankVerificationEmail,
  type AchBankVerificationLineItem,
} from "@/lib/emails";
import { notifyAchBankVerificationRequired, notifyTuitionPaymentFailed } from "@/lib/discord";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import {
  getStudentNameForCharge,
  sendAchBankVerificationAdminNotifications,
  sendTuitionPaymentFailedAdminNotifications,
} from "@/lib/notifications/payment-admin-notifications";
import { getChargeById } from "@/lib/tuition/charges";
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
import { getRuntimeSiteUrl } from "@/lib/site";

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

  const financesUrl = `${getRuntimeSiteUrl()}${schoolAdminPath(org.slug, "finances", "transactions")}`;

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
          const billingUrl = `${getRuntimeSiteUrl()}/school/${org.slug}/parent/billing`;
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
          const applyUrl = `${getRuntimeSiteUrl()}/school/${org.slug}/apply`;
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
    await sendTuitionPaymentReceiptNotifications(admin, payment.id);
    await sendPaymentReceivedAdminNotifications(admin, payment.id);

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

type ParentAchFailureEmailVariant = "initial" | "charge_reopened";

async function hasParentAchFailureEmailBeenSent(
  admin: SupabaseClient,
  paymentId: string,
  variant: ParentAchFailureEmailVariant,
): Promise<boolean> {
  const { data, error } = await admin
    .from("activity_events")
    .select("id")
    .eq("action", ACTIVITY_ACTIONS.TUITION_PAYMENT_FAILED_PARENT_EMAIL)
    .eq("entity_type", "payment")
    .eq("entity_id", paymentId)
    .contains("metadata", { variant })
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

async function logParentAchFailureEmailSent(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    paymentId: string;
    variant: ParentAchFailureEmailVariant;
  },
): Promise<void> {
  void logActivityEvent(admin, {
    organizationId: input.organizationId,
    actorType: "system",
    surface: "system",
    action: ACTIVITY_ACTIONS.TUITION_PAYMENT_FAILED_PARENT_EMAIL,
    entityType: "payment",
    entityId: input.paymentId,
    summary: "Tuition ACH failure parent email sent",
    metadata: {
      paymentId: input.paymentId,
      variant: input.variant,
    },
    severity: "info",
  });
}

async function resolveParentAchFailureEmailDecision(
  admin: SupabaseClient,
  input: {
    payment: PaymentRecord;
    settlementFailure: boolean;
    chargeReopened?: boolean;
  },
): Promise<{
  sendParentEmail: boolean;
  chargeReopened: boolean;
  variant: ParentAchFailureEmailVariant;
}> {
  if (!input.settlementFailure) {
    return {
      sendParentEmail: true,
      chargeReopened: false,
      variant: "initial",
    };
  }

  let chargeReopened = input.chargeReopened === true;
  const charge =
    input.payment.tuitionChargeId != null
      ? await getChargeById(admin, input.payment.tuitionChargeId)
      : null;

  if (!chargeReopened && charge && charge.paidCents < charge.amountCents) {
    chargeReopened = true;
  }

  if (!chargeReopened) {
    if (charge && charge.paidCents >= charge.amountCents) {
      return {
        sendParentEmail: false,
        chargeReopened: false,
        variant: "initial",
      };
    }

    return {
      sendParentEmail: true,
      chargeReopened: false,
      variant: "initial",
    };
  }

  return {
    sendParentEmail: true,
    chargeReopened: true,
    variant: "charge_reopened",
  };
}

export type TuitionAchSettlementFailedParentEmailAttempt = {
  email: string;
  result: OutboundEmailSendResult;
  skippedReason?: "already_sent" | "deferred_until_billing_reopened";
};

export type TuitionAchSettlementFailedNotificationResult = {
  parentEmailAttempts: TuitionAchSettlementFailedParentEmailAttempt[];
};

export async function sendTuitionAchSettlementFailedNotifications(
  admin: SupabaseClient,
  input: {
    payment: PaymentRecord;
    settlementFailure: boolean;
    chargeReopened?: boolean;
    /** Resend scripts: email parents even if a variant was already sent. */
    forceParentEmail?: boolean;
    /** Resend scripts: skip school admin email and ops Discord. */
    parentEmailOnly?: boolean;
  },
): Promise<TuitionAchSettlementFailedNotificationResult> {
  const parentEmailAttempts: TuitionAchSettlementFailedParentEmailAttempt[] = [];

  try {
    const { payment } = input;
    if (payment.paymentType !== "tuition" || !payment.familyId) {
      return { parentEmailAttempts };
    }

    const org = await loadOrganization(admin, payment.organizationId);
    if (!org) return { parentEmailAttempts };

    const contact = await resolveTuitionPayerContact(admin, {
      familyId: payment.familyId,
      payerUserId: payment.payerUserId,
    });
    if (!contact) return { parentEmailAttempts };

    const emailDecision = await resolveParentAchFailureEmailDecision(admin, {
      payment,
      settlementFailure: input.settlementFailure,
      chargeReopened: input.chargeReopened,
    });

    let parentEmailSent = false;

    if (!emailDecision.sendParentEmail) {
      for (const email of contact.emails) {
        parentEmailAttempts.push({
          email,
          result: { ok: false },
          skippedReason: "deferred_until_billing_reopened",
        });
      }
    }

    if (emailDecision.sendParentEmail) {
      const variant = emailDecision.variant;
      const alreadySent = input.forceParentEmail
        ? false
        : await hasParentAchFailureEmailBeenSent(admin, payment.id, variant);
      const reopenedAlreadySent =
        input.forceParentEmail || variant !== "initial"
          ? false
          : await hasParentAchFailureEmailBeenSent(
              admin,
              payment.id,
              "charge_reopened",
            );

      if (alreadySent || reopenedAlreadySent) {
        for (const email of contact.emails) {
          parentEmailAttempts.push({
            email,
            result: { ok: true },
            skippedReason: "already_sent",
          });
        }
      } else {
        const { buildEmailNotificationContext, sendTuitionAchSettlementFailedEmail } =
          await import("@/lib/emails");

        const billingUrl = `${getRuntimeSiteUrl()}/school/${org.slug}/parent/billing`;
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
              chargeReopened: emailDecision.chargeReopened,
              notificationContext,
            }),
          ),
        );

        contact.emails.forEach((email, index) => {
          const settled = results[index];
          if (settled?.status === "fulfilled") {
            parentEmailAttempts.push({ email, result: settled.value });
          } else if (settled?.status === "rejected") {
            const message =
              settled.reason instanceof Error
                ? settled.reason.message
                : String(settled.reason);
            parentEmailAttempts.push({
              email,
              result: { ok: false, error: message },
            });
          }
        });

        await logOutboundEmailSettledFailures(
          admin,
          {
            organizationId: payment.organizationId,
            operation: "tuition_ach_settlement_failed_email",
            entityType: "payment",
            entityId: payment.id,
          },
          results,
        );

        const anyOk = results.some(
          (result) => result.status === "fulfilled" && result.value.ok,
        );
        if (anyOk) {
          parentEmailSent = true;
          await logParentAchFailureEmailSent(admin, {
            organizationId: payment.organizationId,
            paymentId: payment.id,
            variant,
          });
        }
      }
    }

    if (!input.parentEmailOnly) {
      void sendTuitionPaymentFailedAdminNotifications(admin, {
        payment,
        settlementFailure: input.settlementFailure,
        chargeReopened: emailDecision.chargeReopened,
        familyEmailSent: parentEmailSent,
      });

      const financesUrl = `${getRuntimeSiteUrl()}${schoolAdminPath(org.slug, "finances", "transactions")}`;
      const studentName = await getStudentNameForCharge(admin, payment.tuitionChargeId);

      void notifyTuitionPaymentFailed({
        schoolName: org.name,
        payerLabel: contact.name,
        payerEmail: contact.emails[0] ?? null,
        studentName,
        chargeLabel: payment.label ?? "Tuition",
        amountCents: payment.amountCents,
        paymentId: payment.id,
        settlementFailure: input.settlementFailure,
        chargeReopened: emailDecision.chargeReopened,
        financesUrl,
        parentEmailSent,
      });
    }

    return { parentEmailAttempts };
  } catch (error) {
    console.error(
      "Tuition ACH settlement failed notification error:",
      input.payment.id,
      error,
    );
    return { parentEmailAttempts };
  }
}
