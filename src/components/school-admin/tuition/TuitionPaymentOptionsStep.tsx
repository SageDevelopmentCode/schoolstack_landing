"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import PaymentSchedulePreviewModal from "@/components/school-admin/tuition/PaymentSchedulePreviewModal";
import {
  formatCents,
  formatTierAmountRange,
  tuitionInputToAnnualCents,
  type TuitionInputMode,
} from "@/lib/tuition/pricing";
import {
  buildPaymentOptionPreviews,
  isPaymentCountAllowed,
  isSuggestedPaymentCount,
  MAX_PAYMENT_INSTALLMENT_COUNT,
  maxInstallmentsForSchoolYear,
  paymentScheduleCadence,
  paymentScheduleLabel,
  SUGGESTED_PAYMENT_SCHEDULES,
  schoolYearMonthSpan,
  validateCustomPaymentCount,
  type WizardTierInput,
} from "@/lib/tuition/setup-wizard";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type TuitionPaymentOptionsStepProps = {
  C: AdminThemeTokens;
  annualAmountCents: number;
  billingBasis: TuitionInputMode;
  tiers: WizardTierInput[];
  effectiveStart?: string | null;
  effectiveEnd?: string | null;
  selectedCounts: number[];
  defaultCount: number | null;
  onToggleCount: (count: number) => void;
  onSetDefault: (count: number) => void;
  onAddCustomCount: (count: number) => void;
  onRemoveCustomCount: (count: number) => void;
};

function inputStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };
}

