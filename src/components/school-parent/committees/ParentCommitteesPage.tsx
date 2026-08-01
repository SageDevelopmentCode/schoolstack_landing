"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CalendarDays, CheckSquare, Heart, Loader2 } from "lucide-react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type {
  ParentCommitteeBrowseItem,
  ParentCommitteeListItem,
} from "@/lib/committees/types";
import ParentCommitteeBrowseList from "./ParentCommitteeBrowseList";
import ParentCommitteeDetail from "./ParentCommitteeDetail";
import ParentCommitteeWorkspace from "./ParentCommitteeWorkspace";

type ParentCommitteesPageProps = {
  organizationId: string;
  schoolSlug: string;
  schoolName: string;
  branding: OrganizationBranding;
  guardianName: string;
};

type Tab = "explore" | "mine";

export default function ParentCommitteesPage(props: ParentCommitteesPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(props.branding), [props.branding]);

  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center gap-2 py-12 text-sm"
          style={{ color: C.textSecondary }}
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading committees…
        </div>
      }
    >
      <ParentCommitteesPageContent {...props} />
    </Suspense>
  );
}

function ParentCommitteesPageContent({
  organizationId,
  schoolSlug,
  schoolName,
  branding,
  guardianName,
}: ParentCommitteesPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = (searchParams.get("tab") === "mine" ? "mine" : "explore") as Tab;
  const exploreCommitteeId = searchParams.get("explore");
  const workspaceCommitteeId = searchParams.get("committee");
  const activeSection = searchParams.get("section") ?? "home";

  const [browseCommittees, setBrowseCommittees] = useState<ParentCommitteeBrowseItem[]>([]);
  const [myCommittees, setMyCommittees] = useState<ParentCommitteeListItem[]>([]);
  const [loadingBrowse, setLoadingBrowse] = useState(true);
  const [loadingMine, setLoadingMine] = useState(true);
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
    }
  }, [organizationId]);

  useEffect(() => {
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
  }, [organizationId]);

  const selectedBrowseCommittee = exploreCommitteeId
    ? browseCommittees.find((c) => c.id === exploreCommitteeId) ?? null
    : null;

  if (workspaceCommitteeId) {
    return (
      <ParentCommitteeWorkspace
        committeeId={workspaceCommitteeId}
        organizationId={organizationId}
        C={C}
        activeSection={activeSection}
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
        C={C}
        organizationId={organizationId}
        schoolSlug={schoolSlug}
        schoolName={schoolName}
        guardianName={guardianName}
        onBack={() => setUrl({ explore: null })}
        onRequestSubmitted={() => {
          void reloadLists();
        }}
      />
    );
  }

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-lg font-heading font-semibold" style={{ color: C.textPrimary }}>
          Committees
        </h2>
        <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
          Explore volunteer committees and access your approved workspaces.
        </p>
      </div>

      <div
        className="inline-flex rounded-xl border p-1 gap-1"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        {(["explore", "mine"] as const).map((key) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setUrl({ tab: key, explore: null, committee: null, section: null })}
              className="px-4 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-colors"
              style={{
                backgroundColor: active ? C.accentLight : "transparent",
                color: active ? C.accent : C.textSecondary,
                fontWeight: active ? 600 : 500,
              }}
            >
              {key === "explore" ? "Explore" : "My committees"}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-sm" style={{ color: C.error }}>
          {error}
        </p>
      )}

      {tab === "explore" && (
        <>
          {loadingBrowse ? (
            <div
              className="flex items-center justify-center gap-2 py-12 text-sm"
              style={{ color: C.textSecondary }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading committees…
            </div>
          ) : (
            <ParentCommitteeBrowseList
              committees={browseCommittees}
              C={C}
              onOpenCommittee={(id) => setUrl({ explore: id, tab: "explore" })}
            />
          )}
        </>
      )}

      {tab === "mine" && (
        <>
          {loadingMine ? (
            <div
              className="flex items-center justify-center gap-2 py-12 text-sm"
              style={{ color: C.textSecondary }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading your committees…
            </div>
          ) : myCommittees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: C.accentLight }}
              >
                <Heart className="w-7 h-7" style={{ color: C.accent }} />
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: C.textPrimary }}>
                No committees yet
              </h3>
              <p className="text-sm text-center max-w-xs" style={{ color: C.textSecondary }}>
                After the school approves your join request, your committee workspace will appear
                here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myCommittees.map((committee) => (
                <button
                  key={committee.id}
                  type="button"
                  onClick={() =>
                    setUrl({
                      committee: committee.id,
                      section: "home",
                      tab: "mine",
                      explore: null,
                    })
                  }
                  className="w-full text-left p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-sm group"
                  style={{ backgroundColor: C.surface, borderColor: C.border }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold" style={{ color: C.textPrimary }}>
                          {committee.name}
                        </h3>
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: C.accentLight, color: C.accent }}
                        >
                          {committee.termLabel}
                        </span>
                      </div>
                      <p className="text-sm mt-1 line-clamp-2" style={{ color: C.textSecondary }}>
                        {committee.description}
                      </p>
                      <div
                        className="flex items-center gap-4 mt-3 text-xs"
                        style={{ color: C.textTertiary }}
                      >
                        {committee.openTaskCount > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5" />
                            {committee.openTaskCount} open task
                            {committee.openTaskCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        {committee.nextEventTitle && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5" />
                            Next: {committee.nextEventTitle}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight
                      className="w-5 h-5 shrink-0 mt-1 transition-colors"
                      style={{ color: C.textTertiary }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
