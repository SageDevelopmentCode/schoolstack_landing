"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Plus } from "lucide-react";
import {
  tabPanelTransition,
  tabPanelVariants,
} from "@/lib/school-admin/admin-modal-motion";
import TuitionAdjustPanel from "@/components/school-admin/tuition/TuitionAdjustPanel";
import TuitionAssignmentModal from "@/components/school-admin/tuition/TuitionAssignmentModal";
import TuitionSetupButton from "@/components/school-admin/tuition/TuitionSetupButton";
import TuitionSetupPanel from "@/components/school-admin/tuition/TuitionSetupPanel";
import TuitionFamiliesPanel from "@/components/school-admin/tuition/TuitionFamiliesPanel";
import TuitionKpiBreakdownPanel from "@/components/school-admin/tuition/TuitionKpiBreakdownPanel";
import TuitionOutstandingPeriodSelect from "@/components/school-admin/tuition/TuitionOutstandingPeriodSelect";
import TuitionRateCatalogPanel from "@/components/school-admin/tuition/TuitionRateCatalogPanel";
import TuitionRulesPanel from "@/components/school-admin/tuition/TuitionRulesPanel";
import TuitionSetupWizard from "@/components/school-admin/tuition/TuitionSetupWizard";
import { formatCents } from "@/lib/tuition/pricing";
import { listRatePlansWithDetails } from "@/lib/tuition/rate-plans";
import type { RatePlanWithDetails } from "@/lib/tuition/types";
import { getTuitionKpis } from "@/lib/tuition/charges";
import type { TuitionKpiBreakdownKind } from "@/lib/tuition/kpi-breakdown";
import {
  availableOutstandingPeriods,
  deriveSchoolYearBounds,
  type OutstandingPeriod,
} from "@/lib/tuition/outstanding-period";
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

