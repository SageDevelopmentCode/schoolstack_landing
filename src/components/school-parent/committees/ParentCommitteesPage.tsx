"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCommitteeBrowseList from "./ParentCommitteeBrowseList";
import ParentCommitteeDetail from "./ParentCommitteeDetail";
import ParentCommitteeMineList from "./ParentCommitteeMineList";
import ParentCommitteeWorkspace from "./ParentCommitteeWorkspace";
import ParentCommitteesStoryHeader, {
  type ParentCommitteesTab,
} from "./ParentCommitteesStoryHeader";
import { parentCommitteesViewTransition } from "./parent-committees-view-transition";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ParentCommitteesInitialData } from "@/lib/committees/load-parent-committees-data";
import type {
  ParentCommitteeBrowseItem,
  ParentCommitteeListItem,
} from "@/lib/committees/types";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

type ParentCommitteesPageProps = {
  organizationId: string;
  schoolSlug: string;
  schoolName: string;
  branding: OrganizationBranding;
  guardianName: string;
  previewMode?: boolean;
  initialData?: ParentCommitteesInitialData;
};

function LoadingSpinner({ label, muted }: { label: string; muted: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm" style={{ color: muted }}>
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export default function ParentCommitteesPage(props: ParentCommitteesPageProps) {
  const { theme } = useParentTheme();

  return (
    <Suspense fallback={<LoadingSpinner label="Loading committees…" muted={theme.muted} />}>
      <ParentCommitteesPageContent {...props} />
    </Suspense>
  );
}

function ParentCommitteesPageContent({
  organizationId,
  schoolSlug,
  schoolName,
  branding: _branding,
  guardianName,
  previewMode = false,
  initialData,
}: ParentCommitteesPageProps) {
  const { theme, adminCompat } = useParentTheme();
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
        fetch(`/api/parent-portal/committees/browse?${params}`),
        fetch(`/api/parent-portal/committees/mine?${params}`),
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
        "parent_portal",
        {
          organizationId,
          operation: "committees.load",
          error: "",
        },
        err,
      );
    }
  }, [organizationId, previewMode]);

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
          fetch(`/api/parent-portal/committees/browse?${params}`),
          fetch(`/api/parent-portal/committees/mine?${params}`),
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
            "parent_portal",
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
  }, [organizationId, hasInitialData]);

  const selectedBrowseCommittee = exploreCommitteeId
    ? browseCommittees.find((c) => c.id === exploreCommitteeId) ?? null
    : null;

  const handleSelectTab = useCallback(
    (key: ParentCommitteesTab) => {
      setUrl({ tab: key, explore: null, committee: null, section: null });
    },
    [setUrl],
  );

  if (workspaceCommitteeId) {
    return (
      <ParentCommitteeWorkspace
        key={workspaceCommitteeId}
        committeeId={workspaceCommitteeId}
        organizationId={organizationId}
        theme={theme}
        activeSection={activeSection}
        initialCommittee={initialData?.workspacesByCommitteeId[workspaceCommitteeId]}
        onSectionChange={(section) =>
          setUrl({ committee: workspaceCommitteeId, section, tab: "mine", explore: null })
        }
        onBack={() => setUrl({ committee: null, section: null, tab: "mine" })}
      />
    );
  }

  if (selectedBrowseCommittee) {
    return (
      <ParentCommitteeDetail
        committee={selectedBrowseCommittee}
        theme={theme}
        organizationId={organizationId}
        schoolSlug={schoolSlug}
        schoolName={schoolName}
        guardianName={guardianName}
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
                    onOpenCommittee={(id) => setUrl({ explore: id, tab: "explore" })}
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
