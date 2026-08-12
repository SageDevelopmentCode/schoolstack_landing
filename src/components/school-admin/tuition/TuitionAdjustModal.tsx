"use client";

import { useEffect, useMemo, useState } from "react";
import CurrencyAmountInput from "@/components/ui/CurrencyAmountInput";
import {
  computeAdjustmentImpactPreview,
  formatAdjustmentDetailLine,
} from "@/lib/tuition/adjustment-impact";
import { computeAdjustedAmountCents, formatCents } from "@/lib/tuition/pricing";
import { createAdjustment, listAdjustmentsForAssignment } from "@/lib/tuition/adjustments";
import { listChargesForAssignment } from "@/lib/tuition/charges";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { AdjustmentType, TuitionAdjustment, TuitionCharge } from "@/lib/tuition/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import SchoolAdminModalShell from "@/components/school-admin/ui/SchoolAdminModalShell";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { createClient } from "@/utils/supabase/client";

const ADJUST_REASONS = [
  "Sibling discount",
  "Financial aid",
  "Staff/faculty",
  "Custom arrangement",
] as const;

const ADJUST_TYPE_HELP: Record<AdjustmentType, string> = {
  percent_discount: "Reduce each installment by a percentage.",
  fixed_discount: "Subtract a fixed dollar amount from each installment.",
  custom_amount: "Set a custom amount for each installment.",
  waiver: "Waive tuition charges going forward.",
};

const PERCENT_INPUT_PATTERN = /^\d*(\.\d{0,2})?$/;
const PREVIEW_INSTALLMENT_LIMIT = 5;

function sanitizePercentDraft(value: string): string {
  const trimmed = value.replace(/%/g, "").trim();
  if (!trimmed) return "";
  if (trimmed === "." || PERCENT_INPUT_PATTERN.test(trimmed)) return trimmed;
  return trimmed.slice(0, -1);
}

function parsePercentDraft(value: string): number | null {
  const draft = value.replace(/%/g, "").trim();
  if (!draft || draft === ".") return 0;
  if (draft.endsWith(".")) return null;

  const parsed = Number.parseFloat(draft);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return null;
  return parsed;
}

