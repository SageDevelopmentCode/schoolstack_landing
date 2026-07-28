"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import PaymentSchedulePreviewModal from "@/components/school-admin/tuition/PaymentSchedulePreviewModal";
import {
  AddScheduleCard,
  AdminScheduleCard,
  ScheduleCardShell,
} from "@/components/school-admin/tuition/TuitionPaymentScheduleCards";
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
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          Which payment schedules should families be able to choose at enrollment?
        </p>
        <p className="text-xs mt-1" style={{ color: C.textTertiary }}>
          Amounts are based on your default tuition rate
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
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
              Which schedules do you want to offer?
            </p>
            <p className="text-xs" style={{ color: C.textTertiary }}>
              Families pick one when they enroll. Amounts are based on your default tuition rate.
            </p>
          </div>
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
                <AdminScheduleCard
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
                  <AdminScheduleCard
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
