"use client";

import { useEffect, useMemo, useState } from "react";
import { computeAdjustedAmountCents, formatCents } from "@/lib/tuition/pricing";
import { createAdjustment, listAdjustmentsForAssignment } from "@/lib/tuition/adjustments";
import { listChargesForAssignment } from "@/lib/tuition/charges";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { AdjustmentType, TuitionAdjustment } from "@/lib/tuition/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { createClient } from "@/utils/supabase/client";

const ADJUST_REASONS = [
  "Sibling discount",
  "Financial aid",
  "Staff/faculty",
  "Custom arrangement",
] as const;

type TuitionAdjustModalProps = {
  organizationId: string;
  familyId: string;
  assignmentId: string;
  branding: OrganizationBranding;
  onClose: () => void;
  onSaved: () => void;
};

export default function TuitionAdjustModal({
  organizationId,
  assignmentId,
  branding,
  onClose,
  onSaved,
}: TuitionAdjustModalProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);

  const [adjustType, setAdjustType] = useState<AdjustmentType>("percent_discount");
  const [value, setValue] = useState(10);
  const [reason, setReason] = useState<string>(ADJUST_REASONS[0]);
  const [baseAmountCents, setBaseAmountCents] = useState(0);
  const [existing, setExisting] = useState<TuitionAdjustment[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const [adjustments, charges] = await Promise.all([
        listAdjustmentsForAssignment(supabase, assignmentId),
        listChargesForAssignment(supabase, assignmentId),
      ]);
      setExisting(adjustments);
      const tuitionCharge = charges.find((c) => c.chargeType === "tuition");
      if (tuitionCharge) setBaseAmountCents(tuitionCharge.baseAmountCents);
    })();
  }, [assignmentId, supabase]);

  const draftAmount = computeAdjustedAmountCents(baseAmountCents, [
    {
      adjustmentType: adjustType,
      valuePercent: adjustType === "percent_discount" ? value : null,
      valueCents:
        adjustType === "fixed_discount" || adjustType === "custom_amount"
          ? Math.round(value * 100)
          : adjustType === "waiver"
            ? 0
            : null,
      priority: 0,
      scope: "installment",
    },
  ]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await createAdjustment(supabase, {
        organizationId,
        assignmentId,
        adjustmentType: adjustType,
        valuePercent: adjustType === "percent_discount" ? value : null,
        valueCents:
          adjustType === "fixed_discount" || adjustType === "custom_amount"
            ? Math.round(value * 100)
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

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl p-5 flex flex-col gap-4"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
            Adjust tuition
          </p>
          <h2 className="text-base font-semibold mt-1" style={{ color: C.textPrimary }}>
            Family assignment
          </h2>
        </div>

        <div className="grid gap-3">
          <label className="text-sm flex flex-col gap-1">
            <span style={{ color: C.textSecondary }}>Adjustment type</span>
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
          </label>

          {adjustType !== "waiver" ? (
            <label className="text-sm flex flex-col gap-1">
              <span style={{ color: C.textSecondary }}>Value</span>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="rounded-md px-3 py-2 text-sm"
                style={{
                  backgroundColor: C.input,
                  border: `1px solid ${C.inputBorder}`,
                  color: C.textPrimary,
                }}
              />
            </label>
          ) : null}

          <label className="text-sm flex flex-col gap-1">
            <span style={{ color: C.textSecondary }}>Reason</span>
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
          className="rounded-md p-3 text-sm"
          style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
        >
          <p style={{ color: C.textSecondary }}>
            Standard: {formatCents(baseAmountCents)} → Adjusted:{" "}
            <strong style={{ color: C.textPrimary }}>{formatCents(draftAmount)}</strong>
          </p>
          {existing.length ? (
            <p className="text-xs mt-2" style={{ color: C.textTertiary }}>
              {existing.length} active adjustment(s) will stack with this change.
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
            disabled={saving}
            onClick={() => void handleSave()}
            className="px-4 py-2 text-sm font-medium rounded-md"
            style={{ backgroundColor: C.accent, color: "#fff" }}
          >
            {saving ? "Saving…" : "Save adjustment"}
          </button>
        </div>
      </div>
    </div>
  );
}
