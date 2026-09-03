"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import {
  tabPanelTransition,
  tabPanelVariants,
} from "@/lib/school-admin/admin-modal-motion";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import TuitionAdjustPanel from "@/components/school-admin/tuition/TuitionAdjustPanel";
import TuitionAssignmentModal from "@/components/school-admin/tuition/TuitionAssignmentModal";
import TuitionFamiliesPanel from "@/components/school-admin/tuition/TuitionFamiliesPanel";
import TuitionKpiBreakdownPanel from "@/components/school-admin/tuition/TuitionKpiBreakdownPanel";
import TuitionOutstandingPeriodSelect from "@/components/school-admin/tuition/TuitionOutstandingPeriodSelect";
import TuitionRateCatalogPanel from "@/components/school-admin/tuition/TuitionRateCatalogPanel";
import TuitionRulesPanel from "@/components/school-admin/tuition/TuitionRulesPanel";
import TuitionSetupPanel from "@/components/school-admin/tuition/TuitionSetupPanel";
import TuitionStoryHeader from "@/components/school-admin/tuition/TuitionStoryHeader";
import type { TuitionDashboardTabId } from "@/components/school-admin/tuition/tuition-dashboard-tabs";
import { formatCents } from "@/lib/tuition/pricing";
import { listRatePlansWithDetails } from "@/lib/tuition/rate-plans";
import type { RatePlanWithDetails } from "@/lib/tuition/types";
import type { TuitionKpiBreakdownKind } from "@/lib/tuition/kpi-breakdown";
import {
  availableOutstandingPeriods,
  deriveSchoolYearBounds,
  type OutstandingPeriod,
} from "@/lib/tuition/outstanding-period";
import { fetchTuitionPageMeta } from "@/lib/tuition/tuition-page-meta";
import type { TuitionReadinessStatus } from "@/lib/tuition/tuition-readiness";
import type { TuitionSetupStatus } from "@/lib/tuition/setup-status";
import type { TuitionDashboardData } from "@/lib/tuition/load-tuition-dashboard-data";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { createClient } from "@/utils/supabase/client";

type TuitionDashboardProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  setupStatus: TuitionSetupStatus;
  initialDashboardData?: TuitionDashboardData | null;
  dashboardDeferred?: boolean;
  onOpenSetupWizard: () => void;
};

const CLICKABLE_KPI_CARDS: Array<{
  kind: TuitionKpiBreakdownKind;
  label: string;
  accent: "forest" | "sky" | "gold" | "berry";
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
    accent: "forest",
    getValue: (kpis) => formatCents(kpis.collectedYtdCents),
    getExpectedTotalCents: (kpis) => kpis.collectedYtdCents,
  },
  {
    kind: "at_risk",
    label: "Families at risk",
    accent: "berry",
    getValue: (kpis) => String(kpis.familiesAtRisk),
    getExpectedTotalCents: (kpis) => kpis.familiesAtRisk,
  },
];

function TuitionOutstandingMetricCard({
  theme,
  C,
  value,
  outstandingPeriod,
  onOutstandingPeriodChange,
  schoolYearBounds,
  onClick,
}: {
  theme: ReturnType<typeof useSchoolAdminStoryTheme>["theme"];
  C: ReturnType<typeof parentThemeToAdminCompat>;
  value: string;
  outstandingPeriod: OutstandingPeriod;
  onOutstandingPeriodChange: (period: OutstandingPeriod) => void;
  schoolYearBounds: ReturnType<typeof deriveSchoolYearBounds>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="View outstanding breakdown"
      className="relative cursor-pointer overflow-hidden rounded-[15px] border bg-white p-[15px] text-left transition-transform hover:-translate-y-px"
      style={{ borderColor: "#E0E7E0" }}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: "#8ABAC6" }}
        aria-hidden
      />
      <b
        className="mb-0.5 block font-heading text-2xl font-semibold"
        style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
      >
        {value}
      </b>
      <span className="text-[11px]" style={{ color: theme.muted }}>
        Outstanding
      </span>
      <div
        className="mt-2"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <TuitionOutstandingPeriodSelect
          value={outstandingPeriod}
          onChange={onOutstandingPeriodChange}
          schoolYearBounds={schoolYearBounds}
          C={C}
        />
      </div>
    </button>
  );
}

