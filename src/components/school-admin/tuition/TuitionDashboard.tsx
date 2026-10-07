"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import TuitionFormsPanel from "@/components/school-admin/tuition/TuitionFormsPanel";
import TuitionPaymentHistoryPanel from "@/components/school-admin/tuition/TuitionPaymentHistoryPanel";
import TuitionRateCatalogPanel from "@/components/school-admin/tuition/TuitionRateCatalogPanel";
import type { TuitionRateCatalogTabId } from "@/components/school-admin/tuition/tuition-rate-catalog-tabs";
import TuitionRulesPanel from "@/components/school-admin/tuition/TuitionRulesPanel";
import TuitionSetupPanel from "@/components/school-admin/tuition/TuitionSetupPanel";
import TuitionSetupWizardModal from "@/components/school-admin/tuition/TuitionSetupWizardModal";
import TuitionStoryHeader from "@/components/school-admin/tuition/TuitionStoryHeader";
import {
  parseTuitionDashboardTabFromSearchParam,
  tuitionDashboardTabShowsKpi,
  type TuitionDashboardTabId,
} from "@/components/school-admin/tuition/tuition-dashboard-tabs";
import { formatCents } from "@/lib/tuition/pricing";
import { toastTuitionSyncResult } from "@/lib/tuition/sync-assignments-toast";
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
import type { FamilyBillingSummary } from "@/lib/tuition/types";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { createClient } from "@/utils/supabase/client";
import type { TuitionAdjustPreviewSnapshot } from "@/lib/tuition/tuition-adjust-preview";

export type TuitionInitialOpenAdjust = {
  familyId: string;
  assignmentId: string;
  studentName: string | null;
};

type TuitionDashboardProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  setupStatus: TuitionSetupStatus;
  initialDashboardData?: TuitionDashboardData | null;
  initialFamilies?: FamilyBillingSummary[];
  initialFamilyId?: string | null;
  dashboardDeferred?: boolean;
  previewMode?: boolean;
  initialDashboardTab?: TuitionDashboardTabId;
  initialRateCatalogTab?: TuitionRateCatalogTabId;
  initialOpenAdjust?: TuitionInitialOpenAdjust;
  adjustPreviewSnapshot?: TuitionAdjustPreviewSnapshot;
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
    <div
      className="relative overflow-hidden rounded-[15px] border bg-white p-[15px] text-left transition-transform hover:-translate-y-px"
      style={{ borderColor: "#E0E7E0" }}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: "#8ABAC6" }}
        aria-hidden
      />
      <button
        type="button"
        onClick={onClick}
        aria-label="View outstanding breakdown"
        className="block w-full cursor-pointer text-left"
      >
        <b
          className="mb-0.5 block font-heading text-2xl font-semibold"
          style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
        >
          {value}
        </b>
        <span className="text-[11px]" style={{ color: theme.muted }}>
          Outstanding
        </span>
      </button>
      <div className="mt-2">
        <TuitionOutstandingPeriodSelect
          value={outstandingPeriod}
          onChange={onOutstandingPeriodChange}
          schoolYearBounds={schoolYearBounds}
          C={C}
        />
      </div>
    </div>
  );
}

