"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { formatMessagesUnreadBadge } from "@/components/messages/MessagesNavBadge";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCommitteeBrowseList from "@/components/school-parent/committees/ParentCommitteeBrowseList";
import ParentCommitteeDetail from "@/components/school-parent/committees/ParentCommitteeDetail";
import ParentCommitteeMineList from "@/components/school-parent/committees/ParentCommitteeMineList";
import ParentCommitteeWorkspace from "@/components/school-parent/committees/ParentCommitteeWorkspace";
import GardenCommitteesRail from "@/components/school-parent/committees/garden/GardenCommitteesRail";
import {
  committeesSubtitle,
  type ParentCommitteesTab,
} from "@/components/school-parent/committees/garden/committee-garden-shared";
import { useCommitteesOverview } from "@/components/school-parent/committees/garden/useCommitteesOverview";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  GCard,
  GSkeleton,
  GTabBar,
  gBtnOutlineSm,
  type GTabBarItem,
} from "@/components/school-parent/garden/ui";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import { parentToast } from "@/lib/school-parent/parent-toast";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { CommitteeActivityItem } from "@/lib/committees/activity-feed";
import type {
  CommitteeSectionUnreadCounts,
  CommitteeUnreadSummary,
  CommitteeUnreadSection,
} from "@/lib/committees/committee-unread-types";
import { WORKSPACE_DIGEST_SECTION_LABELS } from "@/lib/committees/unread-workspace-digest-preview-format";
import type {
  Committee,
  ParentCommitteeBrowseItem,
  ParentCommitteeListItem,
} from "@/lib/committees/types";
import { useCommitteeUnreadSummary } from "@/lib/committees/use-committee-unread-summary";
import {
  reportPortalOperationalError,
  type PortalOperationalSurface,
} from "@/lib/portal-operational-errors";

export type CommitteesApiNamespace = "parent-portal" | "teacher-portal";

export type PortalCommitteesInitialData = {
  browseCommittees: ParentCommitteeBrowseItem[];
  myCommittees: ParentCommitteeListItem[];
  workspacesByCommitteeId: Record<string, Committee>;
  committeeUnreadSummary?: CommitteeUnreadSummary;
  committeeActivityByCommitteeId?: Record<string, CommitteeActivityItem[]>;
  previewGuardianUserId?: string | null;
};

function sectionUnreadForCommittee(
  summary: CommitteeUnreadSummary | undefined,
  committeeId: string,
): CommitteeSectionUnreadCounts | undefined {
  if (!summary) return undefined;
  const row = summary.byCommittee.find((item) => item.committeeId === committeeId);
  return row?.sections;
}

type PortalCommitteesPageProps = {
  organizationId: string;
  schoolSlug: string;
  schoolName: string;
  branding: OrganizationBranding;
  requesterName: string;
  apiNamespace: CommitteesApiNamespace;
  operationalSurface: PortalOperationalSurface;
  showGradeField?: boolean;
  previewMode?: boolean;
  initialData?: PortalCommitteesInitialData;
};