const CLICKABLE_KPI_CARDS: Array<{
  kind: TuitionKpiBreakdownKind;
  label: string;
  ariaLabel: string;
  getValue: (kpis: {
    collectedYtdCents: number;
    outstandingCents: number;
    familiesAtRisk: number;
    activeAssignments: number;
  }) => string;
  getExpectedTotalCents: (kpis: {
    collectedYtdCents: number;
    outstandingCents: number;
    familiesAtRisk: number;
    activeAssignments: number;
  }) => number;
}> = [
  {
    kind: "collected_ytd",
    label: "Collected YTD",
    ariaLabel: "View collected YTD breakdown",
    getValue: (kpis) => formatCents(kpis.collectedYtdCents),
    getExpectedTotalCents: (kpis) => kpis.collectedYtdCents,
  },
  {
    kind: "at_risk",
    label: "Families at risk",
    ariaLabel: "View families at risk breakdown",
    getValue: (kpis) => String(kpis.familiesAtRisk),
    getExpectedTotalCents: (kpis) => kpis.familiesAtRisk,
  },
];

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
  const [adjustStudentName, setAdjustStudentName] = useState<string | null>(null);
  const [editAssignmentId, setEditAssignmentId] = useState<string | null>(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showSetupPanel, setShowSetupPanel] = useState(false);
  const [readiness, setReadiness] = useState<TuitionReadinessStatus | null>(null);
  const [familiesRefreshKey, setFamiliesRefreshKey] = useState(0);
  const [familiesReloadToken, setFamiliesReloadToken] = useState(0);
  const [kpiBreakdownKind, setKpiBreakdownKind] = useState<TuitionKpiBreakdownKind | null>(
    null,
  );
  const [focusFamilyId, setFocusFamilyId] = useState<string | null>(null);
  const [hoveredKpiCard, setHoveredKpiCard] = useState<TuitionKpiBreakdownKind | null>(null);
  const [outstandingPeriodSelection, setOutstandingPeriod] = useState<OutstandingPeriod>("current_month");

  const schoolYearBounds = useMemo(
    () => deriveSchoolYearBounds(ratePlans),
    [ratePlans],
  );

  const availablePeriods = useMemo(
    () => availableOutstandingPeriods(schoolYearBounds),
    [schoolYearBounds],
  );

  const outstandingPeriod = availablePeriods.includes(outstandingPeriodSelection)
    ? outstandingPeriodSelection
    : (availablePeriods[0] ?? "current_month");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/tuition/sync-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });

      const plans = await listRatePlansWithDetails(supabase, organizationId);
      const bounds = deriveSchoolYearBounds(plans);
      const [kpiData, readinessStatus] = await Promise.all([
        getTuitionKpis(supabase, organizationId, {
          outstandingPeriod,
          schoolYearBounds: bounds,
        }),
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
  }, [organizationId, outstandingPeriod, supabase]);

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
        {CLICKABLE_KPI_CARDS.slice(0, 1).map((card) => {
          const isHovered = hoveredKpiCard === card.kind;
          return (
            <button
              key={card.kind}
              type="button"
              aria-label={card.ariaLabel}
              onClick={() => setKpiBreakdownKind(card.kind)}
              onMouseEnter={() => setHoveredKpiCard(card.kind)}
              onMouseLeave={() => setHoveredKpiCard(null)}
              onFocus={() => setHoveredKpiCard(card.kind)}
              onBlur={() => setHoveredKpiCard(null)}
              className="rounded-lg p-4 text-left transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: isHovered ? C.accentLight : C.surface,
                border: `1px solid ${isHovered ? C.accent : C.border}`,
                outlineColor: C.accent,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
                  {card.label}
                </p>
                <ChevronRight
                  className="h-4 w-4 shrink-0"
                  style={{ color: isHovered ? C.accent : C.textTertiary }}
                />
              </div>
              <p className="text-lg font-semibold mt-1" style={{ color: C.textPrimary }}>
                {card.getValue(kpis)}
              </p>
              <p className="text-xs mt-1" style={{ color: C.textTertiary }}>
                View breakdown
              </p>
            </button>
          );
        })}
        <div
          role="button"
          tabIndex={0}
          aria-label="View outstanding breakdown"
          onClick={() => setKpiBreakdownKind("outstanding")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setKpiBreakdownKind("outstanding");
            }
          }}
          onMouseEnter={() => setHoveredKpiCard("outstanding")}
          onMouseLeave={() => setHoveredKpiCard(null)}
          onFocus={() => setHoveredKpiCard("outstanding")}
          onBlur={() => setHoveredKpiCard(null)}
          className="rounded-lg p-4 text-left transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            backgroundColor:
              hoveredKpiCard === "outstanding" ? C.accentLight : C.surface,
            border: `1px solid ${hoveredKpiCard === "outstanding" ? C.accent : C.border}`,
            outlineColor: C.accent,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
              Outstanding
            </p>
            <ChevronRight
              className="h-4 w-4 shrink-0"
              style={{
                color: hoveredKpiCard === "outstanding" ? C.accent : C.textTertiary,
              }}
            />
          </div>
          <p className="text-lg font-semibold mt-1" style={{ color: C.textPrimary }}>
            {formatCents(kpis.outstandingCents)}
          </p>
          <div
            className="mt-2"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <TuitionOutstandingPeriodSelect
              value={outstandingPeriod}
              onChange={setOutstandingPeriod}
              schoolYearBounds={schoolYearBounds}
              C={C}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: C.textTertiary }}>
            View breakdown
          </p>
        </div>
        {CLICKABLE_KPI_CARDS.slice(1).map((card) => {
          const isHovered = hoveredKpiCard === card.kind;
          return (
            <button
              key={card.kind}
              type="button"
              aria-label={card.ariaLabel}
              onClick={() => setKpiBreakdownKind(card.kind)}
              onMouseEnter={() => setHoveredKpiCard(card.kind)}
              onMouseLeave={() => setHoveredKpiCard(null)}
              onFocus={() => setHoveredKpiCard(card.kind)}
              onBlur={() => setHoveredKpiCard(null)}
              className="rounded-lg p-4 text-left transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: isHovered ? C.accentLight : C.surface,
                border: `1px solid ${isHovered ? C.accent : C.border}`,
                outlineColor: C.accent,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
                  {card.label}
                </p>
                <ChevronRight
                  className="h-4 w-4 shrink-0"
                  style={{ color: isHovered ? C.accent : C.textTertiary }}
                />
              </div>
              <p className="text-lg font-semibold mt-1" style={{ color: C.textPrimary }}>
                {card.getValue(kpis)}
              </p>
              <p className="text-xs mt-1" style={{ color: C.textTertiary }}>
                View breakdown
              </p>
            </button>
          );
        })}
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
        >
          <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
            Active assignments
          </p>
          <p className="text-lg font-semibold mt-1" style={{ color: C.textPrimary }}>
            {kpis.activeAssignments}
          </p>
        </div>
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
              reloadToken={familiesReloadToken}
              organizationId={organizationId}
              slug={slug}
              branding={branding}
              initialFamilyId={focusFamilyId}
              onAdjust={(familyId, assignmentId, studentName) => {
                setAdjustFamilyId(familyId);
                setAdjustAssignmentId(assignmentId);
                setAdjustStudentName(studentName);
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

      <TuitionAdjustPanel
        open={adjustFamilyId != null && adjustAssignmentId != null}
        organizationId={organizationId}
        familyId={adjustFamilyId ?? ""}
        assignmentId={adjustAssignmentId ?? ""}
        studentName={adjustStudentName}
        branding={branding}
        onClose={() => {
          setAdjustFamilyId(null);
          setAdjustAssignmentId(null);
          setAdjustStudentName(null);
        }}
        onSaved={() => {
          setAdjustFamilyId(null);
          setAdjustAssignmentId(null);
          setAdjustStudentName(null);
          setFamiliesReloadToken((value) => value + 1);
          void loadData();
        }}
      />

      <TuitionKpiBreakdownPanel
        open={kpiBreakdownKind != null}
        kind={kpiBreakdownKind}
        organizationId={organizationId}
        branding={branding}
        outstandingPeriod={outstandingPeriod}
        schoolYearBounds={schoolYearBounds}
        onOutstandingPeriodChange={setOutstandingPeriod}
        expectedTotalCents={
          kpiBreakdownKind === "outstanding"
            ? kpis.outstandingCents
            : kpiBreakdownKind
              ? CLICKABLE_KPI_CARDS.find((card) => card.kind === kpiBreakdownKind)?.getExpectedTotalCents(
                  kpis,
                )
              : undefined
        }
        onClose={() => setKpiBreakdownKind(null)}
        onOpenFamily={(familyId) => {
          setKpiBreakdownKind(null);
          setFocusFamilyId(familyId);
          setTab("families");
          setFamiliesReloadToken((value) => value + 1);
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
