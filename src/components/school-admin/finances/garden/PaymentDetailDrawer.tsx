"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GChip, gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import { PAYMENT_TYPE_LABELS, type PaymentRecordDisplayRow } from "@/lib/admissions/payment-records";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { GardenCopyRow, GardenFacts, GardenHint } from "@/components/school-admin/garden/blocks";
import { GardenNotice } from "@/components/school-admin/garden/kit";
import {
  applicationHref,
  formatPaymentDateTime,
  paymentMethod,
  paymentPayer,
  paymentStatusChip,
  paymentTitle,
  paymentWhen,
} from "./payment-display";

type NextStep = {
  tone: "info" | "success" | "warning" | "alert";
  title: string;
  body: string;
};

/** What this payment's status means right now, in admin words. */
function nextStepFor(row: PaymentRecordDisplayRow): NextStep {
  if (row.paymentMethodType === "us_bank_account") {
    if (row.stripeProviderStatus === "requires_action") {
      return {
        tone: "warning",
        title: "Waiting on the family to verify their bank",
        body: "Stripe emailed them a verification link. The payment finishes once they complete it.",
      };
    }
    if (row.stripeProviderStatus === "failed") {
      return {
        tone: "alert",
        title: "This bank payment didn't go through",
        body: "Nothing was collected. The family can pay again, or use a card instead.",
      };
    }
    if (row.stripeProviderStatus === "processing" && (row.status === "succeeded" || row.status === "pending")) {
      return {
        tone: "info",
        title: "Bank payment processing",
        body: "Usually 3–5 business days. Nothing to do on your side.",
      };
    }
  }
  switch (row.status) {
    case "succeeded":
      return {
        tone: "success",
        title: "Collected",
        body: row.paidAt
          ? `Collected through Stripe on ${formatPaymentDateTime(row.paidAt)}.`
          : "Collected through Stripe.",
      };
    case "pending":
      return {
        tone: "warning",
        title: "Waiting on Stripe",
        body: "The family started this payment, but Stripe hasn't confirmed it yet. Refresh later to see the latest status.",
      };
    case "failed":
      return {
        tone: "alert",
        title: "This payment didn't go through",
        body: "Nothing was collected. The family will need to pay again.",
      };
    case "refunded":
      return { tone: "info", title: "Refunded", body: "This payment was returned to the family." };
    default:
      return { tone: "info", title: "Canceled", body: "This payment was canceled. Nothing was collected." };
  }
}

/**
 * Read-only payment details for the Finances ledger. Mount outside the page
 * frame (GSidePanel carries its own). Nothing here writes data.
 */
export default function PaymentDetailDrawer({
  theme,
  row,
  orgSlug,
  onClose,
}: {
  theme: ParentThemeTokens;
  row: PaymentRecordDisplayRow | null;
  orgSlug: string;
  onClose: () => void;
}) {
  // Keep the last payment on screen while the drawer animates closed.
  const [shown, setShown] = useState(row);
  if (row && row !== shown) setShown(row);
  const payment = row ?? shown;

  const status = payment ? paymentStatusChip(payment) : null;
  const step = payment ? nextStepFor(payment) : null;

  return (
    <GSidePanel
      theme={theme}
      open={row != null}
      onClose={onClose}
      title={payment ? paymentTitle(payment) : "Payment"}
      kicker={payment ? PAYMENT_TYPE_LABELS[payment.paymentType] : "Payment"}
      subtitle={payment ? paymentWhen(payment) : undefined}
      testId="finances-payment-drawer"
      panelId="finances-payment-drawer"
      closeLabel="Close payment details"
      headerAside={
        payment && status ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <GChip tone={status.tone}>{status.label}</GChip>
            <GChip tone="neutral">{paymentMethod(payment)}</GChip>
          </div>
        ) : null
      }
      footer={
        payment ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" onClick={onClose} className={gBtnOutlineSm}>
              Close
            </button>
            {payment.applicationId ? (
              <Link href={applicationHref(orgSlug, payment.applicationId)} className={gBtnOutlineSm}>
                Open application
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : null}
          </div>
        ) : null
      }
    >
      {payment && step ? (
        <div className="flex flex-col gap-5">
          <div className="rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-4 py-4">
            <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
              School amount
            </p>
            <p className="sf-display m-0 mt-1 text-[2.2rem] leading-none tabular-nums text-[var(--sf-ink)]">
              {formatFeeAmount(payment.amountCents)}
            </p>
            <p className="m-0 mt-2 text-[13px] font-semibold text-[var(--sf-soft)]">
              Family was charged{" "}
              <span className="font-extrabold tabular-nums text-[var(--sf-ink)]/80">
                {formatFeeAmount(payment.chargedAmountCents ?? payment.amountCents)}
              </span>
              {payment.processingFeeCents ? (
                <>
                  {" "}
                  · includes{" "}
                  <span className="tabular-nums">{formatFeeAmount(payment.processingFeeCents)}</span> processing fee
                </>
              ) : null}
            </p>
          </div>

          <GardenNotice tone={step.tone} title={step.title} role="status">
            {step.body}
          </GardenNotice>

          <section aria-label="Payment details">
            <GardenFacts
              items={[
                { label: "Payer", value: paymentPayer(payment) },
                { label: "Type", value: PAYMENT_TYPE_LABELS[payment.paymentType] },
                { label: "Method", value: paymentMethod(payment) },
                { label: "Status", value: status?.label ?? "—" },
                { label: "Paid", value: formatPaymentDateTime(payment.paidAt) },
                { label: "Started", value: formatPaymentDateTime(payment.createdAt) },
                ...(payment.amountAppliedCents != null && payment.amountAppliedCents !== payment.amountCents
                  ? [{ label: "Applied to balance", value: formatFeeAmount(payment.amountAppliedCents) }]
                  : []),
                ...(payment.applicantLabel && payment.applicantLabel !== paymentPayer(payment)
                  ? [{ label: "Applicant", value: payment.applicantLabel }]
                  : []),
              ]}
            />
          </section>

          {payment.stripePaymentIntentId || payment.stripeCheckoutSessionId ? (
            <section aria-label="Stripe references" className="flex flex-col gap-2">
              <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
                Stripe reference
              </p>
              {payment.stripePaymentIntentId ? (
                <GardenCopyRow
                  value={payment.stripePaymentIntentId}
                  label="Payment ID"
                  toastTitle="Payment ID copied."
                  data-testid="finances-payment-intent-id"
                />
              ) : null}
              {payment.stripeCheckoutSessionId ? (
                <GardenCopyRow
                  value={payment.stripeCheckoutSessionId}
                  label="Checkout session ID"
                  toastTitle="Checkout session ID copied."
                />
              ) : null}
              <GardenHint icon={Search}>
                Search for this ID in your Stripe dashboard to see the full charge, receipt and payout.
              </GardenHint>
            </section>
          ) : null}
        </div>
      ) : null}
    </GSidePanel>
  );
}
