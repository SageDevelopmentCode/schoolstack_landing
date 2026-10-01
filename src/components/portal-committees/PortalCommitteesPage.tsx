"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCommitteeBrowseList from "@/components/school-parent/committees/ParentCommitteeBrowseList";
import ParentCommitteeDetail from "@/components/school-parent/committees/ParentCommitteeDetail";
import ParentCommitteeMineList from "@/components/school-parent/committees/ParentCommitteeMineList";
import ParentCommitteeWorkspace from "@/components/school-parent/committees/ParentCommitteeWorkspace";
import ParentCommitteesStoryHeader, {
  type ParentCommitteesTab,
} from "@/components/school-parent/committees/ParentCommitteesStoryHeader";
import { parentCommitteesViewTransition } from "@/components/school-parent/committees/parent-committees-view-transition";
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
      />
    );
  }

  return (
    <div className="min-h-full w-full" style={{ backgroundColor: theme.paper }}>
      <div className="mx-auto flex max-w-[1250px] flex-col gap-6 px-4 py-6 sm:gap-8 sm:py-8 md:px-9">
        <ParentCommitteesStoryHeader
          theme={theme}
          activeTab={tab}
          exploreCount={browseCommittees.length}
          myCount={myCommittees.length}
          loadingExplore={loadingBrowse}
          loadingMine={loadingMine}
          onSelectTab={handleSelectTab}
        />

        {error && (
          <p className="text-sm" style={{ color: theme.alert }}>
            {error}
          </p>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={tab} {...parentCommitteesViewTransition}>
            {tab === "explore" && (
              <>
                {loadingBrowse && !browseLoaded ? (
                  <LoadingSpinner label="Loading committees…" muted={theme.muted} />
                ) : (
                  <ParentCommitteeBrowseList
                    committees={browseCommittees}
                    theme={theme}
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
                )}
              </>
            )}

            {tab === "mine" && (
              <>
                {loadingMine && !mineLoaded ? (
                  <LoadingSpinner label="Loading your committees…" muted={theme.muted} />
                ) : (
                  <ParentCommitteeMineList
                    committees={myCommittees}
                    theme={theme}
                    unreadByCommitteeId={unreadByCommitteeId}
                    unreadSectionLabelsByCommitteeId={unreadSectionLabelsByCommitteeId}
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
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
