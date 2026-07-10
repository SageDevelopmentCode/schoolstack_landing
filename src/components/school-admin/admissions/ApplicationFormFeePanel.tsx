"use client";

import Link from "next/link";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import type { ApplicationFormFeeConfig } from "@/lib/admissions/application-form-schema";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { BuilderQuestionCard } from "./builder-question-card";

type ApplicationFormFeePanelProps = {
  C: AdminThemeTokens;
  feeConfig: ApplicationFormFeeConfig;
  readOnly: boolean;
  onChange: (feeConfig: ApplicationFormFeeConfig) => void;
  hideHeader?: boolean;
  orgSlug?: string;
  stripePaymentsReady?: boolean;
};

export default function ApplicationFormFeePanel({
  C,
  feeConfig,
  readOnly,
  onChange,
  hideHeader = false,
  orgSlug,
  stripePaymentsReady = true,
}: ApplicationFormFeePanelProps) {
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

  const dollars =
    feeConfig.amount_cents !== undefined
      ? (feeConfig.amount_cents / 100).toFixed(2)
      : "0.00";

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

  const feeFields = feeConfig.enabled ? (
    <>
      <BuilderQuestionCard
        C={C}
        tone="clay"
        question="What should this fee be called?"
        helper="This label appears on the checkout screen."
      >
        <input
          type="text"
          value={feeConfig.label ?? "Application fee"}
          disabled={readOnly}
          onChange={(e) => onChange({ ...feeConfig, label: e.target.value })}
          style={inputStyle}
        />
      </BuilderQuestionCard>
      <BuilderQuestionCard
        C={C}
        tone="success"
        question="How much should families pay?"
        helper="Enter the amount in US dollars."
      >
        <div className="space-y-2">
          <input
            type="number"
            min={0}
            step={0.01}
            value={dollars}
            disabled={readOnly}
            onChange={(e) => {
              const parsed = Number.parseFloat(e.target.value);
              onChange({
                ...feeConfig,
                amount_cents: Number.isFinite(parsed)
                  ? Math.round(parsed * 100)
                  : 0,
              });
            }}
            style={inputStyle}
          />
          <p className="text-xs" style={{ color: C.textTertiary }}>
            Families will pay {formatFeeAmount(feeConfig.amount_cents ?? 0)}.
          </p>
        </div>
      </BuilderQuestionCard>
    </>
  ) : null;

  if (hideHeader) {
    return (
      <div className="space-y-5">
        {enableCard}
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
