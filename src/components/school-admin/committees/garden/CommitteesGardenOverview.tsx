"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Archive, ChevronRight, Plus, UserPlus, Users } from "lucide-react";
import { gFade } from "@/components/school-parent/garden/motion";
import { GCard, GChip, gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import {
  AdminGardenPageHeader,
  GardenEmptyState,
  GardenFilterChips,
  GardenLoadError,
  GardenStatTiles,
  ROW_INTERACTIVE,
} from "@/components/school-admin/garden/kit";
import { GardenLeadStrip } from "@/components/school-admin/garden/blocks";
import type { CommitteeActivityItem } from "@/lib/committees/activity-feed";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { CommitteeRosterFilter } from "@/lib/school-admin/admin-committee-roster-metrics";
import CommitteeActivityFeed from "../CommitteeActivityFeed";
import CommitteeActivityFeedSkeleton from "../CommitteeActivityFeedSkeleton";
import CommitteeJoinRequestsPanel from "../CommitteeJoinRequestsPanel";
import type { CommitteesModel } from "../useCommitteesModel";

function plural(count: number, noun: string, pluralNoun = `${noun}s`): string {
  return `${count} ${count === 1 ? noun : pluralNoun}`;
}

/**
 * Admin Committees list in Garden: data-built status line, a "people want to
 * join" lead strip, filtering stat tiles, committee rows (main) and join
 * requests + recent activity (rail). Everything comes from `useCommitteesModel`.
 */
export default function CommitteesGardenOverview({
  model,
  theme,
  organizationId,
  slug,
  onCreate,
}: {
  model: CommitteesModel;
  theme: ParentThemeTokens;
  organizationId: string;
  slug: string;
  onCreate: () => void;
}) {
  const reduce = useReducedMotion() === true;
  const joinRequestsRef = useRef<HTMLDivElement>(null);
  const { metrics, rosterFilter, setRosterFilter } = model;
  const hasCommittees = model.committees.length > 0;

  const focusJoinRequests = () => {
    const el = joinRequestsRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => el.focus({ preventScroll: true }), reduce ? 0 : 350);
  };

  const subtitle = !hasCommittees
    ? "Give volunteers a shared workspace for tasks, events, resources and messages."
    : [
        plural(metrics.activeCount, "active committee"),
        plural(metrics.totalVolunteers, "volunteer"),
        metrics.pendingJoinRequests > 0
          ? `${plural(metrics.pendingJoinRequests, "join request")} waiting`
          : null,
      ]
        .filter(Boolean)
        .join(" · ");

  const filterTo = (filter: CommitteeRosterFilter) => setRosterFilter(rosterFilter === filter ? "all" : filter);

  return (
    <>
      <AdminGardenPageHeader
        kicker="Communication"
        title={<span className="text-[var(--sf-clay)]">Committees</span>}
        subtitle={subtitle}
        actions={
          hasCommittees ? (
            <button
              type="button"
              className={metrics.pendingJoinRequests > 0 ? gBtnOutlineSm : gBtnPopSm}
              onClick={onCreate}
              data-testid="committees-new"
            >
              <Plus className="h-4 w-4" aria-hidden />
              New committee
            </button>
          ) : null
        }
      />

      {metrics.pendingJoinRequests > 0 ? (
        <GardenLeadStrip
          icon={UserPlus}
          title={`${plural(metrics.pendingJoinRequests, "person wants", "people want")} to join a committee`}
          meta="Choose their access level and duty role, then approve or decline."
          cta="Review requests"
          onClick={focusJoinRequests}
          data-testid="committees-review-requests"
        />
      ) : null}

      {hasCommittees ? (
        <GardenStatTiles
          layout="strip"
          ariaLabel="Committee numbers"
          stats={[
            {
              id: "active",
              label: "Active committees",
              value: metrics.activeCount,
              accent: "forest",
              active: rosterFilter === "active",
              onClick: () => filterTo("active"),
            },
            {
              id: "volunteers",
              label: "Total volunteers",
              value: metrics.totalVolunteers,
              accent: "sky",
              active: false,
              onClick: () => setRosterFilter("all"),
            },
            {
              id: "requests",
              label: "Pending join requests",
              value: metrics.pendingJoinRequests,
              accent: "gold",
              onClick: focusJoinRequests,
            },
            {
              id: "archived",
              label: "Archived committees",
              value: metrics.archivedCount,
              accent: "berry",
              active: rosterFilter === "archived",
              onClick: () => filterTo("archived"),
            },
          ]}
        />
      ) : null}

      <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
        <GCard
          index={2}
          kicker="Volunteer workspaces"
          title="Your committees"
          data-testid="committees-list"
        >
          {model.listError ? (
            <GardenLoadError
              title="Couldn't load committees."
              description={`${model.listError} Nothing was changed.`}
              onRetry={model.retryList}
            />
          ) : !hasCommittees ? (
            <GardenEmptyState
              icon={Users}
              title="No committees yet"
              description="Create a committee workspace from a template to get started."
              action={
                <button type="button" className={gBtnPopSm} onClick={onCreate} data-testid="committees-new-first">
                  <Plus className="h-4 w-4" aria-hidden />
                  New committee
                </button>
              }
            />
          ) : (
            <>
              <GardenFilterChips
                ariaLabel="Filter committees"
                value={rosterFilter}
                onChange={(key) => setRosterFilter(key as CommitteeRosterFilter)}
                options={[
                  { key: "all", label: "All", count: metrics.totalCount },
                  ...(metrics.activeCount ? [{ key: "active", label: "Active", count: metrics.activeCount }] : []),
                  ...(metrics.archivedCount
                    ? [{ key: "archived", label: "Archived", count: metrics.archivedCount }]
                    : []),
                ]}
                className="mb-3"
              />
              {model.filteredCommittees.length === 0 ? (
                <div className="sf-paper rounded-2xl px-4 py-5 text-center">
                  <p className="m-0 text-[14px] font-extrabold text-[var(--sf-ink)]">
                    No committees match this filter.
                  </p>
                  <button type="button" className={`${gLinkSm} mt-1.5`} onClick={() => setRosterFilter("all")}>
                    Show all committees
                  </button>
                </div>
              ) : (
                <ul className="m-0 -mx-1 flex list-none flex-col gap-0.5 p-0">
                  {model.filteredCommittees.map((committee, i) => {
                    const archived = committee.status === "archived";
                    const flash = model.lastChangedId === committee.id;
                    return (
                      <motion.li key={committee.id} {...gFade(2 + i * 0.15, reduce)}>
                        <button
                          type="button"
                          onClick={() => model.openCommittee(committee.id)}
                          className={`${ROW_INTERACTIVE} ${flash ? "bg-[var(--sf-mint)]" : ""}`}
                          aria-label={`${committee.name}, ${committee.status}, ${plural(committee.memberCount, "member")}. Open workspace`}
                          data-testid={`committee-row-${committee.id}`}
                        >
                          <span
                            aria-hidden
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-2 ring-[var(--sf-ink)] ${
                              archived ? "bg-[var(--sf-ink)]/[0.06]" : "bg-[var(--sf-mint)]"
                            }`}
                          >
                            {archived ? (
                              <Archive className="h-4 w-4 text-[var(--sf-ink)]/60" />
                            ) : (
                              <Users className="h-4 w-4 text-[var(--sf-forest)]" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="truncate text-[15px] font-extrabold text-[var(--sf-ink)]">
                                {committee.name}
                              </span>
                              <GChip tone={archived ? "neutral" : committee.status === "active" ? "success" : "warning"}>
                                {committee.status === "active" ? "Active" : archived ? "Archived" : committee.status}
                              </GChip>
                            </span>
                            <span className="mt-0.5 block truncate text-[13px] font-semibold text-[var(--sf-soft)]">
                              <span className="tabular-nums">{plural(committee.memberCount, "member")}</span>
                              {committee.termLabel ? ` · ${committee.termLabel}` : ""}
                              {committee.description ? ` · ${committee.description}` : ""}
                            </span>
                          </span>
                          <ChevronRight
                            className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--sf-ink)]/70"
                            aria-hidden
                          />
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </GCard>

        <div className="flex min-w-0 flex-col gap-5">
          <div
            ref={joinRequestsRef}
            tabIndex={-1}
            className="scroll-mt-6 rounded-[24px] outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
          >
            <CommitteeJoinRequestsPanel
              organizationId={organizationId}
              schoolSlug={slug}
              onChanged={() => {
                void model.loadPendingRequestCount();
                model.refreshListQuietly();
              }}
            />
          </div>

          {hasCommittees ? (
            <GCard index={3} kicker="Across committees" title="Recent activity">
              {model.loadingOrgActivity ? (
                <CommitteeActivityFeedSkeleton theme={theme} rowCount={5} />
              ) : model.orgActivityError ? (
                <GardenLoadError
                  title="Couldn't load recent activity."
                  description={model.orgActivityError}
                  onRetry={model.retryOrgActivity}
                />
              ) : (
                <CommitteeActivityFeed
                  theme={theme}
                  items={model.orgActivityItems}
                  showCommitteeName
                  title=""
                  onItemClick={(item: CommitteeActivityItem) => {
                    if (item.committeeId) model.openCommittee(item.committeeId, "activity");
                  }}
                />
              )}
            </GCard>
          ) : null}
        </div>
      </div>
    </>
  );
}