export default function TuitionPaymentOptionsStep({
  C,
  annualAmountCents,
  billingBasis,
  tiers,
  effectiveStart,
  effectiveEnd,
  selectedCounts,
  defaultCount,
  onToggleCount,
  onSetDefault,
  onAddCustomCount,
  onRemoveCustomCount,
}: TuitionPaymentOptionsStepProps) {
  const [customCount, setCustomCount] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);
  const [addCardExpanded, setAddCardExpanded] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const schoolYearMonths = schoolYearMonthSpan(effectiveStart, effectiveEnd);
  const maxInstallments = maxInstallmentsForSchoolYear(effectiveStart, effectiveEnd);

  const tierAnnualAmounts = tiers.map((tier) => ({
    amountCents: tuitionInputToAnnualCents(Number(tier.amount), billingBasis),
  }));
  const tierRangeLabel = formatTierAmountRange(tierAnnualAmounts, billingBasis);

  const availableSuggestedSchedules = useMemo(
    () =>
      SUGGESTED_PAYMENT_SCHEDULES.filter((schedule) =>
        isPaymentCountAllowed(schedule.count, maxInstallments),
      ),
    [maxInstallments],
  );

  const customOnlyCounts = useMemo(
    () =>
      selectedCounts
        .filter((count) => !isSuggestedPaymentCount(count))
        .sort((a, b) => a - b),
    [selectedCounts],
  );

  const selectedPreviews = buildPaymentOptionPreviews(
    annualAmountCents,
    selectedCounts,
  );
  const resolvedDefaultCount =
    defaultCount ?? (selectedCounts.length > 0 ? selectedCounts[0] : null);
  const showDefaultControls = selectedCounts.length > 1;

  const customInputMax =
    maxInstallments != null
      ? Math.min(maxInstallments, MAX_PAYMENT_INSTALLMENT_COUNT)
      : MAX_PAYMENT_INSTALLMENT_COUNT;

  const handleAddCustom = () => {
    const count = Number(customCount);
    const validationError = validateCustomPaymentCount(
      count,
      selectedCounts,
      maxInstallments,
    );
    if (validationError) {
      setCustomError(validationError);
      return;
    }
    setCustomError(null);
    onAddCustomCount(count);
    setCustomCount("");
    setAddCardExpanded(false);
  };

  const closeAddCard = () => {
    setAddCardExpanded(false);
    setCustomCount("");
    setCustomError(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm" style={{ color: C.textSecondary }}>
          Choose which payment schedules families can select at enrollment. Amounts are
          based on your default tuition rate
          {tiers.length > 1 && tierRangeLabel
            ? ` (${tierRangeLabel} across all rates)`
            : annualAmountCents > 0
              ? ` (${formatCents(annualAmountCents)}/yr)`
              : ""}
          .
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
            Payment schedules
          </p>
          <button
            type="button"
            disabled={selectedCounts.length === 0}
            onClick={() => setPreviewModalOpen(true)}
            className="text-sm px-3 py-1.5 rounded-md font-medium shrink-0 disabled:opacity-50"
            style={getAdminButtonStyle(C, "secondary")}
          >
            Preview schedules
          </button>
        </div>
        {schoolYearMonths != null ? (
          <p className="text-xs" style={{ color: C.textTertiary }}>
            Based on your school year ({schoolYearMonths} months), installment schedules
            are limited to {schoolYearMonths} payments or fewer.
          </p>
        ) : (
          <p className="text-xs" style={{ color: C.textTertiary }}>
            Set school year dates on step 1 to see which schedules fit your calendar.
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {availableSuggestedSchedules.map((schedule) => {
            const preview = buildPaymentOptionPreviews(annualAmountCents, [
              schedule.count,
            ])[0];
            const selected = selectedCounts.includes(schedule.count);
            const isDefault = resolvedDefaultCount === schedule.count;
            return (
              <ScheduleCardShell
                key={schedule.count}
                C={C}
                selected={selected}
              >
                <ScheduleCard
                  C={C}
                  selected={selected}
                  label={schedule.label}
                  cadence={paymentScheduleCadence(schedule.count, schoolYearMonths)}
                  perPayment={preview ? formatCents(preview.amountCents) : "—"}
                  annualTotal={formatCents(annualAmountCents)}
                  onToggle={() => onToggleCount(schedule.count)}
                  isDefault={selected && isDefault}
                  showDefaultControl={selected && showDefaultControls && !isDefault}
                  onSetDefault={() => onSetDefault(schedule.count)}
                />
              </ScheduleCardShell>
            );
          })}

          {customOnlyCounts.map((count) => {
            const preview = buildPaymentOptionPreviews(annualAmountCents, [count])[0];
            const selected = selectedCounts.includes(count);
            const isDefault = resolvedDefaultCount === count;
            return (
              <ScheduleCardShell key={count} C={C} selected={selected}>
                <div className="flex items-start gap-2">
                  <ScheduleCard
                    C={C}
                    selected={selected}
                    label={paymentScheduleLabel(count)}
                    cadence={paymentScheduleCadence(count, schoolYearMonths)}
                    perPayment={preview ? formatCents(preview.amountCents) : "—"}
                    annualTotal={formatCents(annualAmountCents)}
                    onToggle={() => onToggleCount(count)}
                    compact
                    isDefault={selected && isDefault}
                    showDefaultControl={selected && showDefaultControls && !isDefault}
                    onSetDefault={() => onSetDefault(count)}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveCustomCount(count)}
                    className="p-1.5 rounded-md shrink-0 mt-0.5"
                    style={{ color: C.textTertiary }}
                    aria-label={`Remove ${count} payment schedule`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </ScheduleCardShell>
            );
          })}

          <AddScheduleCard
            C={C}
            expanded={addCardExpanded}
            customCount={customCount}
            customInputMax={customInputMax}
            maxInstallments={maxInstallments}
            onExpand={() => setAddCardExpanded(true)}
            onCollapse={closeAddCard}
            onCustomCountChange={(value) => {
              setCustomCount(value);
              setCustomError(null);
            }}
            onAdd={handleAddCustom}
          />
        </div>
        {customError ? (
          <p className="text-sm" style={{ color: C.error }}>
            {customError}
          </p>
        ) : null}
        {selectedCounts.length === 0 ? (
          <p className="text-sm" style={{ color: C.error }}>
            Select at least one payment schedule to continue.
          </p>
        ) : null}
      </div>

      {selectedCounts.length > 0 ? (
        <PaymentSchedulePreviewModal
          C={C}
          open={previewModalOpen}
          previews={selectedPreviews}
          defaultCount={resolvedDefaultCount ?? selectedCounts[0]!}
          annualAmountCents={annualAmountCents}
          effectiveStart={effectiveStart}
          effectiveEnd={effectiveEnd}
          schoolYearMonths={schoolYearMonths}
          onClose={() => setPreviewModalOpen(false)}
        />
      ) : null}
    </div>
  );
}

function ScheduleCardShell({
  C,
  selected,
  children,
}: {
  C: AdminThemeTokens;
  selected: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        border: `1px solid ${selected ? C.accent : C.border}`,
        backgroundColor: selected ? C.accentLight : C.surface,
      }}
    >
      {children}
    </div>
  );
}

