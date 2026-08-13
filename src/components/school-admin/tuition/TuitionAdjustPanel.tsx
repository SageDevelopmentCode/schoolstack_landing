"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import CurrencyAmountInput from "@/components/ui/CurrencyAmountInput";
import {
  computeAdjustmentImpactPreview,
  formatAdjustmentDetailLine,
} from "@/lib/tuition/adjustment-impact";
import { computeAdjustedAmountCents, formatCents } from "@/lib/tuition/pricing";
import { createAdjustment, listAdjustmentsForAssignment } from "@/lib/tuition/adjustments";
import {
  assignmentNeedsPaymentPlanSelection,
  computeInstallmentAmountCents,
  getAssignmentById,
  resolveAssignmentTier,
} from "@/lib/tuition/assignments";
import { listChargesForAssignment } from "@/lib/tuition/charges";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import { resolveAdjustmentReasons } from "@/lib/tuition/adjustment-reasons";
import type { AdjustmentType, TuitionAdjustment, TuitionCharge } from "@/lib/tuition/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import TuitionAdjustmentReasonSelect from "@/components/school-admin/tuition/TuitionAdjustmentReasonSelect";
import TuitionAdjustmentReasonsModal from "@/components/school-admin/tuition/TuitionAdjustmentReasonsModal";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { createClient } from "@/utils/supabase/client";

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

type TuitionAdjustPanelProps = {
  open: boolean;
  organizationId: string;
  familyId: string;
  assignmentId: string;
  studentName: string | null;
  branding: OrganizationBranding;
  onClose: () => void;
  onSaved: () => void;
};

export default function TuitionAdjustPanel({
  open,
  organizationId,
  assignmentId,
  studentName,
  branding,
  onClose,
  onSaved,
}: TuitionAdjustPanelProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);

  const [adjustType, setAdjustType] = useState<AdjustmentType>("percent_discount");
  const [percentValue, setPercentValue] = useState(10);
  const [amountCents, setAmountCents] = useState(1000);
  const [percentFocused, setPercentFocused] = useState(false);
  const [percentDraft, setPercentDraft] = useState("10");
  const [reason, setReason] = useState<string>("");
  const [reasonOptions, setReasonOptions] = useState<string[]>([]);
  const [manageReasonsOpen, setManageReasonsOpen] = useState(false);
  const [baseAmountCents, setBaseAmountCents] = useState(0);
  const [charges, setCharges] = useState<TuitionCharge[]>([]);
  const [existing, setExisting] = useState<TuitionAdjustment[]>([]);
  const [pendingSchedule, setPendingSchedule] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || manageReasonsOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [manageReasonsOpen, open, onClose]);

  useEffect(() => {
    if (!open || !organizationId) return;

    void (async () => {
      try {
        const response = await fetch(
          `/api/tuition/org-settings?organizationId=${organizationId}`,
        );
        const payload = (await response.json()) as {
          error?: string;
          settings?: { adjustmentReasons?: string[] };
        };
        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load adjustment reasons.");
        }

        const options = resolveAdjustmentReasons(payload.settings ?? {});
        setReasonOptions(options);
        setReason(options[0] ?? "");
      } catch (err) {
        adminToast.error(formatActionError(err, "Failed to load adjustment reasons."));
      }
    })();
  }, [assignmentId, open, organizationId]);

  useEffect(() => {
    if (!open || !assignmentId) return;

    void (async () => {
      const [adjustments, assignmentCharges, assignment] = await Promise.all([
        listAdjustmentsForAssignment(supabase, assignmentId),
        listChargesForAssignment(supabase, assignmentId),
        getAssignmentById(supabase, assignmentId),
      ]);
      setExisting(adjustments);
      setCharges(assignmentCharges);
      setPendingSchedule(
        assignment ? assignmentNeedsPaymentPlanSelection(assignment) : false,
      );

      const tuitionCharge = assignmentCharges.find((c) => c.chargeType === "tuition");
      if (tuitionCharge) {
        setBaseAmountCents(tuitionCharge.baseAmountCents);
        return;
      }

      if (!assignment) {
        setBaseAmountCents(0);
        return;
      }

      const tier = await resolveAssignmentTier(supabase, assignment);
      const { data: paymentPlan, error: paymentPlanError } = await supabase
        .from("tuition_payment_plans")
        .select("installment_count, installment_amount_cents")
        .eq("id", assignment.paymentPlanId)
        .maybeSingle();

      if (paymentPlanError) throw paymentPlanError;

      const installmentCount = Number(paymentPlan?.installment_count ?? 1);
      const installmentAmountCents = tier
        ? computeInstallmentAmountCents(tier.amountCents, installmentCount)
        : Number(paymentPlan?.installment_amount_cents ?? 0);

      setBaseAmountCents(installmentAmountCents);
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
        pendingSchedule,
      }),
    [baseAmountCents, charges, draftAdjustment, existing, pendingSchedule],
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
    impactPreview.scenario !== "no_charges" &&
    percentInputValid &&
    amountInputValid &&
    reason.trim().length > 0;

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

  const panelTitle = studentName ? `Adjust tuition for ${studentName}` : "Adjust tuition";
  const upcomingPreview = impactPreview.upcomingInstallments;
  const visibleUpcoming = upcomingPreview.slice(0, PREVIEW_INSTALLMENT_LIMIT);
  const hiddenUpcomingCount = upcomingPreview.length - visibleUpcoming.length;

  const handleReasonsSaved = (savedReasons: string[]) => {
    const previousReasons = reasonOptions;
    setReasonOptions(savedReasons);

    const addedReasons = savedReasons.filter(
      (savedReason) => !previousReasons.includes(savedReason),
    );
    if (addedReasons.length > 0) {
      setReason(addedReasons[addedReasons.length - 1] ?? "");
      return;
    }

    if (!savedReasons.includes(reason)) {
      setReason(savedReasons[0] ?? "");
    }
  };

  return (
    <>
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden"
            style={{
              backgroundColor: C.surface,
              borderLeft: `1px solid ${C.border}`,
              boxShadow: C.shadowMedium,
            }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={panelTitle}
            data-testid="tuition-adjust-panel"
          >
            <div
              className="flex shrink-0 items-start justify-between gap-3 px-4 py-3 sm:px-5"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div className="min-w-0">
                <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  {panelTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5"
                style={{ color: C.textSecondary }}
                aria-label="Close adjust tuition panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 flex flex-col gap-4">
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
                  <TuitionAdjustmentReasonSelect
                    C={C}
                    value={reason}
                    onChange={setReason}
                    reasons={reasonOptions}
                    disabled={reasonOptions.length === 0}
                    onManageReasons={() => setManageReasonsOpen(true)}
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
                    No tuition rate is available yet. Assign a rate plan before applying
                    discounts.
                  </p>
                ) : null}

                {impactPreview.scenario === "pending_schedule" ? (
                  <p className="text-sm" style={{ color: C.textSecondary }}>
                    No installments yet. This adjustment will be saved and applied when you
                    set the payment schedule. The estimate above may change if you choose a
                    different schedule.
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

                {impactPreview.upcomingInstallments.length > 0 &&
                impactPreview.scenario !== "pending_schedule" ? (
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
            </div>

            <div
              className="flex shrink-0 justify-end gap-2 border-t px-4 py-3 sm:px-5"
              style={{ borderColor: C.border }}
            >
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
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>

    <TuitionAdjustmentReasonsModal
      open={manageReasonsOpen}
      organizationId={organizationId}
      reasons={reasonOptions}
      C={C}
      onClose={() => setManageReasonsOpen(false)}
      onSaved={handleReasonsSaved}
    />
    </>
  );
}