function formatPercentForInput(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

type TuitionAdjustModalProps = {
  open: boolean;
  organizationId: string;
  familyId: string;
  assignmentId: string;
  studentName: string | null;
  branding: OrganizationBranding;
  onClose: () => void;
  onSaved: () => void;
};

export default function TuitionAdjustModal({
  open,
  organizationId,
  assignmentId,
  studentName,
  branding,
  onClose,
  onSaved,
}: TuitionAdjustModalProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);

  const [adjustType, setAdjustType] = useState<AdjustmentType>("percent_discount");
  const [percentValue, setPercentValue] = useState(10);
  const [amountCents, setAmountCents] = useState(1000);
  const [percentFocused, setPercentFocused] = useState(false);
  const [percentDraft, setPercentDraft] = useState("10");
  const [reason, setReason] = useState<string>(ADJUST_REASONS[0]);
  const [baseAmountCents, setBaseAmountCents] = useState(0);
  const [charges, setCharges] = useState<TuitionCharge[]>([]);
  const [existing, setExisting] = useState<TuitionAdjustment[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !assignmentId) return;

    void (async () => {
      const [adjustments, assignmentCharges] = await Promise.all([
        listAdjustmentsForAssignment(supabase, assignmentId),
        listChargesForAssignment(supabase, assignmentId),
      ]);
      setExisting(adjustments);
      setCharges(assignmentCharges);
      const tuitionCharge = assignmentCharges.find((c) => c.chargeType === "tuition");
      if (tuitionCharge) setBaseAmountCents(tuitionCharge.baseAmountCents);
    })();
  }, [assignmentId, open, supabase]);

  const draftAdjustment = useMemo(
    () => ({
      adjustmentType: adjustType,
      valuePercent: adjustType === "percent_discount" ? percentValue : null,
      valueCents:
        adjustType === "fixed_discount" || adjustType === "custom_amount"
          ? amountCents
          : adjustType === "waiver"
            ? 0
            : null,
      priority: existing.length,
      scope: "installment" as const,
    }),
    [adjustType, amountCents, existing.length, percentValue],
  );

  const impactPreview = useMemo(
    () =>
      computeAdjustmentImpactPreview({
        charges,
        baseAmountCents,
        existingAdjustments: existing,
        draftAdjustment,
      }),
    [baseAmountCents, charges, draftAdjustment, existing],
  );

  const adjustedPerInstallment = computeAdjustedAmountCents(baseAmountCents, [
    ...existing.map((adjustment) => ({
      adjustmentType: adjustment.adjustmentType,
      valuePercent: adjustment.valuePercent,
      valueCents: adjustment.valueCents,
      priority: adjustment.priority,
      scope: adjustment.scope,
    })),
    draftAdjustment,
  ]);

  const percentInputValid =
    adjustType !== "percent_discount" || parsePercentDraft(percentDraft) !== null;
  const amountInputValid =
    adjustType === "fixed_discount" || adjustType === "custom_amount"
      ? amountCents >= 0
      : true;
  const canSave =
    impactPreview.scenario !== "no_charges" && percentInputValid && amountInputValid;

  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);
    try {
      await createAdjustment(supabase, {
        organizationId,
        assignmentId,
        adjustmentType: adjustType,
        valuePercent: adjustType === "percent_discount" ? percentValue : null,
        valueCents:
          adjustType === "fixed_discount" || adjustType === "custom_amount"
            ? amountCents
            : null,
        reason,
        source: "manual",
      });
      adminToast.success("Adjustment saved");
      onSaved();
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to save adjustment."));
    } finally {
      setSaving(false);
    }
  };

  const valueLabel =
    adjustType === "percent_discount"
      ? "Enter the discount percentage."
      : adjustType === "custom_amount"
        ? "Enter the new installment amount in dollars."
        : "Enter the discount amount in dollars.";

  const valueQuestionLabel =
    adjustType === "custom_amount"
      ? "What should each installment be?"
      : "How much is the discount?";

  const modalTitle = studentName ? `Adjust tuition for ${studentName}` : "Adjust tuition";
  const upcomingPreview = impactPreview.upcomingInstallments;
  const visibleUpcoming = upcomingPreview.slice(0, PREVIEW_INSTALLMENT_LIMIT);
  const hiddenUpcomingCount = upcomingPreview.length - visibleUpcoming.length;

  return (
    <SchoolAdminModalShell
      open={open}
      onClose={onClose}
      maxWidth="lg"
      ariaLabel={modalTitle}
      panelStyle={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
    >
      <div className="p-5 flex flex-col gap-4">
        <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
          {modalTitle}
        </p>

        {existing.length > 0 ? (
          <div
            className="rounded-md p-3 text-sm flex flex-col gap-2"
            style={{
              backgroundColor: C.warningBg,
              border: `1px solid ${C.warningBorder}`,
            }}
          >
            <p className="font-medium" style={{ color: C.warning }}>
              Current adjustments on this assignment
            </p>
            <ul className="flex flex-col gap-1">
              {existing.map((adjustment) => (
                <li key={adjustment.id} style={{ color: C.textSecondary }}>
                  {formatAdjustmentDetailLine(adjustment)}
                </li>
              ))}
            </ul>
            <p className="text-xs" style={{ color: C.textTertiary }}>
              Your new adjustment will stack with these.
            </p>
          </div>
        ) : null}

        <div className="grid gap-3">
          <label className="text-sm flex flex-col gap-1">
            <span className="font-medium" style={{ color: C.textPrimary }}>
              What type of discount should apply?
            </span>
            <SchoolAdminSelect
              C={C}
              value={adjustType}
              onChange={(value) => setAdjustType(value as AdjustmentType)}
              options={[
                { value: "percent_discount", label: "% Discount" },
                { value: "fixed_discount", label: "$ Discount" },
                { value: "custom_amount", label: "Custom amount" },
                { value: "waiver", label: "Waiver" },
              ]}
              ariaLabel="Adjustment type"
            />
            <span className="text-xs" style={{ color: C.textTertiary }}>
              {ADJUST_TYPE_HELP[adjustType]}
            </span>
          </label>

          {adjustType !== "waiver" ? (
            <label className="text-sm flex flex-col gap-1">
              <span className="font-medium" style={{ color: C.textPrimary }}>
                {valueQuestionLabel}
              </span>
              {adjustType === "percent_discount" ? (
                <div
                  className="flex overflow-hidden rounded-md"
                  style={{
                    border: `1px solid ${C.inputBorder}`,
                    backgroundColor: C.input,
                  }}
                >
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={
                      percentFocused ? percentDraft : formatPercentForInput(percentValue)
                    }
                    onFocus={() => {
                      setPercentFocused(true);
                      setPercentDraft(formatPercentForInput(percentValue));
                    }}
                    onChange={(event) => {
                      const nextDraft = sanitizePercentDraft(event.target.value);
                      setPercentDraft(nextDraft);
                      const parsed = parsePercentDraft(nextDraft);
                      if (parsed !== null) {
                        setPercentValue(parsed);
                      }
                    }}
                    onBlur={() => {
                      const parsed = parsePercentDraft(percentDraft);
                      const committed = parsed ?? percentValue;
                      setPercentValue(committed);
                      setPercentDraft(formatPercentForInput(committed));
                      setPercentFocused(false);
                    }}
                    className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm outline-none tabular-nums"
                    style={{ color: C.textPrimary }}
                    aria-label="Discount percentage"
                  />
                  <span
                    className="flex shrink-0 items-center px-3 text-sm"
                    style={{
                      color: C.textSecondary,
                      borderLeft: `1px solid ${C.inputBorder}`,
                      backgroundColor: C.elevated,
                    }}
                    aria-hidden="true"
                  >
                    %
                  </span>
                </div>
              ) : (
                <CurrencyAmountInput
                  C={C}
                  valueCents={amountCents}
                  onChangeCents={setAmountCents}
                  style={{ fontSize: "14px", borderRadius: C.r.md }}
                />
              )}
              <span className="text-xs" style={{ color: C.textTertiary }}>
                {valueLabel}
              </span>
            </label>
          ) : null}

          <label className="text-sm flex flex-col gap-1">
            <span className="font-medium" style={{ color: C.textPrimary }}>
              Why are you applying this adjustment?
            </span>
            <SchoolAdminSelect
              C={C}
              value={reason}
              onChange={setReason}
              options={ADJUST_REASONS.map((r) => ({ value: r, label: r }))}
              ariaLabel="Adjustment reason"
            />
          </label>
        </div>

        <div
          className="rounded-md p-3 text-sm flex flex-col gap-3"
          style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
        >
          <p style={{ color: C.textSecondary }}>
            Standard installment:{" "}
            <span style={{ color: C.textSecondary }}>{formatCents(baseAmountCents)}</span>
            {" → "}
            <strong style={{ color: C.accentDark }}>
              {formatCents(adjustedPerInstallment)}
            </strong>
          </p>

          {impactPreview.scenario === "no_charges" ? (
            <p className="text-sm" style={{ color: C.textSecondary }}>
              No tuition charges are on file yet. Set a payment schedule before applying
              discounts.
            </p>
          ) : null}

          {impactPreview.scenario === "all_paid" ? (
            <div
              className="rounded-md p-3 text-sm"
              style={{
                backgroundColor: C.accentLight,
                border: `1px solid ${C.border}`,
                color: C.textPrimary,
              }}
            >
              <span style={{ color: C.warning }}>
                All tuition for this school year is already paid (
                {formatCents(impactPreview.totals.paidCents)}).
              </span>{" "}
              This adjustment will be recorded but won&apos;t change existing charges. To
              return money to the family, issue a refund separately.
            </div>
          ) : null}

          {impactPreview.paidInstallments.length > 0 &&
          impactPreview.scenario !== "all_paid" ? (
            <div>
              <p className="font-medium" style={{ color: C.textPrimary }}>
                Paid installments (won&apos;t change)
              </p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {impactPreview.paidInstallments.map((installment) => (
                  <li key={installment.label} style={{ color: C.textTertiary }}>
                    {installment.label}: {formatCents(installment.amountCents)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {impactPreview.upcomingInstallments.length > 0 ? (
            <div>
              <p className="font-medium" style={{ color: C.accentDark }}>
                Upcoming installments (will update)
              </p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {visibleUpcoming.map((installment) => (
                  <li key={installment.label}>
                    <span style={{ color: C.textSecondary }}>{installment.label}: </span>
                    <span style={{ color: C.textTertiary }}>
                      {formatCents(installment.currentAmountCents)}
                    </span>
                    {" → "}
                    <strong style={{ color: C.accent }}>
                      {formatCents(installment.newAmountCents)}
                    </strong>
                  </li>
                ))}
                {hiddenUpcomingCount > 0 ? (
                  <li style={{ color: C.textTertiary }}>
                    +{hiddenUpcomingCount} more installment
                    {hiddenUpcomingCount === 1 ? "" : "s"}
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}

          {impactPreview.scenario === "partial_paid" ||
          impactPreview.scenario === "none_paid" ? (
            <p>
              <span style={{ color: C.textSecondary }}>Remaining balance: </span>
              <span style={{ color: C.textSecondary }}>
                {formatCents(impactPreview.totals.remainingBeforeCents)}
              </span>
              {" → "}
              <strong style={{ color: C.accentDark }}>
                {formatCents(impactPreview.totals.remainingAfterCents)}
              </strong>
              {impactPreview.totals.annualSavingsCents > 0 ? (
                <span style={{ color: C.success }}>
                  {`. Savings on remaining installments: ${formatCents(impactPreview.totals.annualSavingsCents)}.`}
                </span>
              ) : (
                "."
              )}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md"
            style={{ color: C.textSecondary }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !canSave}
            onClick={() => void handleSave()}
            className="px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: C.accent, color: "#fff" }}
          >
            {saving ? "Saving…" : "Apply adjustment"}
          </button>
        </div>
      </div>
    </SchoolAdminModalShell>
  );
}
