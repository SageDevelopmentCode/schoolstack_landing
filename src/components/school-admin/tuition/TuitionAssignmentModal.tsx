"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import SchoolAdminModalShell from "@/components/school-admin/ui/SchoolAdminModalShell";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import {
  filterPaymentPlansForBillingStart,
  maxInstallmentsForBillingStart,
} from "@/lib/tuition/billing-start";
import { getAssignmentById } from "@/lib/tuition/assignments";
import { getRatePlanWithDetails } from "@/lib/tuition/rate-plans";
import { paymentScheduleLabel } from "@/lib/tuition/setup-wizard";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type {
  RatePlanWithDetails,
  TuitionEnrollmentAssignment,
  TuitionPaymentPlan,
} from "@/lib/tuition/types";
import { createClient } from "@/utils/supabase/client";

type TuitionAssignmentModalProps = {
  open: boolean;
  organizationId: string;
  assignmentId: string;
  branding: OrganizationBranding;
  ratePlans: RatePlanWithDetails[];
  onClose: () => void;
  onSaved: () => void;
};

type FormSnapshot = {
  ratePlanId: string;
  rateTierId: string;
  paymentPlanId: string;
  billingStart: string;
};

function resolveTierId(
  ratePlan: RatePlanWithDetails,
  assignment: TuitionEnrollmentAssignment | null,
): string {
  if (
    assignment?.rateTierId &&
    ratePlan.tiers.some((tier) => tier.id === assignment.rateTierId)
  ) {
    return assignment.rateTierId;
  }
  return (
    ratePlan.tiers.find((tier) => tier.isDefault)?.id ??
    ratePlan.tiers[0]?.id ??
    ""
  );
}

function resolvePaymentPlanId(
  ratePlan: RatePlanWithDetails,
  assignment: TuitionEnrollmentAssignment | null,
): string {
  if (
    assignment?.paymentPlanId &&
    ratePlan.paymentPlans.some((plan) => plan.id === assignment.paymentPlanId)
  ) {
    return assignment.paymentPlanId;
  }
  const defaultPlan =
    ratePlan.paymentPlans.find((plan) => plan.isDefault) ?? ratePlan.paymentPlans[0];
  return defaultPlan?.id ?? "";
}

