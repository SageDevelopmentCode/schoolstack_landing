"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  archiveCommittee,
  createCommitteeFromTemplate,
  getCommittee,
  listCommittees,
  listCommitteeTemplates,
} from "@/lib/committees/committees";
import type { Committee, CommitteeListItem, CommitteeTemplate } from "@/lib/committees/types";
import type { CommitteeActivityItem } from "@/lib/committees/activity-feed";
import { createClient } from "@/utils/supabase/client";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { formatActionError } from "@/lib/school-admin/admin-toast";
import {
  deriveCommitteeRosterMetrics,
  filterCommitteesByRosterFilter,
  type CommitteeRosterFilter,
} from "@/lib/school-admin/admin-committee-roster-metrics";
import { parseCommitteeSection } from "./committee-routing";

export type CreateCommitteeInput = {
  templateId: string | null;
  platformSlug: string;
  name: string;
  description: string;
  termLabel: string;
};

/**
 * State + data for the admin Committees tab (list, templates, the open
 * committee, join-request count, org activity, create/archive, URL state).
 * The Garden view only renders this; nothing here knows about markup.
 * Skill: admin-portal-garden-design §5.
 */
export function useCommitteesModel({
  organizationId,
  slug,
}: {
  organizationId: string;
  slug: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const committeeId = searchParams.get("committee");
  const activeSection = parseCommitteeSection(searchParams.get("section"));
  const initialProjectId = searchParams.get("project");

  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [listNonce, setListNonce] = useState(0);
  const [committees, setCommittees] = useState<CommitteeListItem[]>([]);
  const [templates, setTemplates] = useState<CommitteeTemplate[]>([]);

  const [activeCommittee, setActiveCommittee] = useState<Committee | null>(null);
  const [loadingCommittee, setLoadingCommittee] = useState(false);
  const [committeeError, setCommitteeError] = useState<string | null>(null);
  const [committeeNonce, setCommitteeNonce] = useState(0);

  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [orgActivityItems, setOrgActivityItems] = useState<CommitteeActivityItem[]>([]);
  const [loadingOrgActivity, setLoadingOrgActivity] = useState(false);
  const [orgActivityError, setOrgActivityError] = useState<string | null>(null);
  const [orgActivityNonce, setOrgActivityNonce] = useState(0);
  const [rosterFilter, setRosterFilter] = useState<CommitteeRosterFilter>("all");
  /** Mint flash on the committee row that was just created/changed. */
  const [lastChangedId, setLastChangedId] = useState<string | null>(null);

  const report = useCallback(
    (operation: string, err: unknown) => {
      void reportPortalOperationalError("school_admin", { organizationId, operation, error: "" }, err);
    },
    [organizationId],
  );

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
    queueMicrotask(() => {
      void (async () => {
        setLoading(true);
        setListError(null);
        try {
          await loadList();
        } catch (e) {
          report("committees.load", e);
          if (!cancelled) setListError(formatActionError(e, "Failed to load committees"));
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    });
    return () => {
      cancelled = true;
    };
  }, [loadList, listNonce, report]);

  const loadPendingRequestCount = useCallback(async () => {
    try {
      const params = new URLSearchParams({ organizationId, status: "pending" });
      const res = await fetch(`/api/school-admin/committees/join-requests?${params}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;
      setPendingRequestCount((data.requests ?? []).length);
    } catch (err) {
      report("committees.join_requests.count", err);
      setPendingRequestCount(0);
    }
  }, [organizationId, report]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadPendingRequestCount();
    });
  }, [loadPendingRequestCount]);

  useEffect(() => {
    if (committeeId) return;
    let cancelled = false;
    queueMicrotask(() => {
      void (async () => {
        setLoadingOrgActivity(true);
        setOrgActivityError(null);
        try {
          const params = new URLSearchParams({ organizationId, slug, limit: "12" });
          const res = await fetch(`/api/school-admin/committees/activity?${params}`);
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error ?? "Failed to load activity.");
          if (!cancelled) setOrgActivityItems(data.items ?? []);
        } catch (err) {
          report("committees.activity.org_load", err);
          if (!cancelled) {
            setOrgActivityItems([]);
            setOrgActivityError(formatActionError(err, "Failed to load activity."));
          }
        } finally {
          if (!cancelled) setLoadingOrgActivity(false);
        }
      })();
    });
    return () => {
      cancelled = true;
    };
  }, [committeeId, organizationId, orgActivityNonce, report, slug]);

  // Newest request wins when the admin hops between committees quickly.
  const committeeRequestRef = useRef(0);
  useEffect(() => {
    if (!committeeId) return;
    const requestId = ++committeeRequestRef.current;
    queueMicrotask(() => {
      void (async () => {
        setLoadingCommittee(true);
        setCommitteeError(null);
        try {
          const committee = await getCommittee(supabase, organizationId, committeeId);
          if (requestId !== committeeRequestRef.current) return;
          if (!committee) throw new Error("This committee couldn't be found.");
          setActiveCommittee(committee);
        } catch (e) {
          report("committees.load_detail", e);
          if (requestId === committeeRequestRef.current) {
            setCommitteeError(formatActionError(e, "Failed to load committee"));
          }
        } finally {
          if (requestId === committeeRequestRef.current) setLoadingCommittee(false);
        }
      })();
    });
  }, [committeeId, committeeNonce, organizationId, report, supabase]);

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
      // `project` is a one-time deep link; don't carry it across navigation.
      params.delete("project");
      if (nextCommitteeId) {
        params.set("committee", nextCommitteeId);
        if (section) params.set("section", section);
        else if (!params.get("section")) params.set("section", "home");
      } else {
        params.delete("committee");
        params.delete("section");
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openCommittee = useCallback((id: string, section = "home") => setUrl(id, section), [setUrl]);
  const back = useCallback(() => {
    if (committeeId) setLastChangedId(committeeId);
    setUrl(null);
  }, [committeeId, setUrl]);
  const changeSection = useCallback(
    (section: string) => {
      if (committeeId) setUrl(committeeId, section);
    },
    [committeeId, setUrl],
  );

  /** Throws on failure (the caller shows the error toast with Retry). */
  const createCommittee = useCallback(
    async (input: CreateCommitteeInput) => {
      try {
        const created = await createCommitteeFromTemplate(supabase, organizationId, {
          ...input,
          status: "active",
        });
        await loadList().catch((err) => report("committees.load", err));
        setActiveCommittee(created);
        setLastChangedId(created.id);
        setUrl(created.id, "members");
        return created;
      } catch (err) {
        report("committees.create", err);
        throw err;
      }
    },
    [loadList, organizationId, report, setUrl, supabase],
  );

  /** Throws on failure (the caller shows the error toast with Retry). */
  const archiveActiveCommittee = useCallback(async () => {
    if (!activeCommittee) return null;
    try {
      const updated = await archiveCommittee(supabase, organizationId, activeCommittee.id);
      setActiveCommittee(updated);
      setLastChangedId(updated.id);
      await loadList().catch((err) => report("committees.load", err));
      return updated;
    } catch (err) {
      report("committees.archive", err);
      throw err;
    }
  }, [activeCommittee, loadList, organizationId, report, supabase]);

  useEffect(() => {
    if (!lastChangedId) return undefined;
    const timer = window.setTimeout(() => setLastChangedId(null), 1600);
    return () => window.clearTimeout(timer);
  }, [lastChangedId]);

  return {
    supabase,
    committeeId,
    activeSection,
    initialProjectId,

    loading,
    listError,
    retryList: () => setListNonce((n) => n + 1),
    /** Quiet refresh (member counts after a join request): no skeleton, errors only reported. */
    refreshListQuietly: () => {
      void loadList().catch((err) => report("committees.load", err));
    },
    committees,
    filteredCommittees,
    templates,
    metrics,
    rosterFilter,
    setRosterFilter,
    lastChangedId,

    displayedCommittee,
    loadingCommittee,
    committeeError,
    retryCommittee: () => setCommitteeNonce((n) => n + 1),
    setActiveCommittee,

    pendingRequestCount,
    loadPendingRequestCount,

    orgActivityItems,
    loadingOrgActivity,
    orgActivityError,
    retryOrgActivity: () => setOrgActivityNonce((n) => n + 1),

    openCommittee,
    back,
    changeSection,
    createCommittee,
    archiveActiveCommittee,
  };
}

export type CommitteesModel = ReturnType<typeof useCommitteesModel>;
