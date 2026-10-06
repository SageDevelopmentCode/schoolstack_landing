"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import SchoolAdminModalShell from "@/components/school-admin/ui/SchoolAdminModalShell";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import {
  buildRateCatalogDetailLabel,
  formatRateCatalogPeriodLabel,
} from "@/lib/tuition/rate-catalog-display";
import { paymentScheduleLabel } from "@/lib/tuition/setup-wizard";
import type { RatePlanWithDetails } from "@/lib/tuition/types";

type TuitionRateCatalogAssignModalProps = {
  open: boolean;
  organizationId: string;
  enrollmentId: string;
  studentName: string;
  programId: string;
  programName: string;
  ratePlans: RatePlanWithDetails[];
  onClose: () => void;
  onAssigned: () => void;
};

export default function TuitionRateCatalogAssignModal({
  open,
  organizationId,
  enrollmentId,
  studentName,
  programId,
  programName,
  ratePlans,
  onClose,
  onAssigned,
}: TuitionRateCatalogAssignModalProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);

  const catalogOptions = useMemo(
    () =>
      ratePlans.filter(
        (plan) => plan.status === "active" && plan.programId === programId,
      ),
    [programId, ratePlans],
  );

  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSelectedPlanId(catalogOptions[0]?.id ?? "");
  }, [catalogOptions, open]);

  const handleAssign = async () => {
    if (!selectedPlanId) {
      setError("Select a rate catalog.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/tuition/enrollments/${enrollmentId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratePlanId: selectedPlanId }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to assign tuition.");
      }
      adminToast.success("Tuition assigned");
      onAssigned();
      onClose();
    } catch (err) {
      const message = formatActionError(err, "Failed to assign tuition.");
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "tuition.assign_rate_catalog",
        error: "",
      }, err);
      setError(message);
      adminToast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SchoolAdminModalShell
      open={open}
      onClose={onClose}
      maxWidth="md"
      ariaLabel="Choose rate catalog"
      panelStyle={{ backgroundColor: "#F8FAF8", border: "1px solid #E1E8E1" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div>
          <h2 className="text-base font-semibold" style={{ color: C.textPrimary }}>
            Choose rate catalog
          </h2>
          <p className="text-sm mt-0.5" style={{ color: C.textSecondary }}>
            {studentName} · {programName}
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

      <div className="px-5 py-4 flex flex-col gap-3">
        {catalogOptions.length === 0 ? (
          <p className="text-sm" style={{ color: C.textSecondary }}>
            No active rate catalogs are available for this program. Publish a rate catalog
            first.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {catalogOptions.map((plan) => {
              const detailLabel = buildRateCatalogDetailLabel(
                plan.tiers,
                plan.billingBasis,
              );
              const periodLabel = formatRateCatalogPeriodLabel(
                plan.effectiveStart,
                plan.effectiveEnd,
              );
              const defaultPayment =
                plan.paymentPlans.find((p) => p.isDefault) ?? plan.paymentPlans[0];
              const paymentLabel = defaultPayment
                ? defaultPayment.name ||
                  paymentScheduleLabel(defaultPayment.installmentCount)
                : null;
              const selected = selectedPlanId === plan.id;

              return (
                <li key={plan.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className="w-full text-left rounded-lg px-3 py-3 transition-colors"
                    style={{
                      border: `1px solid ${selected ? theme.primary : C.border}`,
                      backgroundColor: selected ? "#F0F7F0" : C.surface,
                    }}
                  >
                    <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                      {plan.name}
                    </p>
                    <p className="text-xs mt-1" style={{ color: C.textSecondary }}>
                      {[detailLabel, periodLabel, paymentLabel ? `Default: ${paymentLabel}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
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
          onClick={() => void handleAssign()}
          disabled={saving || catalogOptions.length === 0}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Assign tuition
        </AdminButton>
      </div>
    </SchoolAdminModalShell>
  );
}
