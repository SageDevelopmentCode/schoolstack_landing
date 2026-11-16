"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { CommitteeActivityItem } from "@/lib/committees/activity-feed";
import type { CommitteeSectionUnreadCounts } from "@/lib/committees/committee-unread-types";
import type { Committee } from "@/lib/committees/types";
import { parseCommitteeSection } from "@/components/school-admin/committees/committee-routing";
import ParentCommitteeWorkspaceShell from "@/components/school-parent/committees/ParentCommitteeWorkspaceShell";
import { AlertCircle, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import { GKicker, GSkeleton, gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import type { CommitteesApiNamespace } from "@/components/portal-committees/PortalCommitteesPage";
import { createClient } from "@/utils/supabase/client";
import {
  reportPortalOperationalError,
  type PortalOperationalSurface,
} from "@/lib/portal-operational-errors";

type ParentCommitteeWorkspaceProps = {
  committeeId: string;
  organizationId: string;
  schoolSlug: string;
  theme: ParentThemeTokens;
  activeSection: string;
  initialCommittee?: Committee;
  initialActivityItems?: CommitteeActivityItem[];
  initialSectionUnread?: CommitteeSectionUnreadCounts;
  previewGuardianUserId?: string | null;
  previewMode?: boolean;
  apiNamespace?: CommitteesApiNamespace;
  operationalSurface?: PortalOperationalSurface;
  initialCommitteeEventId?: string | null;
  initialCommitteeEventDate?: string | null;
  initialCommitteeResourceId?: string | null;
  initialCommitteeTaskId?: string | null;
  initialCommitteeProjectId?: string | null;
  onSectionChange: (section: string) => void;
  onBack: () => void;
};

/** Garden placeholder in the workspace's own shape (rail + section pane). */
function GardenWorkspaceLoading({ theme }: { theme: ParentThemeTokens }) {
  return (
    <ParentGardenFrame theme={theme} className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-full min-h-0 flex-1 flex-col lg:flex-row">
        <div className="shrink-0 border-b-[1.5px] border-[var(--sf-ink)]/10 bg-white px-4 py-3 lg:w-[272px] lg:border-b-0 lg:border-r-[1.5px] lg:py-6 xl:w-[300px]">
          <div className="flex items-center gap-3 lg:hidden">
            <GSkeleton className="h-9 w-9 !rounded-full" />
            <GSkeleton className="h-5 flex-1 !rounded-full" />
            <GSkeleton className="h-9 w-24 !rounded-full" />
          </div>
          <div className="hidden flex-col gap-3 lg:flex">
            <GSkeleton className="h-4 w-28 !rounded-full" />
            <GSkeleton className="h-8 w-4/5 !rounded-[12px]" />
            <GSkeleton className="h-5 w-32 !rounded-full" />
            <GSkeleton className="mt-1 h-14 w-full !rounded-[12px]" />
            <div className="mt-4 flex flex-col gap-2">
              {Array.from({ length: 7 }, (_, index) => (
                <GSkeleton key={index} className="h-10 w-full !rounded-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 bg-[var(--sf-cream)] px-4 py-6 sm:px-6 md:px-9">
          <p role="status" className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--sf-soft)]">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Opening committee workspace…
          </p>
          <GSkeleton className="h-28 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <GSkeleton className="h-40" />
            <GSkeleton className="h-40" />
          </div>
        </div>
      </div>
    </ParentGardenFrame>
  );
}

export default function ParentCommitteeWorkspace({
  committeeId,
  organizationId,
  schoolSlug,
  theme,
  activeSection,
  initialCommittee,
  initialActivityItems,
  initialSectionUnread,
  previewGuardianUserId,
  previewMode = false,
  apiNamespace = "parent-portal",
  operationalSurface = "parent_portal",
  initialCommitteeEventId,
  initialCommitteeEventDate,
  initialCommitteeResourceId,
  initialCommitteeTaskId,
  initialCommitteeProjectId,
  onSectionChange,
  onBack,
}: ParentCommitteeWorkspaceProps) {
  const supabase = useMemo(() => createClient(), []);
  const [committee, setCommittee] = useState<Committee | null>(initialCommittee ?? null);
  const [currentMemberId, setCurrentMemberId] = useState<string | undefined>();
  const [loading, setLoading] = useState(!initialCommittee && !previewMode);
  const [error, setError] = useState<string | null>(null);
  const [initialRefreshDone, setInitialRefreshDone] = useState(false);
  const emptySectionRetryRef = useRef(false);

  const fetchWorkspace = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      let res: Response | undefined;
      try {
        const params = new URLSearchParams({ organizationId });
        res = await fetch(`/api/${apiNamespace}/committees/${committeeId}?${params}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error ?? "Failed to load committee.");
        }
        setCommittee(data.committee);
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : "Failed to load committee.");
          setCommittee(null);
        }
        void reportPortalOperationalError(
          operationalSurface,
          {
            organizationId,
            operation: "committees.load_workspace",
            error: "",
          },
          err,
          res?.status,
        );
      } finally {
        if (!silent) {
          setLoading(false);
        }
        queueMicrotask(() => {
          setInitialRefreshDone(true);
        });
      }
    },
    [apiNamespace, committeeId, operationalSurface, organizationId],
  );

  useEffect(() => {
    if (previewMode && initialCommittee && previewGuardianUserId) {
      const member = initialCommittee.members.find(
        (entry) =>
          entry.status === "active" && entry.userId === previewGuardianUserId,
      );
      if (member) {
        queueMicrotask(() => setCurrentMemberId(member.id));
      }
      return;
    }

    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;

      const member = (initialCommittee ?? committee)?.members.find(
        (entry) => entry.userId === user.id && entry.status === "active",
      );
      if (member) {
        setCurrentMemberId(member.id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [committee, initialCommittee, previewGuardianUserId, previewMode, supabase]);

  useEffect(() => {
    if (previewMode) {
      if (initialCommittee) {
        queueMicrotask(() => {
          setCommittee(initialCommittee);
          setLoading(false);
        });
      } else {
        queueMicrotask(() => {
          setError("Committee workspace preview is unavailable for this selection.");
          setLoading(false);
        });
      }
      return;
    }

    if (initialCommittee) {
      queueMicrotask(() => {
        setCommittee(initialCommittee);
        setLoading(false);
      });
    }
  }, [initialCommittee, previewMode]);

  useEffect(() => {
    if (previewMode) return;

    emptySectionRetryRef.current = false;

    let cancelled = false;
    if (initialCommittee) {
      queueMicrotask(() => {
        if (!cancelled) {
          setInitialRefreshDone(true);
        }
      });
    } else {
      queueMicrotask(() => {
        if (!cancelled) {
          setInitialRefreshDone(false);
          void fetchWorkspace();
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [committeeId, fetchWorkspace, initialCommittee, previewMode]);

  useEffect(() => {
    if (previewMode) return undefined;

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchWorkspace({ silent: true });
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchWorkspace, previewMode]);

  useEffect(() => {
    if (previewMode || !initialRefreshDone || !committee) return;
    const section = parseCommitteeSection(activeSection);
    if (section !== "resources" && section !== "tasks" && section !== "messages") {
      return;
    }
    const isEmpty =
      section === "resources"
        ? committee.resources.length === 0
        : section === "tasks"
          ? committee.tasks.length === 0
          : committee.messages.length === 0;
    if (!isEmpty || emptySectionRetryRef.current) return;
    emptySectionRetryRef.current = true;
    void fetchWorkspace({ silent: true });
  }, [
    activeSection,
    committee,
    fetchWorkspace,
    initialRefreshDone,
    previewMode,
  ]);

  if (loading) {
    return <GardenWorkspaceLoading theme={theme} />;
  }

  if (error || !committee) {
    return (
      <ParentGardenFrame theme={theme} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className={PORTAL_HOME_CONTAINER_CLASS}>
          <div
            role="alert"
            data-testid="parent-committee-workspace-error"
            className="mx-auto flex w-full max-w-[560px] flex-col items-start gap-4 rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-6 shadow-[0_3px_0_0_rgba(43,36,29,0.08)]"
          >
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--sf-peach)] ring-2 ring-[var(--sf-ink)]"
            >
              <AlertCircle className="h-5 w-5 text-[var(--sf-clay-deep)]" />
            </span>
            <div>
              <GKicker>Committee workspace</GKicker>
              <h1 className="sf-display m-0 mt-1 text-[1.6rem] leading-[1.05] text-[var(--sf-ink)]">
                We couldn&apos;t open this committee
              </h1>
              <p className="m-0 mt-2 text-[15px] font-semibold text-[var(--sf-ink)]/75">
                {error ?? "Committee not found."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!previewMode ? (
                <button type="button" onClick={() => void fetchWorkspace()} className={gBtnPopSm}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try again
                </button>
              ) : null}
              <button type="button" onClick={onBack} className={gBtnOutlineSm}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to my committees
              </button>
            </div>
          </div>
        </div>
      </ParentGardenFrame>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ParentCommitteeWorkspaceShell
        committee={committee}
        theme={theme}
        supabase={supabase}
        organizationId={organizationId}
        schoolSlug={schoolSlug}
        activeSection={parseCommitteeSection(activeSection)}
        onSectionChange={onSectionChange}
        onBack={onBack}
        onCommitteeChange={setCommittee}
        currentMemberId={currentMemberId}
        previewMode={previewMode}
        initialActivityItems={initialActivityItems}
        initialSectionUnread={initialSectionUnread}
      portalApiNamespace={apiNamespace}
      backLabel="My committees"
      initialCommitteeEventId={initialCommitteeEventId}
      initialCommitteeEventDate={initialCommitteeEventDate}
      initialCommitteeResourceId={initialCommitteeResourceId}
      initialCommitteeTaskId={initialCommitteeTaskId}
      initialCommitteeProjectId={initialCommitteeProjectId}
      workspaceDataReady={initialRefreshDone}
    />
    </div>
  );
}
