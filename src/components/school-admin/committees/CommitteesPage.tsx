"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  archiveCommittee,
  createCommitteeFromTemplate,
  getCommittee,
  listCommittees,
  listCommitteeTemplates,
} from "@/lib/committees/committees";
import type { Committee, CommitteeListItem, CommitteeTemplate } from "@/lib/committees/types";
import { createClient } from "@/utils/supabase/client";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import {
  deriveCommitteeRosterMetrics,
  filterCommitteesByRosterFilter,
  type CommitteeRosterFilter,
} from "@/lib/school-admin/admin-committee-roster-metrics";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import CommitteeActivityFeed from "@/components/school-admin/committees/CommitteeActivityFeed";
import CommitteeActivityFeedSkeleton from "@/components/school-admin/committees/CommitteeActivityFeedSkeleton";
import CommitteeListView from "./CommitteeListView";
import CommitteeWorkspaceShell from "./CommitteeWorkspaceShell";
import CommitteeJoinRequestsPanel from "./CommitteeJoinRequestsPanel";
import CommitteesStoryHeader from "./CommitteesStoryHeader";
import CommitteeStoryFilterPill from "./committee-story-filter-pill";
import CreateCommitteeModal from "./modals/CreateCommitteeModal";
import ArchiveCommitteeModal from "./modals/ArchiveCommitteeModal";
import { parseCommitteeSection } from "./committee-routing";
import type { CommitteeActivityItem } from "@/lib/committees/activity-feed";
import SchoolAdminSummaryCardsSkeleton from "@/components/school-admin/skeletons/SchoolAdminSummaryCardsSkeleton";

type CommitteesPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
};