function LoadingSpinner({ label, muted }: { label: string; muted: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm" style={{ color: muted }}>
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export default function PortalCommitteesPage(props: PortalCommitteesPageProps) {
  const { theme } = useParentTheme();

  return (
    <Suspense fallback={<LoadingSpinner label="Loading committees…" muted={theme.muted} />}>
      <PortalCommitteesPageContent {...props} />
    </Suspense>
  );
}

function PortalCommitteesPageContent({
  organizationId,
  schoolSlug,
  schoolName,
  branding: _branding,
  requesterName,
  apiNamespace,
  operationalSurface,
  showGradeField = true,
  previewMode = false,
  initialData,
}: PortalCommitteesPageProps) {
  const { theme } = useParentTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasInitialData = initialData !== undefined;

  const tab = (searchParams.get("tab") === "explore" ? "explore" : "mine") as ParentCommitteesTab;
  const exploreCommitteeId = searchParams.get("explore");
  const workspaceCommitteeId = searchParams.get("committee");
  const activeSection = searchParams.get("section") ?? "home";
  const initialCommitteeEventId = searchParams.get("event");
  const initialCommitteeEventDate = searchParams.get("date");
  const initialCommitteeResourceId = searchParams.get("resource");
  const initialCommitteeTaskId = searchParams.get("task");
  const initialCommitteeProjectId = searchParams.get("project");

  const [browseCommittees, setBrowseCommittees] = useState<ParentCommitteeBrowseItem[]>(
    initialData?.browseCommittees ?? [],
  );
  const [myCommittees, setMyCommittees] = useState<ParentCommitteeListItem[]>(
    initialData?.myCommittees ?? [],
  );
  const [browseLoaded, setBrowseLoaded] = useState(hasInitialData);
  const [mineLoaded, setMineLoaded] = useState(hasInitialData);
  const [loadingBrowse, setLoadingBrowse] = useState(false);
  const [loadingMine, setLoadingMine] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const committeesApiBase = `/api/${apiNamespace}/committees`;
  const { summary: liveUnreadSummary } = useCommitteeUnreadSummary(
    committeesApiBase,
    organizationId,
    !previewMode,
    previewMode ? initialData?.committeeUnreadSummary : undefined,
  );
  const unreadSummarySource = useMemo((): CommitteeUnreadSummary => {
    if (previewMode && initialData?.committeeUnreadSummary) {
      return initialData.committeeUnreadSummary;
    }
    return liveUnreadSummary;
  }, [initialData?.committeeUnreadSummary, liveUnreadSummary, previewMode]);

  const unreadByCommitteeId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of unreadSummarySource.byCommittee) {
      map[row.committeeId] = row.unread;
    }
    return map;
  }, [unreadSummarySource]);

  const unreadSectionLabelsByCommitteeId = useMemo(() => {
    const sectionOrder: CommitteeUnreadSection[] = [
      "messages",
      "tasks",
      "resources",
      "calendar",
    ];
    const map: Record<string, string[]> = {};
    for (const row of unreadSummarySource.byCommittee) {
      const labels = sectionOrder
        .filter((section) => row.sections[section] > 0)
        .map((section) => WORKSPACE_DIGEST_SECTION_LABELS[section]);
      if (labels.length > 0) {
        map[row.committeeId] = labels;
      }
    }
    return map;
  }, [unreadSummarySource]);

  const setUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) params.delete(key);
        else params.set(key, value);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const fetchBrowseList = useCallback(async () => {
    const params = new URLSearchParams({ organizationId });
    const browseRes = await fetch(`${committeesApiBase}/browse?${params}`);
    const browseData = await browseRes.json().catch(() => ({}));
    if (!browseRes.ok) {
      throw new Error(browseData.error ?? "Failed to load committees.");
    }
    setBrowseCommittees(browseData.committees ?? []);
    setBrowseLoaded(true);
  }, [committeesApiBase, organizationId]);

  const fetchMineList = useCallback(async () => {
    const params = new URLSearchParams({ organizationId });
    const mineRes = await fetch(`${committeesApiBase}/mine?${params}`);
    const mineData = await mineRes.json().catch(() => ({}));
    if (!mineRes.ok) {
      throw new Error(mineData.error ?? "Failed to load your committees.");
    }
    setMyCommittees(mineData.committees ?? []);
    setMineLoaded(true);
  }, [committeesApiBase, organizationId]);

  const loadTabIfNeeded = useCallback(
    async (targetTab: ParentCommitteesTab) => {
      if (previewMode || hasInitialData) return;

      if (targetTab === "explore") {
        if (browseLoaded || loadingBrowse) return;
        setLoadingBrowse(true);
        setError(null);
        try {
          await fetchBrowseList();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load committees.");
          void reportPortalOperationalError(
            operationalSurface,
            {
              organizationId,
              operation: "committees.load_browse",
              error: "",
            },
            err,
          );
        } finally {
          setLoadingBrowse(false);
        }
        return;
      }

      if (mineLoaded || loadingMine) return;
      setLoadingMine(true);
      setError(null);
      try {
        await fetchMineList();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load your committees.");
        void reportPortalOperationalError(
          operationalSurface,
          {
            organizationId,
            operation: "committees.load_mine",
            error: "",
          },
          err,
        );
      } finally {
        setLoadingMine(false);
      }
    },
    [
      browseLoaded,
      fetchBrowseList,
      fetchMineList,
      hasInitialData,
      loadingBrowse,
      loadingMine,
      mineLoaded,
      operationalSurface,
      organizationId,
      previewMode,
    ],
  );

  const reloadLists = useCallback(async () => {
    if (previewMode) return;
    setError(null);
    try {
      await Promise.all([fetchBrowseList(), fetchMineList()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load committees.");
      void reportPortalOperationalError(
        operationalSurface,
        {
          organizationId,
          operation: "committees.load",
          error: "",
        },
        err,
      );
    }
  }, [fetchBrowseList, fetchMineList, operationalSurface, organizationId, previewMode]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadTabIfNeeded(tab);
    });
  }, [loadTabIfNeeded, tab]);

  const selectedBrowseCommittee = exploreCommitteeId
    ? browseCommittees.find((c) => c.id === exploreCommitteeId) ?? null
    : null;
  const memberWorkspaceId =
    workspaceCommitteeId ??
    (selectedBrowseCommittee?.isMember ? selectedBrowseCommittee.id : null);

  const handleSelectTab = useCallback(
    (key: ParentCommitteesTab) => {
      setUrl({ tab: key, explore: null, committee: null, section: null });
      void loadTabIfNeeded(key);
    },
    [loadTabIfNeeded, setUrl],
  );

  const reduce = useReducedMotion() === true;
  const overview = useCommitteesOverview({
    myCommittees,
    browseCommittees,
    unreadByCommitteeId,
  });
  const [retrying, setRetrying] = useState(false);

  const retryLists = useCallback(async () => {
    setRetrying(true);
    try {
      await reloadLists();
    } finally {
      setRetrying(false);
    }
  }, [reloadLists]);

  // Same message as the inline alert, as a toast; the stable id stops repeats.
  useEffect(() => {
    if (!error) return;
    parentToast.error("Couldn't load committees", {
      id: "committees-list-error",
      description: error,
      action: { label: "Try again", onClick: () => void retryLists() },
    });
  }, [error, retryLists]);

  if (memberWorkspaceId) {
    return (
      <ParentCommitteeWorkspace
        key={memberWorkspaceId}
        committeeId={memberWorkspaceId}
        organizationId={organizationId}
        schoolSlug={schoolSlug}
        theme={theme}
        activeSection={activeSection}
        previewMode={previewMode}
        apiNamespace={apiNamespace}
        operationalSurface={operationalSurface}
        initialCommittee={initialData?.workspacesByCommitteeId[memberWorkspaceId]}
        initialActivityItems={
          initialData?.committeeActivityByCommitteeId?.[memberWorkspaceId]
        }
        initialSectionUnread={sectionUnreadForCommittee(
          initialData?.committeeUnreadSummary,
          memberWorkspaceId,
        )}
        previewGuardianUserId={initialData?.previewGuardianUserId}
        initialCommitteeEventId={initialCommitteeEventId}
        initialCommitteeEventDate={initialCommitteeEventDate}
        initialCommitteeResourceId={initialCommitteeResourceId}
        initialCommitteeTaskId={initialCommitteeTaskId}
        initialCommitteeProjectId={initialCommitteeProjectId}
        onSectionChange={(section) =>
          setUrl({ committee: memberWorkspaceId, section, tab: "mine", explore: null })
        }
        onBack={() => setUrl({ committee: null, section: null, tab: "mine" })}
      />
    );
  }

  if (selectedBrowseCommittee && !selectedBrowseCommittee.isMember) {
    return (
      <ParentCommitteeDetail
        key={selectedBrowseCommittee.id}
        committee={selectedBrowseCommittee}
        theme={theme}
        organizationId={organizationId}
        schoolSlug={schoolSlug}
        schoolName={schoolName}
        requesterName={requesterName}
        apiNamespace={apiNamespace}
        operationalSurface={operationalSurface}
        showGradeField={showGradeField}
        readOnly={previewMode}
        onBack={() => setUrl({ explore: null })}
        onRequestSubmitted={() => {
          void reloadLists();
        }}
        onOpenMyCommittees={() => handleSelectTab("mine")}
      />
    );
  }

  const tabLoading = tab === "explore" ? loadingBrowse && !browseLoaded : loadingMine && !mineLoaded;
  const pillSpinner = <Loader2 className="h-3 w-3 animate-spin" aria-hidden />;
  const tabItems: GTabBarItem[] = [
    {
      key: "mine",
      label: "My committees",
      testId: "parent-committees-mine-nav",
      suffix: loadingMine ? (
        pillSpinner
      ) : overview.unreadTotal > 0 ? (
        <span
          aria-label={`${overview.unreadTotal} unread`}
          className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold leading-none ${
            tab === "mine" ? "bg-white text-[var(--sf-clay-deep)]" : "bg-[var(--sf-clay)] text-white"
          }`}
        >
          {formatMessagesUnreadBadge(overview.unreadTotal)}
        </span>
      ) : undefined,
      ariaBusy: loadingMine,
      disabled: loadingMine,
    },
    {
      key: "explore",
      label: "Explore",
      testId: "parent-committees-explore-nav",
      suffix: loadingBrowse ? pillSpinner : undefined,
      ariaBusy: loadingBrowse,
      disabled: loadingBrowse,
    },
  ];

  return (
    <ParentGardenFrame theme={theme}>
      <div className={PORTAL_HOME_CONTAINER_CLASS}>
        <div data-testid="parent-committees-story-header">
          <ParentGardenPageHeader
            kicker="Volunteer & committees"
            title={
              <>
                {tab === "explore" ? "Explore" : "Your"}{" "}
                <span className="text-[var(--sf-clay)]">committees</span>
              </>
            }
            subtitle={committeesSubtitle(tab, browseCommittees.length, myCommittees.length)}
            actions={
              <GTabBar
                items={tabItems}
                activeKey={tab}
                onChange={(key) => handleSelectTab(key as ParentCommitteesTab)}
                ariaLabel="Committee sections"
                data-testid="parent-committees-nav"
              />
            }
          />
        </div>

        {error ? (
          <div
            role="alert"
            data-testid="parent-committees-error"
            className="flex flex-col gap-3 rounded-[20px] border-[1.5px] border-[var(--sf-clay)]/30 bg-[var(--sf-peach)] p-4 sm:flex-row sm:items-center"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">{error}</p>
              <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-ink)]/70">
                Check your connection, then try again.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void retryLists()}
              disabled={retrying}
              aria-busy={retrying || undefined}
              className={gBtnOutlineSm}
            >
              {retrying ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden />
              )}
              {retrying ? "Trying again…" : "Try again"}
            </button>
          </div>
        ) : null}

        <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              className="min-w-0"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: PORTAL_EASE }}
            >
              {tabLoading ? (
                <GCard index={1} kicker={tab === "explore" ? "Explore" : "My committees"}>
                  <p
                    role="status"
                    className="m-0 mb-4 inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--sf-soft)]"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    {tab === "explore" ? "Loading committees…" : "Loading your committees…"}
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }, (_, index) => (
                      <GSkeleton key={index} className="h-44 !rounded-[20px]" />
                    ))}
                  </div>
                </GCard>
              ) : tab === "explore" ? (
                <ParentCommitteeBrowseList
                  committees={browseCommittees}
                  onOpenCommittee={(id) => {
                    const committee = browseCommittees.find((entry) => entry.id === id);
                    if (committee?.isMember) {
                      setUrl({
                        committee: id,
                        section: "home",
                        tab: "mine",
                        explore: null,
                      });
                      return;
                    }
                    setUrl({ explore: id, tab: "explore" });
                  }}
                />
              ) : (
                <ParentCommitteeMineList
                  committees={myCommittees}
                  unreadByCommitteeId={unreadByCommitteeId}
                  unreadSectionLabelsByCommitteeId={unreadSectionLabelsByCommitteeId}
                  onExplore={() => handleSelectTab("explore")}
                  onOpenCommittee={(id) =>
                    setUrl({
                      committee: id,
                      section: "home",
                      tab: "mine",
                      explore: null,
                    })
                  }
                />
              )}
            </motion.div>
          </AnimatePresence>

          <GardenCommitteesRail
            tab={tab}
            myCount={myCommittees.length}
            unreadTotal={overview.unreadTotal}
            openTaskTotal={overview.openTaskTotal}
            journeyStep={overview.journeyStep}
            pendingCount={overview.pendingCount}
            onSelectTab={handleSelectTab}
          />
        </div>
      </div>
    </ParentGardenFrame>
  );
}
