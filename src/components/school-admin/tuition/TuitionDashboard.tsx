"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, Plus, X } from "lucide-react";
import {
  AdminGardenPage,
  AdminGardenPageHeader,
  GardenLoadError,
  GardenNotice,
  GardenStatTiles,
  gIconBtn,
} from "@/components/school-admin/garden/kit";
import { GardenRefetchVeil } from "@/components/school-admin/garden/blocks";
import { gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import {
  tabPanelTransition,
  tabPanelVariants,
} from "@/lib/school-admin/admin-modal-motion";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
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
import {
  TUITION_DASHBOARD_TABS,
  TUITION_DASHBOARD_TAB_ICON_CLASS,
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

function tuitionSubtitleForTab(
  tab: TuitionDashboardTabId,
  kpis: { collectedYtdCents: number; outstandingCents: number; familiesAtRisk: number },
): string {
  const overviewParts: string[] = [
    `${formatCents(kpis.collectedYtdCents)} collected YTD`,
    `${formatCents(kpis.outstandingCents)} outstanding`,
  ];
  if (kpis.familiesAtRisk > 0) {
    overviewParts.push(`${kpis.familiesAtRisk} ${kpis.familiesAtRisk === 1 ? "family" : "families"} at risk`);
  }
  switch (tab) {
    case "families":
      return overviewParts.join(" · ");
    case "catalog":
      return "Rate plans, payment options, and fees for each program";
    case "rules":
      return "Late fees and tuition adjustment rules";
    case "payment_history":
      return "All tuition payments across families";
    case "forms":
      return "Service-for-tuition agreements and family signatures";
  }
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

  const syncRef = useRef<() => Promise<void>>(async () => {});
  const handleSyncAssignments = useCallback(async () => {
    if (previewMode) return;

    setSyncLoading(true);
    adminToast.dismiss("tuition-sync-error");
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
      adminToast.error("Couldn't sync tuition assignments.", {
        id: "tuition-sync-error",
        description: `${message} Nothing was assigned.`,
        action: { label: "Retry", onClick: () => void syncRef.current() },
      });
    } finally {
      setSyncLoading(false);
    }
  }, [loadData, organizationId, previewMode]);
  useEffect(() => {
    syncRef.current = handleSyncAssignments;
  }, [handleSyncAssignments]);

  const refreshMetaOnly = useCallback(async () => {
    await loadData();
    setFamiliesReloadToken((value) => value + 1);
  }, [loadData]);

  const showUnassignedBanner =
    !unassignedBannerDismissed &&
    (readiness?.unassignedEnrollmentCount ?? 0) > 0;

  const tabItems = TUITION_DASHBOARD_TABS.map((entry) => {
    const Icon = entry.icon;
    const tabLoading = isRefetching && entry.id === tab;
    return {
      key: entry.id,
      label: entry.label,
      icon: <Icon className={TUITION_DASHBOARD_TAB_ICON_CLASS} aria-hidden />,
      ariaBusy: tabLoading,
      testId: `tuition-tab-${entry.id}`,
      suffix: tabLoading ? <Loader2 className="h-3 w-3 animate-spin" data-testid="tuition-tab-loading" /> : undefined,
    };
  });
  const setupAllComplete = readiness ? readiness.completedCount === readiness.totalCount : true;
  const setupNeedsAttention = readiness ? !setupAllComplete || readiness.unassignedEnrollmentCount > 0 : false;
  const unassignedCount = readiness?.unassignedEnrollmentCount ?? 0;

  return (
    <AdminGardenPage
      theme={theme}
      skinOverlays
      scroll={!embeddedAdjustPreview}
      className={embeddedAdjustPreview ? "h-full overflow-hidden" : ""}
      data-testid="admin-tuition-page"
      overlays={
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
      }
    >
          <AdminGardenPageHeader
            kicker="My school"
            title={<span className="text-[var(--sf-clay)]">Tuition</span>}
            subtitle={tuitionSubtitleForTab(tab, kpis)}
            actions={
              <>
                {readiness ? (
                  <button
                    type="button"
                    className={setupAllComplete ? gBtnOutlineSm : `${gBtnOutlineSm} !border-[var(--sf-clay)]/40 !bg-[var(--sf-accent-wash)]`}
                    onClick={() => setShowSetupPanel(true)}
                    data-testid="tuition-setup-button"
                  >
                    {setupNeedsAttention ? <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--sf-clay)]" aria-hidden /> : null}
                    Setup · {readiness.completedCount}/{readiness.totalCount}
                  </button>
                ) : null}
                <button type="button" className={gBtnOutlineSm} onClick={openCreateRatePlanWizard} data-testid="tuition-new-rate-plan">
                  <Plus className="h-4 w-4" aria-hidden />
                  New rate plan
                </button>
              </>
            }
            tabs={{
              items: tabItems,
              activeKey: tab,
              onChange: (key) => setTab(key as TuitionDashboardTabId),
              ariaLabel: "Tuition sections",
              "data-testid": "tuition-tab-nav",
            }}
          />

          {showUnassignedBanner && tuitionDashboardTabShowsKpi(tab) ? (
            <GardenNotice
              tone="warning"
              title="Needs attention"
              data-testid="tuition-unassigned-banner"
              action={
                <>
                  <button
                    type="button"
                    className={gBtnOutlineSm}
                    onClick={() => void handleSyncAssignments()}
                    disabled={syncLoading}
                    aria-busy={syncLoading || undefined}
                  >
                    {syncLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                    {syncLoading ? "Syncing…" : "Sync assignments"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnassignedBannerDismissed(true)}
                    className={gIconBtn}
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </>
              }
            >
              {unassignedCount === 1
                ? "1 enrollment needs a tuition assignment."
                : `${unassignedCount} enrollments need tuition assignments.`}{" "}
              Sync assigns each one to the matching rate plan.
            </GardenNotice>
          ) : null}

          {tuitionDashboardTabShowsKpi(tab) ? (
            <div className={`flex flex-col gap-2 ${initialLoading ? "animate-pulse opacity-70" : ""}`}>
              <GardenRefetchVeil active={isRefetching}>
                <GardenStatTiles
                  ariaLabel="Tuition at a glance"
                  stats={[
                    {
                      id: "collected_ytd",
                      label: "Collected YTD",
                      value: formatCents(kpis.collectedYtdCents),
                      accent: "forest",
                      onClick: () => setKpiBreakdownKind("collected_ytd"),
                    },
                    {
                      id: "outstanding",
                      label: "Outstanding",
                      value: formatCents(kpis.outstandingCents),
                      accent: "sky",
                      onClick: () => setKpiBreakdownKind("outstanding"),
                      testId: "tuition-kpi-outstanding",
                    },
                    {
                      id: "at_risk",
                      label: "Families at risk",
                      value: kpis.familiesAtRisk,
                      accent: "berry",
                      onClick: () => setKpiBreakdownKind("at_risk"),
                    },
                    { id: "active", label: "Active assignments", value: kpis.activeAssignments, accent: "gold" },
                  ]}
                />
              </GardenRefetchVeil>
              <div className="flex flex-wrap items-center justify-end gap-2 text-[12.5px] font-bold text-[var(--sf-soft)]">
                <span>Outstanding covers</span>
                <div className="w-[13rem]">
                  <TuitionOutstandingPeriodSelect
                    value={outstandingPeriod}
                    onChange={setOutstandingPeriod}
                    schoolYearBounds={schoolYearBounds}
                    C={C}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {error ? (
            <GardenLoadError
              title="Tuition didn't fully load"
              description={error}
              onRetry={() => void loadData()}
              retrying={isRefetching}
            />
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
    </AdminGardenPage>
  );
}
