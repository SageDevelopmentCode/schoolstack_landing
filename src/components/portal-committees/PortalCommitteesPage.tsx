"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
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
import type {
  Committee,
  ParentCommitteeBrowseItem,
  ParentCommitteeListItem,
} from "@/lib/committees/types";
import {
  reportPortalOperationalError,
  type PortalOperationalSurface,
} from "@/lib/portal-operational-errors";

export type CommitteesApiNamespace = "parent-portal" | "teacher-portal";

export type PortalCommitteesInitialData = {
  browseCommittees: ParentCommitteeBrowseItem[];
  myCommittees: ParentCommitteeListItem[];
  workspacesByCommitteeId: Record<string, Committee>;
};

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

  const tab = (searchParams.get("tab") === "mine" ? "mine" : "explore") as ParentCommitteesTab;
  const exploreCommitteeId = searchParams.get("explore");
  const workspaceCommitteeId = searchParams.get("committee");
  const activeSection = searchParams.get("section") ?? "home";

  const [browseCommittees, setBrowseCommittees] = useState<ParentCommitteeBrowseItem[]>(
    initialData?.browseCommittees ?? [],
  );
  const [myCommittees, setMyCommittees] = useState<ParentCommitteeListItem[]>(
    initialData?.myCommittees ?? [],
  );
  const [loadingBrowse, setLoadingBrowse] = useState(!hasInitialData);
  const [loadingMine, setLoadingMine] = useState(!hasInitialData);
  const [error, setError] = useState<string | null>(null);

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

  const reloadLists = useCallback(async () => {
    if (previewMode) return;
    try {
      const params = new URLSearchParams({ organizationId });
      const [browseRes, mineRes] = await Promise.all([
        fetch(`/api/${apiNamespace}/committees/browse?${params}`),
        fetch(`/api/${apiNamespace}/committees/mine?${params}`),
      ]);
      const [browseData, mineData] = await Promise.all([
        browseRes.json().catch(() => ({})),
        mineRes.json().catch(() => ({})),
      ]);
      if (!browseRes.ok) {
        throw new Error(browseData.error ?? "Failed to load committees.");
      }
      if (!mineRes.ok) {
        throw new Error(mineData.error ?? "Failed to load your committees.");
      }
      setBrowseCommittees(browseData.committees ?? []);
      setMyCommittees(mineData.committees ?? []);
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
  }, [apiNamespace, organizationId, operationalSurface, previewMode]);

  useEffect(() => {
    if (hasInitialData) return;

    let cancelled = false;
    (async () => {
      setLoadingBrowse(true);
      setLoadingMine(true);
      setError(null);
      try {
        const params = new URLSearchParams({ organizationId });
        const [browseRes, mineRes] = await Promise.all([
          fetch(`/api/${apiNamespace}/committees/browse?${params}`),
          fetch(`/api/${apiNamespace}/committees/mine?${params}`),
        ]);
        const [browseData, mineData] = await Promise.all([
          browseRes.json().catch(() => ({})),
          mineRes.json().catch(() => ({})),
        ]);
        if (!browseRes.ok) {
          throw new Error(browseData.error ?? "Failed to load committees.");
        }
        if (!mineRes.ok) {
          throw new Error(mineData.error ?? "Failed to load your committees.");
        }
        if (!cancelled) {
          setBrowseCommittees(browseData.committees ?? []);
          setMyCommittees(mineData.committees ?? []);
        }
      } catch (err) {
        if (!cancelled) {
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
      } finally {
        if (!cancelled) {
          setLoadingBrowse(false);
          setLoadingMine(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiNamespace, hasInitialData, operationalSurface, organizationId]);

  const selectedBrowseCommittee = exploreCommitteeId
    ? browseCommittees.find((c) => c.id === exploreCommitteeId) ?? null
    : null;
  const memberWorkspaceId =
    workspaceCommitteeId ??
    (selectedBrowseCommittee?.isMember ? selectedBrowseCommittee.id : null);

  const handleSelectTab = useCallback(
    (key: ParentCommitteesTab) => {
      setUrl({ tab: key, explore: null, committee: null, section: null });
    },
    [setUrl],
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
                {loadingBrowse ? (
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
                {loadingMine ? (
                  <LoadingSpinner label="Loading your committees…" muted={theme.muted} />
                ) : (
                  <ParentCommitteeMineList
                    committees={myCommittees}
                    theme={theme}
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
