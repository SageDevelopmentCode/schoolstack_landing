"use client";

import { ChevronRight, Compass, Users } from "lucide-react";
import { GCard, GIcon, GStatTile, G_FOCUS, SPRINGY } from "@/components/school-parent/garden/ui";
import GardenCommitteeSteps from "./GardenCommitteeSteps";
import type { ParentCommitteesTab } from "./committee-garden-shared";

/**
 * Committees rail (both tabs): at-a-glance numbers, the joining journey with
 * the family's current step highlighted, and a note-row launcher to the other
 * tab. Every number comes from data the page already loaded.
 */
export default function GardenCommitteesRail({
  tab,
  myCount,
  unreadTotal,
  openTaskTotal,
  journeyStep,
  pendingCount,
  onSelectTab,
}: {
  tab: ParentCommitteesTab;
  myCount: number;
  unreadTotal: number;
  openTaskTotal: number;
  /** Current step of the joining journey (see GardenCommitteeSteps). */
  journeyStep: number;
  /** Pending join requests (only known once Explore has loaded). */
  pendingCount: number;
  onSelectTab: (tab: ParentCommitteesTab) => void;
}) {
  const otherTab: ParentCommitteesTab = tab === "mine" ? "explore" : "mine";

  return (
    <div className="flex flex-col gap-5">
      <GCard index={2} kicker="At a glance" className="overflow-hidden" bodyClassName="-mx-5 -mb-5 sm:-mx-6 sm:-mb-6">
        <div className="grid grid-cols-3 divide-x-[1.5px] divide-[var(--sf-ink)]/10 border-t-[1.5px] border-[var(--sf-ink)]/10">
          <GStatTile
            value={myCount}
            label={myCount === 1 ? "Committee" : "Committees"}
            onClick={tab === "mine" ? undefined : () => onSelectTab("mine")}
          />
          <GStatTile value={unreadTotal} label="Unread updates" accent={unreadTotal > 0} />
          <GStatTile value={openTaskTotal} label={openTaskTotal === 1 ? "Open task" : "Open tasks"} />
        </div>
      </GCard>

      <GCard
        index={3}
        kicker="Your path"
        title="How committees work"
        data-testid="parent-committees-how-it-works"
      >
        {pendingCount > 0 ? (
          <p className="m-0 mb-3 text-[13.5px] font-semibold text-[var(--sf-ink)]/75">
            You have {pendingCount === 1 ? "a request" : `${pendingCount} requests`} waiting for
            school review.
          </p>
        ) : null}
        <GardenCommitteeSteps current={journeyStep} compact />
      </GCard>

      <button
        type="button"
        onClick={() => onSelectTab(otherTab)}
        className={`group flex w-full items-center gap-3 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/12 ${
          otherTab === "explore" ? "bg-[var(--sf-butter)]" : "bg-[var(--sf-sky)]"
        } p-4 text-left shadow-[0_10px_20px_-16px_rgba(43,36,29,0.55)] hover:-translate-y-0.5 ${SPRINGY} ${G_FOCUS}`}
      >
        <GIcon size="sm">{otherTab === "explore" ? <Compass /> : <Users />}</GIcon>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-extrabold text-[var(--sf-ink)]">
            {otherTab === "explore" ? "Explore open committees" : "Back to my committees"}
          </span>
          <span className="block text-[13px] font-semibold text-[var(--sf-ink)]/70">
            {otherTab === "explore"
              ? "Find a way to help and request to join."
              : "Open a workspace to see tasks, files and messages."}
          </span>
        </span>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/60 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