export default function CommitteesPage({
  organizationId,
  branding,
  slug,
}: CommitteesPageProps) {
  void branding;
  const { theme, C } = useSchoolAdminStoryTheme();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const joinRequestsRef = useRef<HTMLDivElement>(null);

  const committeeId = searchParams.get("committee");
  const activeSection = parseCommitteeSection(searchParams.get("section"));

  const [loading, setLoading] = useState(true);
  const [committees, setCommittees] = useState<CommitteeListItem[]>([]);
  const [templates, setTemplates] = useState<CommitteeTemplate[]>([]);
  const [activeCommittee, setActiveCommittee] = useState<Committee | null>(null);
  const [loadingCommittee, setLoadingCommittee] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [orgActivityItems, setOrgActivityItems] = useState<CommitteeActivityItem[]>([]);
  const [loadingOrgActivity, setLoadingOrgActivity] = useState(false);
  const [rosterFilter, setRosterFilter] = useState<CommitteeRosterFilter>("all");

  const loadList = useCallback(async () => {
    const [list, templateList] = await Promise.all([
      listCommittees(supabase, organizationId),
      listCommitteeTemplates(supabase, organizationId),
    ]);
    setCommittees(list);
    setTemplates(templateList);
  }, [supabase, organizationId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await loadList();
      } catch (e) {
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "committees.load",
          error: "",
        }, e);
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load committees");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadList]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({
          organizationId,
          status: "pending",
        });
        const res = await fetch(`/api/school-admin/committees/join-requests?${params}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;
        if (!cancelled) setPendingRequestCount((data.requests ?? []).length);
      } catch (err) {
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "committees.join_requests.count",
          error: "",
        }, err);
        if (!cancelled) setPendingRequestCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  useEffect(() => {
    if (committeeId) return;

    let cancelled = false;
    (async () => {
      setLoadingOrgActivity(true);
      try {
        const params = new URLSearchParams({
          organizationId,
          slug,
          limit: "12",
        });
        const res = await fetch(`/api/school-admin/committees/activity?${params}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error ?? "Failed to load activity.");
        }
        if (!cancelled) setOrgActivityItems(data.items ?? []);
      } catch (err) {
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "committees.activity.org_load",
          error: "",
        }, err);
        if (!cancelled) setOrgActivityItems([]);
      } finally {
        if (!cancelled) setLoadingOrgActivity(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [committeeId, organizationId, slug]);

  const loadPendingRequestCount = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        organizationId,
        status: "pending",
      });
      const res = await fetch(`/api/school-admin/committees/join-requests?${params}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;
      setPendingRequestCount((data.requests ?? []).length);
    } catch (err) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.join_requests.count",
        error: "",
      }, err);
      setPendingRequestCount(0);
    }
  }, [organizationId]);

  useEffect(() => {
    if (!committeeId) return;

    let cancelled = false;
    (async () => {
      setLoadingCommittee(true);
      setError(null);
      try {
        const committee = await getCommittee(supabase, organizationId, committeeId);
        if (!cancelled) setActiveCommittee(committee);
      } catch (e) {
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "committees.load_detail",
          error: "",
        }, e);
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load committee");
        }
      } finally {
        if (!cancelled) setLoadingCommittee(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [committeeId, supabase, organizationId]);

  const displayedCommittee =
    committeeId && activeCommittee?.id === committeeId ? activeCommittee : null;

  const metrics = useMemo(
    () => deriveCommitteeRosterMetrics(committees, pendingRequestCount),
    [committees, pendingRequestCount],
  );

  const filteredCommittees = useMemo(
    () => filterCommitteesByRosterFilter(committees, rosterFilter),
    [committees, rosterFilter],
  );

  const setUrl = useCallback(
    (nextCommitteeId: string | null, section?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextCommitteeId) {
        params.set("committee", nextCommitteeId);
        if (section) params.set("section", section);
        else if (!params.get("section")) params.set("section", "home");
      } else {
        params.delete("committee");
        params.delete("section");
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const handleOpenCommittee = (id: string) => {
    setUrl(id, "home");
  };

  const handleBack = () => {
    setUrl(null);
  };

  const handleSectionChange = (section: string) => {
    if (committeeId) setUrl(committeeId, section);
  };

  const handleOpenCommitteeActivity = (item: CommitteeActivityItem) => {
    if (!item.committeeId) return;
    setUrl(item.committeeId, "activity");
  };

  const handleCreate = async (input: {
    templateId: string | null;
    platformSlug: string;
    name: string;
    description: string;
    termLabel: string;
  }) => {
    try {
      const created = await createCommitteeFromTemplate(supabase, organizationId, {
        templateId: input.templateId,
        platformSlug: input.platformSlug,
        name: input.name,
        description: input.description,
        termLabel: input.termLabel,
        status: "active",
      });
      await loadList();
      setUrl(created.id, "home");
      setActiveCommittee(created);
      adminToast.success("Committee created");
    } catch (err) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.create",
        error: "",
      }, err);
      adminToast.error(formatActionError(err, "Failed to create committee."));
      throw err;
    }
  };

  const handleArchive = async () => {
    if (!activeCommittee) return;
    try {
      const updated = await archiveCommittee(
        supabase,
        organizationId,
        activeCommittee.id,
      );
      setActiveCommittee(updated);
      await loadList();
      setShowArchive(false);
      adminToast.success("Committee archived");
    } catch (err) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.archive",
        error: "",
      }, err);
      adminToast.error(formatActionError(err, "Failed to archive committee."));
      throw err;
    }
  };

  const focusJoinRequests = () => {
    joinRequestsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px]">
        <SchoolAdminSummaryCardsSkeleton C={C} count={3} />
      </div>
    );
  }

  if (error && !committeeId) {
    return (
      <div className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px]">
        <p className="text-sm" style={{ color: C.error }}>
          {error}
        </p>
      </div>
    );
  }

  if (committeeId) {
    if (loadingCommittee || !displayedCommittee) {
      return (
        <div className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px]">
          <SchoolAdminSummaryCardsSkeleton C={C} count={2} />
        </div>
      );
    }

    return (
      <>
        <CommitteeWorkspaceShell
          committee={displayedCommittee}
          theme={theme}
          supabase={supabase}
          organizationId={organizationId}
          schoolSlug={slug}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onBack={handleBack}
          onCommitteeChange={setActiveCommittee}
          onArchive={() => setShowArchive(true)}
          onJoinRequestsChanged={loadPendingRequestCount}
        />
        <AnimatePresence>
          {showArchive && (
            <ArchiveCommitteeModal
              theme={theme}
              committee={displayedCommittee}
              onClose={() => setShowArchive(false)}
              onConfirm={handleArchive}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  const showMetrics = committees.length > 0;

  return (
    <>
      <div className="relative flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14">
            <CommitteesStoryHeader
              theme={theme}
              activeCount={metrics.activeCount}
              pendingRequestCount={metrics.pendingJoinRequests}
              onCreate={() => setShowCreate(true)}
            />

            {showMetrics ? (
              <>
                <div className="mb-[19px] grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-4">
                  <AdminMetricCard
                    theme={theme}
                    value={String(metrics.activeCount)}
                    label="Active committees"
                    accent="forest"
                  />
                  <AdminMetricCard
                    theme={theme}
                    value={String(metrics.totalVolunteers)}
                    label="Total volunteers"
                    accent="sky"
                  />
                  <AdminMetricCard
                    theme={theme}
                    value={String(metrics.pendingJoinRequests)}
                    label="Pending join requests"
                    accent="gold"
                  />
                  <AdminMetricCard
                    theme={theme}
                    value={String(metrics.archivedCount)}
                    label="Archived committees"
                    accent="berry"
                  />
                </div>

                {metrics.pendingJoinRequests > 0 ? (
                  <div
                    className="mb-[15px] flex flex-col items-start justify-between gap-3 rounded-[12px] border px-4 py-3.5 sm:flex-row sm:items-center"
                    style={{
                      backgroundColor: "#EAF4EB",
                      borderColor: "#C7DFCB",
                      color: "#42694F",
                    }}
                  >
                    <span className="text-xs">
                      <b>Needs attention:</b> {metrics.pendingJoinRequests} parent join request
                      {metrics.pendingJoinRequests === 1 ? "" : "s"} waiting for review.
                    </span>
                    <AdminButton theme={theme} variant="soft" onClick={focusJoinRequests}>
                      Review requests →
                    </AdminButton>
                  </div>
                ) : null}
              </>
            ) : null}

            {committees.length > 0 ? (
              <div className="mb-[15px] flex flex-wrap items-center gap-2">
                <CommitteeStoryFilterPill
                  active={rosterFilter === "all"}
                  label="All"
                  count={metrics.totalCount}
                  onClick={() => setRosterFilter("all")}
                  theme={theme}
                />
                <CommitteeStoryFilterPill
                  active={rosterFilter === "active"}
                  label="Active"
                  count={metrics.activeCount}
                  onClick={() => setRosterFilter("active")}
                  theme={theme}
                />
                <CommitteeStoryFilterPill
                  active={rosterFilter === "archived"}
                  label="Archived"
                  count={metrics.archivedCount}
                  onClick={() => setRosterFilter("archived")}
                  theme={theme}
                />
              </div>
            ) : null}

            <div className="mb-6">
              <CommitteeListView
                committees={filteredCommittees}
                theme={theme}
                onOpenCommittee={handleOpenCommittee}
              />
            </div>

            <div ref={joinRequestsRef}>
              <CommitteeJoinRequestsPanel
                organizationId={organizationId}
                schoolSlug={slug}
                theme={theme}
                onChanged={loadPendingRequestCount}
              />
            </div>

            {showMetrics ? (
              <AdminCard theme={theme} padding="default" className="mt-6">
                {loadingOrgActivity ? (
                  <CommitteeActivityFeedSkeleton theme={theme} rowCount={6} />
                ) : (
                  <CommitteeActivityFeed
                    theme={theme}
                    items={orgActivityItems}
                    showCommitteeName
                    title="Recent activity across committees"
                    onItemClick={handleOpenCommitteeActivity}
                  />
                )}
              </AdminCard>
            ) : null}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showCreate && (
          <CreateCommitteeModal
            theme={theme}
            templates={templates}
            onClose={() => setShowCreate(false)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>
    </>
  );
}