export default function TuitionAssignmentModal({
  open,
  organizationId,
  assignmentId,
  branding,
  ratePlans,
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
  const [enrollmentProgramId, setEnrollmentProgramId] = useState<string | null>(null);
  const [ratePlanId, setRatePlanId] = useState("");
  const [rateTierId, setRateTierId] = useState<string>("");
  const [paymentPlanId, setPaymentPlanId] = useState<string>("");
  const [billingStart, setBillingStart] = useState<string>("");
  const [ratePlanName, setRatePlanName] = useState("");
  const [ratePlanEffectiveStart, setRatePlanEffectiveStart] = useState<string | null>(
    null,
  );
  const [ratePlanEffectiveEnd, setRatePlanEffectiveEnd] = useState<string | null>(
    null,
  );
  const [tierOptions, setTierOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [paymentPlans, setPaymentPlans] = useState<TuitionPaymentPlan[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [pendingPaymentPlanSelection, setPendingPaymentPlanSelection] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<FormSnapshot | null>(null);
  const [loadedAssignment, setLoadedAssignment] =
    useState<TuitionEnrollmentAssignment | null>(null);

  const catalogOptions = useMemo(
    () =>
      enrollmentProgramId
        ? ratePlans.filter(
            (plan) =>
              plan.status === "active" && plan.programId === enrollmentProgramId,
          )
        : [],
    [enrollmentProgramId, ratePlans],
  );

  const showRateCatalogSelect = catalogOptions.length > 1;

  const applyRatePlanToForm = useCallback(
    (
      ratePlan: RatePlanWithDetails,
      assignment: TuitionEnrollmentAssignment | null,
      options?: { useAssignmentValues?: boolean },
    ) => {
      const useAssignment = options?.useAssignmentValues ?? false;
      const nextTierId = useAssignment
        ? resolveTierId(ratePlan, assignment)
        : resolveTierId(ratePlan, null);
      const nextPaymentPlanId = useAssignment
        ? resolvePaymentPlanId(ratePlan, assignment)
        : resolvePaymentPlanId(ratePlan, null);
      const resolvedBillingStart =
        (useAssignment ? assignment?.effectiveStart : null) ??
        ratePlan.effectiveStart ??
        "";

      setRatePlanId(ratePlan.id);
      setRatePlanName(ratePlan.name);
      setRatePlanEffectiveStart(ratePlan.effectiveStart);
      setRatePlanEffectiveEnd(ratePlan.effectiveEnd);
      setBillingStart(resolvedBillingStart);
      setPendingPaymentPlanSelection(
        useAssignment
          ? assignment?.metadata.pendingPaymentPlanSelection === true
          : ratePlan.paymentPlans.length > 1,
      );
      setRateTierId(nextTierId);
      setPaymentPlanId(nextPaymentPlanId);
      setPaymentPlans(ratePlan.paymentPlans);

      const maxInstallments = maxInstallmentsForBillingStart(
        ratePlan.effectiveStart,
        ratePlan.effectiveEnd,
        resolvedBillingStart,
      );
      const allowedPlans = filterPaymentPlansForBillingStart(
        ratePlan.paymentPlans,
        maxInstallments,
      );
      setTierOptions(
        ratePlan.tiers.map((tier) => ({
          value: tier.id,
          label: tier.label,
        })),
      );
      setPaymentOptions(
        allowedPlans.map((plan) => ({
          value: plan.id,
          label: plan.name || paymentScheduleLabel(plan.installmentCount),
        })),
      );
    },
    [],
  );

  const isAssignmentDirty =
    savedSnapshot != null &&
    (ratePlanId !== savedSnapshot.ratePlanId ||
      rateTierId !== savedSnapshot.rateTierId ||
      paymentPlanId !== savedSnapshot.paymentPlanId ||
      billingStart !== savedSnapshot.billingStart);

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
        setLoadedAssignment(assignment);

        const { data: enrollment, error: enrollmentError } = await supabase
          .from("enrollments")
          .select("program_id")
          .eq("id", assignment.enrollmentId)
          .maybeSingle();

        if (enrollmentError) throw enrollmentError;
        const programId = enrollment?.program_id
          ? String(enrollment.program_id)
          : null;
        setEnrollmentProgramId(programId);

        const fromProps = ratePlans.find((plan) => plan.id === assignment.ratePlanId);
        const ratePlan =
          fromProps ?? (await getRatePlanWithDetails(supabase, assignment.ratePlanId));
        if (!ratePlan) {
          setError("Rate plan not found.");
          return;
        }

        applyRatePlanToForm(ratePlan, assignment, { useAssignmentValues: true });
        const resolvedBillingStart =
          assignment.effectiveStart ?? ratePlan.effectiveStart ?? "";
        setSavedSnapshot({
          ratePlanId: assignment.ratePlanId,
          rateTierId: resolveTierId(ratePlan, assignment),
          paymentPlanId: resolvePaymentPlanId(ratePlan, assignment),
          billingStart: resolvedBillingStart,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load assignment.");
        void reportPortalOperationalError(
          "school_admin",
          {
            organizationId,
            operation: "tuition.assignment.load",
            error: "",
          },
          err,
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [applyRatePlanToForm, assignmentId, open, ratePlans, supabase]);

  const handleRateCatalogChange = (nextPlanId: string) => {
    const ratePlan = catalogOptions.find((plan) => plan.id === nextPlanId);
    if (!ratePlan) return;
    applyRatePlanToForm(ratePlan, loadedAssignment, { useAssignmentValues: false });
  };

  const handleSave = async () => {
    if (!isAssignmentDirty) return;
    setSaving(true);
    setError(null);
    try {
      const patchBody: {
        ratePlanId?: string;
        rateTierId: string | null;
        paymentPlanId: string;
        effectiveStart?: string | null;
      } = {
        rateTierId: rateTierId || null,
        paymentPlanId,
      };
      if (savedSnapshot != null && ratePlanId !== savedSnapshot.ratePlanId) {
        patchBody.ratePlanId = ratePlanId;
      }
      if (savedSnapshot != null && billingStart !== savedSnapshot.billingStart) {
        patchBody.effectiveStart = billingStart || null;
      }

      const response = await fetch(`/api/tuition/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchBody),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to update assignment.");
      }
      setSavedSnapshot({ ratePlanId, rateTierId, paymentPlanId, billingStart });
      adminToast.success("Billing setup saved");
      onSaved();
    } catch (err) {
      const message = formatActionError(err, "Failed to update assignment.");
      void reportPortalOperationalError(
        "school_admin",
        {
          organizationId,
          operation: "tuition.assignment.save",
          error: "",
        },
        err,
      );
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
            {ratePlanName || "Rate catalog"}
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
            {showRateCatalogSelect ? (
              <label className="flex flex-col gap-1.5 text-sm">
                <span style={{ color: C.textSecondary }}>Rate catalog</span>
                <SchoolAdminSelect
                  C={C}
                  value={ratePlanId}
                  onChange={(value) => handleRateCatalogChange(value)}
                  options={catalogOptions.map((plan) => ({
                    value: plan.id,
                    label: plan.name,
                  }))}
                  ariaLabel="Rate catalog"
                />
              </label>
            ) : null}

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
              <span style={{ color: C.textSecondary }}>Billing start</span>
              <input
                type="date"
                value={billingStart}
                onChange={(event) => {
                  const nextStart = event.target.value;
                  setBillingStart(nextStart);
                  if (!nextStart) return;
                  const maxInstallments = maxInstallmentsForBillingStart(
                    ratePlanEffectiveStart,
                    ratePlanEffectiveEnd,
                    nextStart,
                  );
                  const allowedPlans = filterPaymentPlansForBillingStart(
                    paymentPlans,
                    maxInstallments,
                  );
                  setPaymentOptions(
                    allowedPlans.map((plan) => ({
                      value: plan.id,
                      label: plan.name || paymentScheduleLabel(plan.installmentCount),
                    })),
                  );
                  if (
                    paymentPlanId &&
                    !allowedPlans.some((plan) => plan.id === paymentPlanId)
                  ) {
                    setPaymentPlanId(allowedPlans[0]?.id ?? "");
                  }
                }}
                className="rounded-md px-3 py-2 text-sm"
                style={{
                  border: `1px solid ${C.border}`,
                  backgroundColor: C.surface,
                  color: C.textPrimary,
                }}
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
                : "Changing catalog, tier, or schedule regenerates future unpaid charges."}
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