export default function TuitionDashboard({
  organizationId,
  branding,
  slug,
  setupStatus,
  initialDashboardData = null,
  initialFamilies,
  initialFamilyId = null,
  dashboardDeferred = false,
  previewMode = false,
  initialDashboardTab,
  initialRateCatalogTab,
  initialOpenAdjust,
  adjustPreviewSnapshot,
}: TuitionDashboardProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const searchParams = useSearchParams();
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const supabase = useMemo(() => createClient(), []);
  const reducedMotion = useReducedMotion() ?? false;

  const [tab, setTab] = useState<TuitionDashboardTabId>(() => {
    const fromUrl = parseTuitionDashboardTabFromSearchParam(searchParams.get("tab"));
    if (fromUrl) return fromUrl;
    return (
      initialDashboardTab ??
      (setupStatus.familiesWithBillingCount > 0 ? "families" : "catalog")
    );
  });
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
  const [adjustFamilyId, setAdjustFamilyId] = useState<string | null>(
    () => initialOpenAdjust?.familyId ?? null,
  );
  const [adjustAssignmentId, setAdjustAssignmentId] = useState<string | null>(
    () => initialOpenAdjust?.assignmentId ?? null,
  );
  const [adjustStudentName, setAdjustStudentName] = useState<string | null>(
    () => initialOpenAdjust?.studentName ?? null,
  );
  const embeddedAdjustPreview =
    previewMode && Boolean(initialOpenAdjust) && Boolean(adjustPreviewSnapshot);
  const [editAssignmentId, setEditAssignmentId] = useState<string | null>(null);
  const [showSetupPanel, setShowSetupPanel] = useState(false);
  const [readiness, setReadiness] = useState<TuitionReadinessStatus | null>(
    initialDashboardData?.pageMeta.readiness ?? null,
  );
  const [familiesReloadToken, setFamiliesReloadToken] = useState(0);
  const [kpiBreakdownKind, setKpiBreakdownKind] = useState<TuitionKpiBreakdownKind | null>(
    null,
  );
  const [focusFamilyId, setFocusFamilyId] = useState<string | null>(() => {
    const raw = searchParams.get("family") ?? searchParams.get("familyId");
    const trimmed = raw?.trim();
    return trimmed || initialFamilyId;
  });

  useEffect(() => {
    const familyFromUrl =
      searchParams.get("family") ?? searchParams.get("familyId");
    const tabParam = searchParams.get("tab");

    queueMicrotask(() => {
      if (familyFromUrl?.trim()) {
        setFocusFamilyId(familyFromUrl.trim());
      }
      const tabFromUrl = parseTuitionDashboardTabFromSearchParam(tabParam);
      if (tabFromUrl) {
        setTab(tabFromUrl);
      }
    });
  }, [searchParams]);

  const [outstandingPeriodSelection, setOutstandingPeriod] =
    useState<OutstandingPeriod>("current_month");
  const [unassignedBannerDismissed, setUnassignedBannerDismissed] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [createRatePlanWizardOpen, setCreateRatePlanWizardOpen] = useState(false);
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

  const loadData = useCallback(async (): Promise<RatePlanWithDetails[] | void> => {
    if (previewMode) return;

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
      return plans;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tuition data.");
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "tuition.dashboard.load",
        error: "",
      }, err);
      return undefined;
    } finally {
      setInitialLoading(false);
      setIsRefetching(false);
    }
  }, [applyDashboardData, organizationId, outstandingPeriod, previewMode, supabase]);

  const openCreateRatePlanWizard = useCallback(() => {
    setCreateRatePlanWizardOpen(true);
  }, []);

  const handleCreateRatePlanComplete = useCallback(async () => {
    setCreateRatePlanWizardOpen(false);
    setTab("catalog");
    const plans = await loadData();
    if (!plans?.length) return;
    const activePlans = plans.filter((plan) => plan.status !== "draft");
    const newest = [...activePlans].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    )[0];
    if (newest) {
      setSelectedPlanId(newest.id);
    }
  }, [loadData]);

  useEffect(() => {
    if (previewMode || dashboardDeferred && !initialDashboardData) return;
    if (initialDashboardData) return;
    queueMicrotask(() => {
      void loadData();
    });
  }, [dashboardDeferred, initialDashboardData, loadData, previewMode]);

  useEffect(() => {
    if (previewMode || !hasLoadedDashboardRef.current) return;
    if (skipOutstandingPeriodEffectRef.current) {
      skipOutstandingPeriodEffectRef.current = false;
      return;
    }
    queueMicrotask(() => {
      void loadData();
    });
  }, [loadData, outstandingPeriod]);

  const handleSyncAssignments = useCallback(async () => {
    if (previewMode) return;

    setSyncLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tuition/sync-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      const payload = (await response.json()) as {
        error?: string;
        assignedCount?: number;
        skippedAmbiguousCount?: number;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to sync tuition assignments.");
      }
      toastTuitionSyncResult(payload);
      setUnassignedBannerDismissed(false);
      setFamiliesReloadToken((value) => value + 1);
      await loadData();
    } catch (err) {
      const message = formatActionError(err, "Failed to sync tuition assignments.");
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "tuition.dashboard.sync",
        error: "",
      }, err);
      setError(message);
      adminToast.error(message);
    } finally {
      setSyncLoading(false);
    }
  }, [loadData, organizationId, previewMode]);

  const refreshMetaOnly = useCallback(async () => {
    await loadData();
    setFamiliesReloadToken((value) => value + 1);
  }, [loadData]);

  const showUnassignedBanner =
    !unassignedBannerDismissed &&
    (readiness?.unassignedEnrollmentCount ?? 0) > 0;

  return (
    <div
      className={`relative flex h-full min-h-0 flex-col${embeddedAdjustPreview ? " overflow-hidden" : ""}`}
    >
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
            onOpenSetupWizard={openCreateRatePlanWizard}
          />

          {showUnassignedBanner && tuitionDashboardTabShowsKpi(tab) ? (
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

          {tuitionDashboardTabShowsKpi(tab) ? (
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
          ) : null}

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
                  ratePlans={ratePlans}
                  initialFamilyId={focusFamilyId}
                  initialFamilies={initialFamilies}
                  previewMode={previewMode}
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
                  onStartSetup={openCreateRatePlanWizard}
                  saving={isRefetching}
                  initialRateCatalogTab={initialRateCatalogTab}
                />
              ) : null}

              {tab === "rules" ? (
                <TuitionRulesPanel
                  organizationId={organizationId}
                  branding={branding}
                  onRefresh={() => void loadData()}
                />
              ) : null}

              {tab === "payment_history" ? (
                <TuitionPaymentHistoryPanel
                  organizationId={organizationId}
                  onOpenFamily={(familyId) => {
                    setFocusFamilyId(familyId);
                    setTab("families");
                    setFamiliesReloadToken((value) => value + 1);
                  }}
                />
              ) : null}

              {tab === "forms" ? (
                <TuitionFormsPanel
                  organizationId={organizationId}
                  branding={branding}
                  onFamiliesChanged={() => setFamiliesReloadToken((value) => value + 1)}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>

          <TuitionAssignmentModal
            open={editAssignmentId != null}
            organizationId={organizationId}
            assignmentId={editAssignmentId ?? ""}
            branding={branding}
            ratePlans={ratePlans}
            onClose={() => setEditAssignmentId(null)}
            onSaved={() => {
              setEditAssignmentId(null);
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
                openCreateRatePlanWizard();
              }}
              onSwitchToCatalog={() => {
                setShowSetupPanel(false);
                setTab("catalog");
              }}
              onSwitchToFamilies={() => {
                setShowSetupPanel(false);
                setTab("families");
              }}
              onRefresh={async () => {
                await loadData();
              }}
            />
          ) : null}

          <TuitionSetupWizardModal
            open={createRatePlanWizardOpen}
            organizationId={organizationId}
            branding={branding}
            draftRatePlanId={setupStatus.draftRatePlanId}
            onClose={() => setCreateRatePlanWizardOpen(false)}
            onComplete={() => void handleCreateRatePlanComplete()}
          />
        </div>
      </div>

      <TuitionAdjustPanel
        open={adjustFamilyId != null && adjustAssignmentId != null}
        organizationId={organizationId}
        familyId={adjustFamilyId ?? ""}
        assignmentId={adjustAssignmentId ?? ""}
        studentName={adjustStudentName}
        branding={branding}
        layout={embeddedAdjustPreview ? "embedded" : "overlay"}
        previewSnapshot={embeddedAdjustPreview ? adjustPreviewSnapshot : undefined}
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
    </div>
  );
}
