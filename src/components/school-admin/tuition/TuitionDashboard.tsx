"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import {
  tabPanelTransition,
  tabPanelVariants,
} from "@/lib/school-admin/admin-modal-motion";
import TuitionAdjustModal from "@/components/school-admin/tuition/TuitionAdjustModal";
import TuitionAssignmentModal from "@/components/school-admin/tuition/TuitionAssignmentModal";
import TuitionSetupButton from "@/components/school-admin/tuition/TuitionSetupButton";
import TuitionSetupPanel from "@/components/school-admin/tuition/TuitionSetupPanel";
import TuitionFamiliesPanel from "@/components/school-admin/tuition/TuitionFamiliesPanel";
import TuitionRateCatalogPanel from "@/components/school-admin/tuition/TuitionRateCatalogPanel";
import TuitionRulesPanel from "@/components/school-admin/tuition/TuitionRulesPanel";
import TuitionSetupWizard from "@/components/school-admin/tuition/TuitionSetupWizard";
import { formatCents } from "@/lib/tuition/pricing";
import { listRatePlansWithDetails } from "@/lib/tuition/rate-plans";
import type { RatePlanWithDetails } from "@/lib/tuition/types";
import { getTuitionKpis } from "@/lib/tuition/charges";
import { fetchTuitionReadinessStatus } from "@/lib/tuition/tuition-readiness";
import type { TuitionReadinessStatus } from "@/lib/tuition/tuition-readiness";
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
  slug,
  setupStatus,
  onRefreshSetupStatus,
}: TuitionDashboardProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const reducedMotion = useReducedMotion() ?? false;

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
  const [editAssignmentId, setEditAssignmentId] = useState<string | null>(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showSetupPanel, setShowSetupPanel] = useState(false);
  const [readiness, setReadiness] = useState<TuitionReadinessStatus | null>(null);
  const [familiesRefreshKey, setFamiliesRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/tuition/sync-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });

      const [plans, kpiData, readinessStatus] = await Promise.all([
        listRatePlansWithDetails(supabase, organizationId),
        getTuitionKpis(supabase, organizationId),
        fetchTuitionReadinessStatus(supabase, organizationId),
      ]);
      setRatePlans(plans);
      setKpis(kpiData);
      setReadiness(readinessStatus);
      const activePlans = plans.filter((plan) => plan.status !== "draft");
      setSelectedPlanId((prev) => {
        if (prev && activePlans.some((p) => p.id === prev)) return prev;
        return activePlans[0]?.id ?? null;
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
        draftRatePlanId={setupStatus.draftRatePlanId}
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
        <div className="flex items-center gap-2">
          {readiness ? (
            <TuitionSetupButton
              C={C}
              readiness={readiness}
              onClick={() => setShowSetupPanel(true)}
            />
          ) : null}
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

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          variants={tabPanelVariants(reducedMotion)}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={tabPanelTransition(reducedMotion)}
        >
          {tab === "families" ? (
            <TuitionFamiliesPanel
              key={familiesRefreshKey}
              organizationId={organizationId}
              slug={slug}
              branding={branding}
              onAdjust={(familyId, assignmentId) => {
                setAdjustFamilyId(familyId);
                setAdjustAssignmentId(assignmentId);
              }}
              onEditAssignment={(assignmentId) => setEditAssignmentId(assignmentId)}
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
        </motion.div>
      </AnimatePresence>

      <TuitionAssignmentModal
        open={editAssignmentId != null}
        assignmentId={editAssignmentId ?? ""}
        branding={branding}
        onClose={() => setEditAssignmentId(null)}
        onSaved={() => {
          setEditAssignmentId(null);
          void loadData();
        }}
      />

      <TuitionAdjustModal
        open={adjustFamilyId != null && adjustAssignmentId != null}
        organizationId={organizationId}
        familyId={adjustFamilyId ?? ""}
        assignmentId={adjustAssignmentId ?? ""}
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

      {readiness ? (
        <TuitionSetupPanel
          open={showSetupPanel}
          C={C}
          organizationId={organizationId}
          readiness={readiness}
          onClose={() => setShowSetupPanel(false)}
          onOpenSetupWizard={() => {
            setShowSetupPanel(false);
            setShowSetupWizard(true);
          }}
          onSwitchToCatalog={() => {
            setShowSetupPanel(false);
            setTab("catalog");
          }}
          onSwitchToFamilies={() => {
            setShowSetupPanel(false);
            setTab("families");
            setFamiliesRefreshKey((value) => value + 1);
          }}
          onRefresh={loadData}
        />
      ) : null}
    </div>
  );
}
