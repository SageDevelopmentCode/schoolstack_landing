"use client";

import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import CurrencyAmountInput from "@/components/ui/CurrencyAmountInput";
import { formatFeeAmount, newAdmissionsId } from "@/lib/admissions/application-form-schema";
import type { ApplicationFormFeeConfig } from "@/lib/admissions/application-form-schema";
import type { ChecklistPaymentLineItem } from "@/lib/admissions/enrollment-checklist-schema";
import { sumPaymentLineItems } from "@/lib/admissions/enrollment-checklist-schema";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { BuilderQuestionCard } from "./builder-question-card";

type ApplicationFormFeePanelProps = {
  C: AdminThemeTokens;
  feeConfig: ApplicationFormFeeConfig;
  readOnly: boolean;
  onChange: (feeConfig: ApplicationFormFeeConfig) => void;
  hideHeader?: boolean;
  variant?: "application" | "enrollment";
  orgSlug?: string;
  stripePaymentsReady?: boolean;
  enrollmentLineItems?: ChecklistPaymentLineItem[];
  onEnrollmentLineItemsChange?: (lineItems: ChecklistPaymentLineItem[] | undefined) => void;
};

function createDefaultEnrollmentLineItems(): ChecklistPaymentLineItem[] {
  return [
    { id: newAdmissionsId(), label: "Fee 1", amountCents: 0 },
    { id: newAdmissionsId(), label: "Fee 2", amountCents: 0 },
  ];
}

