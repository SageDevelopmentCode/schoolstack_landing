import type { PaymentStatus } from "@/lib/stripe/application-payments";
import type { PaymentRecord } from "@/lib/stripe/application-payments";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type {
  AdminChargeChipTone,
  ChargeStatusBadgeTone,
} from "@/lib/tuition/charge-status-display";
import {
  PAYMENT_STATUS_LABELS,
  type PaymentRecordDisplayRow,
} from "@/lib/admissions/payment-records";

export type TuitionPaymentStripeStatusHint = {
  message: string;
  tone: "warning" | "info" | "danger";
  testId: string;
};

export type TuitionPaymentStripeStatusBadge = {
  label: string;
  tone: ChargeStatusBadgeTone;
  testId: string;
};

export type PaymentRecordAdminStatusBadge = {
  label: string;
  tone: AdminChargeChipTone;
};

function achStripeProviderBadge(
  provider: string | null | undefined,
): TuitionPaymentStripeStatusBadge | null {
  if (provider === "requires_action") {
    return {
      label: "REQUIRES ACTION",
      tone: "warning",
      testId: "parent-billing-payment-requires-action-badge",
    };
  }
  if (provider === "processing") {
    return {
      label: "PROCESSING",
      tone: "info",
      testId: "parent-billing-payment-processing-badge",
    };
  }
  if (provider === "failed") {
    return {
      label: "FAILED",
      tone: "danger",
      testId: "parent-billing-payment-failed-badge",
    };
  }
  return null;
}

export function tuitionPaymentStripeStatusBadge(
  payment: Pick<
    PaymentRecord,
    "paymentMethodType" | "stripeProviderStatus" | "status"
  >,
): TuitionPaymentStripeStatusBadge | null {
  if (payment.paymentMethodType !== "us_bank_account") {
    return null;
  }
  return achStripeProviderBadge(payment.stripeProviderStatus);
}

export function tuitionPaymentStripeStatusHint(
  payment: Pick<
    PaymentRecord,
    "paymentMethodType" | "stripeProviderStatus" | "status"
  >,
): TuitionPaymentStripeStatusHint | null {
  if (payment.paymentMethodType !== "us_bank_account") {
    return null;
  }

  const provider = payment.stripeProviderStatus;

  if (provider === "requires_action") {
    return {
      message:
        "Bank verification needed — check your email for a link from MudKitchen or Stripe to finish this payment.",
      tone: "warning",
      testId: "parent-billing-payment-requires-action-hint",
    };
  }

  if (provider === "processing") {
    return {
      message: "Bank payment processing — usually 3–5 business days.",
      tone: "info",
      testId: "parent-billing-payment-processing-hint",
    };
  }

  if (provider === "failed") {
    return {
      message:
        "This bank payment did not go through. Open billing to pay again or use a card.",
      tone: "danger",
      testId: "parent-billing-payment-failed-hint",
    };
  }

  return null;
}

function adminStatusTone(status: PaymentStatus): AdminChargeChipTone {
  switch (status) {
    case "succeeded":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "alert";
    case "refunded":
      return "info";
    default: {
      status satisfies never;
      return "info";
    }
  }
}

export function paymentRecordAdminStatusBadge(
  row: Pick<
    PaymentRecordDisplayRow,
    "status" | "paymentMethodType" | "stripeProviderStatus"
  >,
): PaymentRecordAdminStatusBadge {
  if (row.paymentMethodType === "us_bank_account") {
    const provider = row.stripeProviderStatus;
    if (provider === "requires_action") {
      return { label: "Verify bank", tone: "warning" };
    }
    if (provider === "processing" && row.status === "succeeded") {
      return { label: "Processing", tone: "info" };
    }
    if (provider === "failed") {
      return { label: "Failed", tone: "alert" };
    }
  }

  return {
    label: PAYMENT_STATUS_LABELS[row.status],
    tone: adminStatusTone(row.status),
  };
}

export function pendingCheckoutPaymentHint(
  payment: Pick<
    PaymentRecord,
    "paymentMethodType" | "stripeProviderStatus"
  > | null,
): string | null {
  if (!payment) return null;
  if (payment.paymentMethodType !== "us_bank_account") return null;
  if (payment.stripeProviderStatus === "requires_action") {
    return "Complete bank verification — check your email for the Stripe link.";
  }
  return "Bank payment processing — usually 3–5 business days";
}

/** Pick the most urgent ACH stripe status when showing one badge for grouped payments. */
export function pickStripeStatusSourceForPayments<
  T extends Pick<
    PaymentRecord,
    "paymentMethodType" | "stripeProviderStatus" | "status"
  >,
>(payments: T[]): T | null {
  const ach = payments.filter((p) => p.paymentMethodType === "us_bank_account");
  if (ach.length === 0) return null;

  const priority = (p: T) => {
    const s = p.stripeProviderStatus;
    if (s === "requires_action") return 3;
    if (s === "failed") return 2;
    if (s === "processing") return 1;
    return 0;
  };

  let best = ach[0]!;
  for (const p of ach) {
    if (priority(p) > priority(best)) best = p;
  }
  return priority(best) > 0 ? best : null;
}

export function parentBillingStatusBadgeStyles(
  C: AdminThemeTokens,
  tone: ChargeStatusBadgeTone,
): { backgroundColor: string; color: string } {
  switch (tone) {
    case "success":
      return { backgroundColor: C.successBg, color: C.success };
    case "info":
      return { backgroundColor: C.infoBg, color: C.info };
    case "accent":
      return { backgroundColor: C.accentLight, color: C.accent };
    case "warning":
      return { backgroundColor: C.warningBg, color: C.warning };
    case "danger":
      return { backgroundColor: C.errorBg, color: C.error };
    default:
      return { backgroundColor: C.elevated, color: C.textSecondary };
  }
}