export default function TuitionDashboard({
  organizationId,
  branding,
  slug,
  setupStatus,
  initialDashboardData = null,
  dashboardDeferred = false,
  onOpenSetupWizard,
}: TuitionDashboardProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const supabase = useMemo(() => createClient(), []);
  const reducedMotion = useReducedMotion() ?? false;

  const [tab, setTab] = useState<TuitionDashboardTabId>(
    setupStatus.familiesWithBillingCount > 0 ? "families" : "catalog",
  );
  const [ratePlans, setRatePlans] = useState<RatePlanWithDetails[]>(
    initialDashboardData?.ratePlans ?? [],
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(() => {
    const plans = initialDashboardData?.ratePlans ?? [];
    const activePlans = plans.filter((plan) => plan.status !== "draft");
    return activePlans[0]?.id ?? null;
  });
  const [initialLoading, setInitialLoading] = useState(
    () => dashboardDeferred || !initialDashboardData,
  );
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState(
    initialDashboardData?.pageMeta.kpis ?? {
      collectedYtdCents: 0,
      outstandingCents: 0,
      familiesAtRisk: 0,
      activeAssignments: 0,
    },
  );
  const [adjustFamilyId, setAdjustFamilyId] = useState<string | null>(null);
  const [adjustAssignmentId, setAdjustAssignmentId] = useState<string | null>(null);
  const [adjustStudentName, setAdjustStudentName] = useState<string | null>(null);
  const [editAssignmentId, setEditAssignmentId] = useState<string | null>(null);
  const [showSetupPanel, setShowSetupPanel] = useState(false);
  const [readiness, setReadiness] = useState<TuitionReadinessStatus | null>(
    initialDashboardData?.pageMeta.readiness ?? null,
  );
  const [familiesReloadToken, setFamiliesReloadToken] = useState(0);
  const [kpiBreakdownKind, setKpiBreakdownKind] = useState<TuitionKpiBreakdownKind | null>(
    null,
  );
  const [focusFamilyId, setFocusFamilyId] = useState<string | null>(null);
  const [outstandingPeriodSelection, setOutstandingPeriod] =
    useState<OutstandingPeriod>("current_month");
  const [unassignedBannerDismissed, setUnassignedBannerDismissed] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const hasLoadedDashboardRef = useRef(Boolean(initialDashboardData));
  const skipOutstandingPeriodEffectRef = useRef(true);

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

  const applyDashboardData = useCallback((data: TuitionDashboardData) => {
    setRatePlans(data.ratePlans);
    setKpis(data.pageMeta.kpis);
    setReadiness(data.pageMeta.readiness);
    const activePlans = data.ratePlans.filter((plan) => plan.status !== "draft");
    setSelectedPlanId((prev) => {
      if (prev && activePlans.some((plan) => plan.id === prev)) return prev;
      return activePlans[0]?.id ?? null;
    });
    hasLoadedDashboardRef.current = true;
  }, []);

  const loadData = useCallback(async () => {
    if (hasLoadedDashboardRef.current) {
      setIsRefetching(true);
    } else {
      setInitialLoading(true);
    }
    setError(null);

    try {
      const plans = await listRatePlansWithDetails(supabase, organizationId);
      const bounds = deriveSchoolYearBounds(plans);
      const pageMeta = await fetchTuitionPageMeta(supabase, organizationId, {
        outstandingPeriod,
        schoolYearBounds: bounds,
      });
      applyDashboardData({ ratePlans: plans, pageMeta });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tuition data.");
    } finally {
      setInitialLoading(false);
      setIsRefetching(false);
    }
  }, [applyDashboardData, organizationId, outstandingPeriod, supabase]);

  useEffect(() => {
    if (dashboardDeferred && !initialDashboardData) return;
    if (initialDashboardData) return;
    queueMicrotask(() => {
      void loadData();
    });
  }, [dashboardDeferred, initialDashboardData, loadData]);

  useEffect(() => {
    if (!hasLoadedDashboardRef.current) return;
    if (skipOutstandingPeriodEffectRef.current) {
      skipOutstandingPeriodEffectRef.current = false;
      return;
    }
    queueMicrotask(() => {
      void loadData();
    });
  }, [loadData, outstandingPeriod]);

  const handleSyncAssignments = useCallback(async () => {
    setSyncLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tuition/sync-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to sync tuition assignments.");
      }
      adminToast.success("Tuition assigned");
      setUnassignedBannerDismissed(false);
      setFamiliesReloadToken((value) => value + 1);
      await loadData();
    } catch (err) {
      const message = formatActionError(err, "Failed to sync tuition assignments.");
      setError(message);
      adminToast.error(message);
    } finally {
      setSyncLoading(false);
    }
  }, [loadData, organizationId]);

  const refreshMetaOnly = useCallback(async () => {
    await loadData();
    setFamiliesReloadToken((value) => value + 1);
  }, [loadData]);

  const showUnassignedBanner =
    !unassignedBannerDismissed &&
    (readiness?.unassignedEnrollmentCount ?? 0) > 0;

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14">
          <TuitionStoryHeader
            theme={theme}
            C={C}
            activeTab={tab}
            kpis={kpis}
            readiness={readiness}
            loadingTabKey={isRefetching ? tab : null}
            onTabChange={setTab}
            onOpenSetupPanel={() => setShowSetupPanel(true)}
            onOpenSetupWizard={onOpenSetupWizard}
          />

          {showUnassignedBanner ? (
            <div
              className="mb-[15px] flex flex-col items-start justify-between gap-3 rounded-[12px] border px-4 py-3.5 sm:flex-row sm:items-center"
              style={{
                backgroundColor: "#EAF4EB",
                borderColor: "#C7DFCB",
                color: "#42694F",
              }}
            >
              <span className="text-xs">
                <b>Needs attention:</b>{" "}
                {readiness?.unassignedEnrollmentCount === 1
                  ? "1 enrollment needs a tuition assignment."
                  : `${readiness?.unassignedEnrollmentCount ?? 0} enrollments need tuition assignments.`}
              </span>
              <div className="flex items-center gap-2">
                <AdminButton
                  theme={theme}
                  variant="soft"
                  onClick={() => void handleSyncAssignments()}
                  disabled={syncLoading}
                >
                  {syncLoading ? "Syncing…" : "Sync assignments"}
                </AdminButton>
                <button
                  type="button"
                  onClick={() => setUnassignedBannerDismissed(true)}
                  className="rounded-full p-1.5 cursor-pointer"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" style={{ color: theme.muted }} />
                </button>
              </div>
            </div>
          ) : null}

          <div className="relative mb-[19px]">
            {isRefetching ? (
              <div
                className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/60 pt-6"
                aria-hidden="true"
              >
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: theme.muted }} />
              </div>
            ) : null}
            <div
              className={`grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-4 ${
                initialLoading ? "animate-pulse opacity-70" : ""
              }`}
            >
              {CLICKABLE_KPI_CARDS.slice(0, 1).map((card) => (
                <AdminMetricCard
                  key={card.kind}
                  theme={theme}
                  value={card.getValue(kpis)}
                  label={card.label}
                  accent={card.accent}
                  onClick={() => setKpiBreakdownKind(card.kind)}
                />
              ))}
              <TuitionOutstandingMetricCard
                theme={theme}
                C={C}
                value={formatCents(kpis.outstandingCents)}
                outstandingPeriod={outstandingPeriod}
                onOutstandingPeriodChange={setOutstandingPeriod}
                schoolYearBounds={schoolYearBounds}
                onClick={() => setKpiBreakdownKind("outstanding")}
              />
              {CLICKABLE_KPI_CARDS.slice(1).map((card) => (
                <AdminMetricCard
                  key={card.kind}
                  theme={theme}
                  value={card.getValue(kpis)}
                  label={card.label}
                  accent={card.accent}
                  onClick={() => setKpiBreakdownKind(card.kind)}
                />
              ))}
              <AdminMetricCard
                theme={theme}
                value={String(kpis.activeAssignments)}
                label="Active assignments"
                accent="gold"
              />
            </div>
          </div>

          {error ? (
            <p className="mb-[15px] text-sm" style={{ color: "#AD574C" }}>
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
                  onRefresh={() => void refreshMetaOnly()}
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
                  onStartSetup={onOpenSetupWizard}
                  saving={isRefetching}
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
              void refreshMetaOnly();
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
              void refreshMetaOnly();
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
                onOpenSetupWizard();
              }}
              onSwitchToCatalog={() => {
                setShowSetupPanel(false);
                setTab("catalog");
              }}
              onSwitchToFamilies={() => {
                setShowSetupPanel(false);
                setTab("families");
              }}
              onRefresh={loadData}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
