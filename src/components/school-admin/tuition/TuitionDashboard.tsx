"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import TuitionAdjustModal from "@/components/school-admin/tuition/TuitionAdjustModal";
import TuitionFamiliesPanel from "@/components/school-admin/tuition/TuitionFamiliesPanel";
import TuitionRateCatalogPanel from "@/components/school-admin/tuition/TuitionRateCatalogPanel";
import TuitionRulesPanel from "@/components/school-admin/tuition/TuitionRulesPanel";
import TuitionSetupWizard from "@/components/school-admin/tuition/TuitionSetupWizard";
import { formatCents } from "@/lib/tuition/pricing";
import { listRatePlansWithDetails } from "@/lib/tuition/rate-plans";
import type { RatePlanWithDetails } from "@/lib/tuition/types";
import { getTuitionKpis } from "@/lib/tuition/charges";
import type { TuitionSetupStatus } from "@/lib/tuition/setup-status";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type TuitionDashboardProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  setupStatus: TuitionSetupStatus;
  onRefreshSetupStatus: () => Promise<void>;
};

type TabKey = "families" | "catalog" | "rules";

export default function TuitionDashboard({
  organizationId,
  branding,
  setupStatus,
  onRefreshSetupStatus,
}: TuitionDashboardProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);

  const [tab, setTab] = useState<TabKey>(
    setupStatus.familiesWithBillingCount > 0 ? "families" : "catalog",
  );
  const [ratePlans, setRatePlans] = useState<RatePlanWithDetails[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState({
    collectedYtdCents: 0,
    outstandingCents: 0,
    familiesAtRisk: 0,
    activeAssignments: 0,
  });
  const [adjustFamilyId, setAdjustFamilyId] = useState<string | null>(null);
  const [adjustAssignmentId, setAdjustAssignmentId] = useState<string | null>(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [plans, kpiData] = await Promise.all([
        listRatePlansWithDetails(supabase, organizationId),
        getTuitionKpis(supabase, organizationId),
      ]);
      setRatePlans(plans);
      setKpis(kpiData);
      setSelectedPlanId((prev) => {
        if (prev && plans.some((p) => p.id === prev)) return prev;
        return plans[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tuition data.");
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
    });
  }, [loadData]);

  const handleSetupComplete = async () => {
    setShowSetupWizard(false);
    await onRefreshSetupStatus();
    await loadData();
    setTab("catalog");
  };

  if (showSetupWizard) {
    return (
      <TuitionSetupWizard
        organizationId={organizationId}
        branding={branding}
        onComplete={() => void handleSetupComplete()}
        onCancelEdit={() => setShowSetupWizard(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: C.textPrimary }}>
            Tuition
          </h1>
          <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
            Configure rates, manage family billing, and apply adjustments.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSetupWizard(true)}
          style={getAdminButtonStyle(C, "primary")}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New rate plan
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Collected YTD", value: formatCents(kpis.collectedYtdCents) },
          { label: "Outstanding", value: formatCents(kpis.outstandingCents) },
          { label: "Families at risk", value: String(kpis.familiesAtRisk) },
          { label: "Active assignments", value: String(kpis.activeAssignments) },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg p-4"
            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
          >
            <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
              {card.label}
            </p>
            <p className="text-lg font-semibold mt-1" style={{ color: C.textPrimary }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b" style={{ borderColor: C.border }}>
        {(
          [
            ["families", "Families"],
            ["catalog", "Rate catalog"],
            ["rules", "Rules"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className="px-4 py-2 text-sm font-medium -mb-px"
            style={{
              color: tab === key ? C.accent : C.textSecondary,
              borderBottom:
                tab === key ? `2px solid ${C.accent}` : "2px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-sm" style={{ color: C.error }}>
          {error}
        </p>
      ) : null}

      {tab === "families" ? (
        <TuitionFamiliesPanel
          organizationId={organizationId}
          branding={branding}
          onAdjust={(familyId, assignmentId) => {
            setAdjustFamilyId(familyId);
            setAdjustAssignmentId(assignmentId);
          }}
          onRefresh={() => void loadData()}
        />
      ) : null}

      {tab === "catalog" ? (
        <TuitionRateCatalogPanel
          organizationId={organizationId}
          branding={branding}
          ratePlans={ratePlans}
          selectedPlanId={selectedPlanId}
          onSelectPlan={setSelectedPlanId}
          onRefresh={() => void loadData()}
          onStartSetup={() => setShowSetupWizard(true)}
          saving={loading}
        />
      ) : null}

      {tab === "rules" ? (
        <TuitionRulesPanel
          organizationId={organizationId}
          branding={branding}
          onRefresh={() => void loadData()}
        />
      ) : null}

      {adjustFamilyId && adjustAssignmentId ? (
        <TuitionAdjustModal
          organizationId={organizationId}
          familyId={adjustFamilyId}
          assignmentId={adjustAssignmentId}
          branding={branding}
          onClose={() => {
            setAdjustFamilyId(null);
            setAdjustAssignmentId(null);
          }}
          onSaved={() => {
            setAdjustFamilyId(null);
            setAdjustAssignmentId(null);
            void loadData();
          }}
        />
      ) : null}
    </div>
  );
}
