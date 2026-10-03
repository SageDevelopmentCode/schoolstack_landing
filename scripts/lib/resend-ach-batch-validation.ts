import type { PaymentRecord } from "@/lib/stripe/application-payments";
import type { AchVerificationAction } from "@/lib/stripe/payment-intent-bank-verification";

export type AchResendReadyRow = {
  payment: Pick<PaymentRecord, "id" | "familyId" | "applicationId">;
  verificationAction: Pick<AchVerificationAction, "hostedVerificationUrl">;
};

export function payerScopeKey(
  payment: Pick<PaymentRecord, "id" | "familyId" | "applicationId">,
): string {
  if (payment.familyId) return `family:${payment.familyId}`;
  if (payment.applicationId) return `application:${payment.applicationId}`;
  return `payment:${payment.id}`;
}

export type ValidateAchResendBatchResult =
  | { ok: true }
  | { ok: false; reason: string };

export function validateAchResendBatch(
  rows: AchResendReadyRow[],
  options: { requireSingleVerificationUrl: boolean },
): ValidateAchResendBatchResult {
  if (rows.length <= 1) {
    return { ok: true };
  }

  const scopeKeys = rows.map((row) => payerScopeKey(row.payment));
  const uniqueScopes = new Set(scopeKeys);
  if (uniqueScopes.size > 1) {
    const details = rows
      .map((row) => `${row.payment.id} → ${payerScopeKey(row.payment)}`)
      .join(", ");
    return {
      ok: false,
      reason: `Payments belong to different payer scopes (${details}). Run one PAYMENT_ID at a time.`,
    };
  }

  if (options.requireSingleVerificationUrl) {
    const urls = new Set(
      rows.map((row) => row.verificationAction.hostedVerificationUrl),
    );
    if (urls.size > 1) {
      return {
        ok: false,
        reason:
          `${rows.length} payments have different Stripe verification URLs. ` +
          "Use PRINT_MANUAL=1 for a multi-link draft, or DRY_RUN=0 PAYMENT_ID=<one uuid> per payment.",
      };
    }
  }

  return { ok: true };
}