export default function ApplicationFormFeePanel({
  C,
  feeConfig,
  readOnly,
  onChange,
  hideHeader = false,
  variant = "application",
  orgSlug,
  stripePaymentsReady = true,
  enrollmentLineItems,
  onEnrollmentLineItemsChange,
}: ApplicationFormFeePanelProps) {
  const isEnrollment = variant === "enrollment";
  const feeEnabled = isEnrollment || feeConfig.enabled;
  const breakdownEnabled = Boolean(enrollmentLineItems?.length);
  const totalCents = breakdownEnabled
    ? sumPaymentLineItems(enrollmentLineItems ?? [])
    : (feeConfig.amount_cents ?? 0);

  const inputStyle: React.CSSProperties = {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.sm,
    fontSize: "12px",
    padding: "8px 10px",
    width: "100%",
    boxSizing: "border-box",
  };

  const currencyInputStyle: React.CSSProperties = {
    borderRadius: C.r.sm,
    fontSize: "12px",
  };

  function updateLineItems(nextLineItems: ChecklistPaymentLineItem[] | undefined) {
    if (onEnrollmentLineItemsChange) {
      onEnrollmentLineItemsChange(nextLineItems);
      return;
    }
    if (nextLineItems?.length) {
      onChange({
        ...feeConfig,
        amount_cents: sumPaymentLineItems(nextLineItems),
      });
    }
  }

  function updateLineItem(
    index: number,
    patch: Partial<Pick<ChecklistPaymentLineItem, "label" | "amountCents">>,
  ) {
    const lineItems = [...(enrollmentLineItems ?? [])];
    lineItems[index] = { ...lineItems[index], ...patch };
    updateLineItems(lineItems);
  }

  const stripeWarning = isEnrollment && !stripePaymentsReady && orgSlug ? (
    <div
      className="rounded-md border px-3 py-2.5 text-xs leading-relaxed"
      style={{
        borderColor: C.errorBorder,
        backgroundColor: C.errorBg,
        color: C.error,
      }}
    >
      Connect Stripe before publishing a checklist with a payment.{" "}
      <Link
        href={schoolAdminPath(orgSlug, "admissions", "payments")}
        className="font-medium underline underline-offset-2"
        style={{ color: C.accent }}
      >
        Set up payments
      </Link>
    </div>
  ) : null;

  const enableCard = (
    <BuilderQuestionCard
      C={C}
      tone="accent"
      question="Do you want to charge an application fee?"
      helper="Families pay this on the final review screen before they can submit."
    >
      <div className="space-y-3">
        <label
          className="inline-flex items-center gap-2 text-sm font-medium"
          style={{ color: C.textPrimary }}
        >
          <input
            type="checkbox"
            checked={feeConfig.enabled}
            disabled={readOnly}
            onChange={(e) => onChange({ ...feeConfig, enabled: e.target.checked })}
            className="h-4 w-4 rounded"
            style={{ accentColor: C.accent }}
          />
          Yes, charge an application fee
        </label>
        {feeConfig.enabled && !stripePaymentsReady && orgSlug ? (
          <div
            className="rounded-md border px-3 py-2.5 text-xs leading-relaxed"
            style={{
              borderColor: C.errorBorder,
              backgroundColor: C.errorBg,
              color: C.error,
            }}
          >
            Connect Stripe before publishing a form with a fee.{" "}
            <Link
              href={schoolAdminPath(orgSlug, "admissions", "payments")}
              className="font-medium underline underline-offset-2"
              style={{ color: C.accent }}
            >
              Set up payments
            </Link>
          </div>
        ) : null}
      </div>
    </BuilderQuestionCard>
  );

  const feeFields = feeEnabled ? (
    <>
      <BuilderQuestionCard
        C={C}
        tone="clay"
        question={
          isEnrollment
            ? "What should this payment be called?"
            : "What should this fee be called?"
        }
        helper={
          isEnrollment
            ? "Shown on the family checkout screen."
            : "This label appears on the checkout screen."
        }
      >
        <input
          type="text"
          value={feeConfig.label ?? (isEnrollment ? "Enrollment payment" : "Application fee")}
          disabled={readOnly}
          onChange={(e) => onChange({ ...feeConfig, label: e.target.value })}
          style={inputStyle}
        />
      </BuilderQuestionCard>

      {isEnrollment ? (
        <BuilderQuestionCard
          C={C}
          tone="accent"
          question="How should families see this payment?"
          helper="Choose whether families see one total or a breakdown of individual fees."
        >
          <div className="space-y-2">
            <label
              className="flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2.5 text-[11px]"
              style={{
                borderColor: !breakdownEnabled ? C.accent : C.border,
                backgroundColor: !breakdownEnabled ? C.accentLight : C.surface,
                color: C.textSecondary,
              }}
            >
              <input
                type="radio"
                name="enrollment-payment-mode"
                checked={!breakdownEnabled}
                disabled={readOnly}
                onChange={() => updateLineItems(undefined)}
                className="mt-0.5"
                style={{ accentColor: C.accent }}
              />
              <span>
                <span className="font-medium" style={{ color: C.textPrimary }}>
                  Single combined amount
                </span>
                <span className="mt-0.5 block text-[10px]" style={{ color: C.textTertiary }}>
                  Families see one total on checkout.
                </span>
              </span>
            </label>

            <label
              className="flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2.5 text-[11px]"
              style={{
                borderColor: breakdownEnabled ? C.accent : C.border,
                backgroundColor: breakdownEnabled ? C.accentLight : C.surface,
                color: C.textSecondary,
              }}
            >
              <input
                type="radio"
                name="enrollment-payment-mode"
                checked={breakdownEnabled}
                disabled={readOnly}
                onChange={() => updateLineItems(createDefaultEnrollmentLineItems())}
                className="mt-0.5"
                style={{ accentColor: C.accent }}
              />
              <span>
                <span className="font-medium" style={{ color: C.textPrimary }}>
                  Show fee breakdown
                </span>
                <span className="mt-0.5 block text-[10px]" style={{ color: C.textTertiary }}>
                  List individual fees that add up to one payment.
                </span>
              </span>
            </label>
          </div>
        </BuilderQuestionCard>
      ) : null}

      {breakdownEnabled ? (
        <BuilderQuestionCard
          C={C}
          tone="success"
          question="What fees are included?"
          helper="Families pay the combined total in one checkout."
        >
          <div className="space-y-3">
            {(enrollmentLineItems ?? []).map((lineItem, index) => (
              <div key={lineItem.id} className="flex gap-2 items-start">
                <span
                  className="mt-2.5 text-xs font-bold shrink-0"
                  style={{ color: C.textTertiary }}
                >
                  {index + 1}.
                </span>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={lineItem.label}
                    disabled={readOnly}
                    onChange={(e) => updateLineItem(index, { label: e.target.value })}
                    placeholder="Fee name"
                    style={inputStyle}
                  />
                  <CurrencyAmountInput
                    C={C}
                    valueCents={lineItem.amountCents}
                    disabled={readOnly}
                    onChangeCents={(amountCents) => updateLineItem(index, { amountCents })}
                    style={currencyInputStyle}
                  />
                </div>
                {!readOnly && (enrollmentLineItems?.length ?? 0) > 2 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const next = (enrollmentLineItems ?? []).filter(
                        (item) => item.id !== lineItem.id,
                      );
                      updateLineItems(next);
                    }}
                    className="mt-1 rounded p-1.5 shrink-0"
                    style={{ color: C.error, backgroundColor: C.errorBg }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            ))}

            {!readOnly ? (
              <button
                type="button"
                onClick={() => {
                  updateLineItems([
                    ...(enrollmentLineItems ?? []),
                    {
                      id: newAdmissionsId(),
                      label: "New fee",
                      amountCents: 0,
                    },
                  ]);
                }}
                className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: C.accentLight,
                  color: C.accent,
                  border: `1px solid ${C.secondaryBtnBorder}`,
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                Add fee
              </button>
            ) : null}

            <p className="text-xs" style={{ color: C.textTertiary }}>
              Families will pay {formatFeeAmount(totalCents)}.
            </p>
            {stripeWarning}
          </div>
        </BuilderQuestionCard>
      ) : (
        <BuilderQuestionCard
          C={C}
          tone="success"
          question="How much should families pay?"
          helper="Enter the amount in US dollars."
        >
          <div className="space-y-2">
            <CurrencyAmountInput
              C={C}
              valueCents={feeConfig.amount_cents ?? 0}
              disabled={readOnly}
              onChangeCents={(amount_cents) => onChange({ ...feeConfig, amount_cents })}
              style={currencyInputStyle}
            />
            <p className="text-xs" style={{ color: C.textTertiary }}>
              Families will pay {formatFeeAmount(feeConfig.amount_cents ?? 0)}.
            </p>
            {stripeWarning}
          </div>
        </BuilderQuestionCard>
      )}
    </>
  ) : null;

  if (hideHeader) {
    return (
      <div className="space-y-5">
        {!isEnrollment ? enableCard : null}
        {feeFields}
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border p-5 space-y-5"
      style={{ borderColor: C.border, backgroundColor: C.surface }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            Application fee
          </p>
          <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
            Collected at the end of the application before submit.
          </p>
        </div>
      </div>
      {enableCard}
      {feeFields}
    </div>
  );
}
