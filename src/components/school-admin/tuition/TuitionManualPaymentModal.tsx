"use client";

import { useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import {
  formatCentsForInput,
  parseDollarInputToCents,
  sanitizeDollarDraft,
} from "@/lib/admissions/application-form-schema";
import SchoolAdminModalShell from "@/components/school-admin/ui/SchoolAdminModalShell";
import { chargeRemainingCents } from "@/lib/tuition/billing-splits";
import { formatCents } from "@/lib/tuition/pricing";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import { buildAdminThemeTokens, type AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  maxTuitionPayCents,
  validateTuitionPayAmountCents,
} from "@/lib/tuition/tuition-pay-amount";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ManualPaymentCharge = {
  id: string;
  label: string;
  amountCents: number;
  paidCents: number;
};

type TuitionManualPaymentModalProps = {
  open: boolean;
  charge: ManualPaymentCharge | null;
  branding: OrganizationBranding;
  saving?: boolean;
  onClose: () => void;
  onConfirm: (amountCents: number) => void | Promise<void>;
};

type TuitionManualPaymentFormProps = {
  charge: ManualPaymentCharge;
  C: AdminThemeTokens;
  saving: boolean;
  onClose: () => void;
  onConfirm: (amountCents: number) => void | Promise<void>;
};

function TuitionManualPaymentForm({
  charge,
  C,
  saving,
  onClose,
  onConfirm,
}: TuitionManualPaymentFormProps) {
  const remainingCents = chargeRemainingCents(charge);
  const [amountDraft, setAmountDraft] = useState(() =>
    formatCentsForInput(remainingCents),
  );
  const [error, setError] = useState<string | null>(null);

  const parsedAmountCents = parseDollarInputToCents(amountDraft);
  const validationError =
    parsedAmountCents == null
      ? "Enter a valid payment amount."
      : validateTuitionPayAmountCents({
          amountCents: parsedAmountCents,
          remainingCents,
        });

  const handleConfirm = async () => {
    if (parsedAmountCents == null || validationError) {
      setError(validationError ?? "Enter a valid payment amount.");
      return;
    }
    setError(null);
    await onConfirm(parsedAmountCents);
  };

  return (
    <div className="flex flex-col">
      <div
        className="flex items-center justify-between gap-3 px-5 py-4"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <h2
          id="tuition-manual-payment-modal-title"
          className="text-base font-semibold"
          style={{ color: C.textPrimary }}
        >
          Record manual payment
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1"
          aria-label="Close"
        >
          <X className="h-4 w-4" style={{ color: C.textSecondary }} />
        </button>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div>
          <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
            {charge.label}
          </p>
          <p className="text-xs mt-1" style={{ color: C.textSecondary }}>
            Remaining balance: {formatCents(remainingCents)}
          </p>
        </div>

        <div>
          <label
            htmlFor="tuition-manual-payment-amount"
            className="mb-1 block text-xs font-medium"
            style={{ color: C.textSecondary }}
          >
            Payment amount
          </label>
          <div className="relative">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: C.textTertiary }}
            >
              $
            </span>
            <input
              id="tuition-manual-payment-amount"
              type="text"
              inputMode="decimal"
              value={amountDraft}
              onChange={(event) =>
                setAmountDraft(sanitizeDollarDraft(event.target.value))
              }
              onBlur={() => {
                const cents = parseDollarInputToCents(amountDraft);
                setAmountDraft(formatCentsForInput(cents ?? 0));
              }}
              className="w-full rounded-lg border py-2 pl-7 pr-3 text-sm"
              style={{
                borderColor: error ? C.error : C.border,
                backgroundColor: C.surface,
                color: C.textPrimary,
              }}
              data-testid="tuition-manual-payment-amount-input"
            />
          </div>
          <p className="mt-1 text-xs" style={{ color: C.textTertiary }}>
            Between {formatCents(remainingCents)} and{" "}
            {formatCents(maxTuitionPayCents({ remainingCents }))}. Amounts above the
            balance reduce future installments.
          </p>
          {error ? (
            <p className="mt-1 text-xs" style={{ color: C.error }} role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className="flex justify-end gap-2 px-5 py-4"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          style={getAdminButtonStyle(C, "secondary")}
          className="px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={saving || Boolean(validationError)}
          style={getAdminButtonStyle(C, "primary")}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium disabled:opacity-50"
          data-testid="tuition-manual-payment-confirm"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Record payment
        </button>
      </div>
    </div>
  );
}

export default function TuitionManualPaymentModal({
  open,
  charge,
  branding,
  saving = false,
  onClose,
  onConfirm,
}: TuitionManualPaymentModalProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  return (
    <SchoolAdminModalShell
      open={open && charge != null}
      onClose={onClose}
      maxWidth="md"
      ariaLabelledBy="tuition-manual-payment-modal-title"
      testId="tuition-manual-payment-modal"
      panelStyle={{
        backgroundColor: C.surface,
        border: `1px solid ${C.border}`,
        boxShadow: C.shadowMedium,
      }}
    >
      {charge ? (
        <TuitionManualPaymentForm
          key={charge.id}
          charge={charge}
          C={C}
          saving={saving}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      ) : null}
    </SchoolAdminModalShell>
  );
}