function AddScheduleCard({
  C,
  expanded,
  customCount,
  customInputMax,
  maxInstallments,
  onExpand,
  onCollapse,
  onCustomCountChange,
  onAdd,
}: {
  C: AdminThemeTokens;
  expanded: boolean;
  customCount: string;
  customInputMax: number;
  maxInstallments: number | null;
  onExpand: () => void;
  onCollapse: () => void;
  onCustomCountChange: (value: string) => void;
  onAdd: () => void;
}) {
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onExpand}
        className="rounded-lg p-4 flex flex-col items-center justify-center gap-2 min-h-[108px] w-full transition-colors"
        style={{
          border: `1px dashed ${C.borderStrong}`,
          backgroundColor: C.surface,
          color: C.textTertiary,
        }}
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">Add schedule</span>
      </button>
    );
  }

  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-3 min-h-[108px]"
      style={{
        border: `1px dashed ${C.borderStrong}`,
        backgroundColor: C.surface,
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        <span style={{ color: C.textSecondary }}>Installment count</span>
        <input
          style={inputStyle(C)}
          type="number"
          min={1}
          max={customInputMax}
          placeholder="e.g. 6"
          value={customCount}
          autoFocus
          onChange={(e) => onCustomCountChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              onCollapse();
            }
          }}
        />
      </label>
      {maxInstallments != null ? (
        <p className="text-xs" style={{ color: C.textTertiary }}>
          Up to {maxInstallments} installments for your school year
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md font-medium"
          style={{
            backgroundColor: C.accentLight,
            color: C.accent,
            border: `1px solid ${C.accent}`,
          }}
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCollapse}
          className="text-sm px-3 py-1.5 rounded-md"
          style={{ color: C.textSecondary }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ScheduleCard({
  C,
  selected,
  label,
  cadence,
  perPayment,
  annualTotal,
  onToggle,
  compact = false,
  isDefault = false,
  showDefaultControl = false,
  onSetDefault,
}: {
  C: AdminThemeTokens;
  selected: boolean;
  label: string;
  cadence: string;
  perPayment: string;
  annualTotal: string;
  onToggle: () => void;
  compact?: boolean;
  isDefault?: boolean;
  showDefaultControl?: boolean;
  onSetDefault?: () => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 cursor-pointer ${compact ? "flex-1 min-w-0" : ""}`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="mt-1"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
          {cadence}
        </p>
        <p className="text-xs mt-1.5" style={{ color: C.textSecondary }}>
          {perPayment} per payment · {annualTotal}/yr
        </p>
        {isDefault ? (
          <span
            className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-2"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            Default
          </span>
        ) : showDefaultControl ? (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSetDefault?.();
            }}
            className="text-xs font-medium mt-2 underline-offset-2 hover:underline"
            style={{ color: C.accent }}
          >
            Set as default
          </button>
        ) : null}
      </div>
    </label>
  );
}
