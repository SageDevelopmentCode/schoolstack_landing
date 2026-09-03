"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import SchoolAdminModalShell from "@/components/school-admin/ui/SchoolAdminModalShell";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import { getAssignmentById } from "@/lib/tuition/assignments";
import { getRatePlanWithDetails } from "@/lib/tuition/rate-plans";
import { paymentScheduleLabel } from "@/lib/tuition/setup-wizard";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type TuitionAssignmentModalProps = {
  open: boolean;
  assignmentId: string;
  branding: OrganizationBranding;
  onClose: () => void;
  onSaved: () => void;
};

export default function TuitionAssignmentModal({
  open,
  assignmentId,
  branding,
  onClose,
  onSaved,
}: TuitionAssignmentModalProps) {
  void branding;
  const { theme } = useSchoolAdminStoryTheme();
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateTierId, setRateTierId] = useState<string>("");
  const [paymentPlanId, setPaymentPlanId] = useState<string>("");
  const [ratePlanName, setRatePlanName] = useState("");
  const [tierOptions, setTierOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [paymentOptions, setPaymentOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [pendingPaymentPlanSelection, setPendingPaymentPlanSelection] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<{
    rateTierId: string;
    paymentPlanId: string;
  } | null>(null);

  const isAssignmentDirty =
    savedSnapshot != null &&
    (rateTierId !== savedSnapshot.rateTierId ||
      paymentPlanId !== savedSnapshot.paymentPlanId);

  useEffect(() => {
    if (!open || !assignmentId) return;

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const assignment = await getAssignmentById(supabase, assignmentId);
        if (!assignment) {
          setError("Assignment not found.");
          return;
        }

        const ratePlan = await getRatePlanWithDetails(supabase, assignment.ratePlanId);
        if (!ratePlan) {
          setError("Rate plan not found.");
          return;
        }

        setRatePlanName(ratePlan.name);
        setPendingPaymentPlanSelection(
          assignment.metadata.pendingPaymentPlanSelection === true,
        );
        setRateTierId(
          assignment.rateTierId ??
            ratePlan.tiers.find((t) => t.isDefault)?.id ??
            ratePlan.tiers[0]?.id ??
            "",
        );
        setPaymentPlanId(assignment.paymentPlanId);
        setSavedSnapshot({
          rateTierId:
            assignment.rateTierId ??
            ratePlan.tiers.find((t) => t.isDefault)?.id ??
            ratePlan.tiers[0]?.id ??
            "",
          paymentPlanId: assignment.paymentPlanId,
        });
        setTierOptions(
          ratePlan.tiers.map((tier) => ({
            value: tier.id,
            label: tier.label,
          })),
        );
        setPaymentOptions(
          ratePlan.paymentPlans.map((plan) => ({
            value: plan.id,
            label: plan.name || paymentScheduleLabel(plan.installmentCount),
          })),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load assignment.");
      } finally {
        setLoading(false);
      }
    })();
  }, [assignmentId, open, supabase]);

  const handleSave = async () => {
    if (!isAssignmentDirty) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/tuition/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rateTierId: rateTierId || null,
          paymentPlanId,
        }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to update assignment.");
      }
      setSavedSnapshot({ rateTierId, paymentPlanId });
      adminToast.success("Billing setup saved");
      onSaved();
    } catch (err) {
      const message = formatActionError(err, "Failed to update assignment.");
      setError(message);
      adminToast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const modalTitle = pendingPaymentPlanSelection
    ? "Set payment schedule"
    : "Edit tier & schedule";

  return (
    <SchoolAdminModalShell
      open={open}
      onClose={onClose}
      maxWidth="md"
      ariaLabel={modalTitle}
      panelStyle={{ backgroundColor: "#F8FAF8", border: "1px solid #E1E8E1" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div>
          <h2 className="text-base font-semibold" style={{ color: C.textPrimary }}>
            {modalTitle}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: C.textSecondary }}>
            {ratePlanName || "Rate plan"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md"
          style={{ color: C.textTertiary }}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading billing setup…
          </div>
        ) : (
          <>
            <label className="flex flex-col gap-1.5 text-sm">
              <span style={{ color: C.textSecondary }}>Tuition rate tier</span>
              <SchoolAdminSelect
                C={C}
                value={rateTierId}
                onChange={setRateTierId}
                options={tierOptions}
                disabled={tierOptions.length <= 1}
                ariaLabel="Tuition rate tier"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span style={{ color: C.textSecondary }}>Payment schedule</span>
              <SchoolAdminSelect
                C={C}
                value={paymentPlanId}
                onChange={setPaymentPlanId}
                options={paymentOptions}
                disabled={paymentOptions.length <= 1}
                ariaLabel="Payment schedule"
              />
            </label>

            <p className="text-xs" style={{ color: C.textTertiary }}>
              {pendingPaymentPlanSelection
                ? "The family has not confirmed a payment schedule yet. You can override the schedule here if needed."
                : "Changing tier or schedule regenerates future unpaid charges."}
            </p>
          </>
        )}

        {error ? (
          <p className="text-sm" style={{ color: C.error }}>
            {error}
          </p>
        ) : null}
      </div>

      <div
        className="px-5 py-4 flex justify-end gap-2"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <AdminButton theme={theme} variant="soft" onClick={onClose} disabled={saving}>
          Cancel
        </AdminButton>
        <AdminButton
          theme={theme}
          onClick={() => void handleSave()}
          disabled={saving || loading || !isAssignmentDirty}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save changes
        </AdminButton>
      </div>
    </SchoolAdminModalShell>
  );
}
