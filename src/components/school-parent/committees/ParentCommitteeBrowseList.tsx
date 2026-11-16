"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass, UserRound } from "lucide-react";
import { gFade } from "@/components/school-parent/garden/motion";
import { GCard, GChip, GIcon, G_FOCUS, SPRINGY } from "@/components/school-parent/garden/ui";
import {
  RequestStatusChip,
  exploreCallToAction,
  plural,
} from "@/components/school-parent/committees/garden/committee-garden-shared";
import type { ParentCommitteeBrowseItem } from "@/lib/committees/types";

/*
 * "Explore" (Garden): open committees as calm tiles. Each tile is one button
 * and says what clicking it does (open the workspace, view the request, or
 * request to join), so families always know the next step.
 */
export default function ParentCommitteeBrowseList({
  committees,
  onOpenCommittee,
}: {
  committees: ParentCommitteeBrowseItem[];
  onOpenCommittee: (id: string) => void;
}) {
  const reduce = useReducedMotion() === true;

  if (committees.length === 0) {
    return (
      <GCard index={1} kicker="Explore" title="No committees available" data-testid="parent-committees-explore-empty">
        <div className="flex items-start gap-4">
          <GIcon size="lg">
            <Compass />
          </GIcon>
          <p className="m-0 text-[15px] font-semibold leading-relaxed text-[var(--sf-ink)]/80">
            When the school opens volunteer committees, they will appear here for you to explore.
          </p>
        </div>
      </GCard>
    );
  }

  const memberCount = committees.filter((c) => c.isMember).length;
  const pendingCount = committees.filter((c) => !c.isMember && c.requestStatus === "pending").length;

  return (
    <GCard
      index={1}
      kicker="Open for volunteers"
      title="Find a way to help"
      action={
        memberCount > 0 || pendingCount > 0 ? (
          <span className="flex flex-wrap gap-1.5">
            {memberCount > 0 ? <GChip tone="success">{memberCount} joined</GChip> : null}
            {pendingCount > 0 ? <GChip tone="warning">{pendingCount} pending</GChip> : null}
          </span>
        ) : null
      }
      data-testid="parent-committees-explore-list"
    >
      <p className="m-0 mb-4 text-[14px] font-semibold text-[var(--sf-soft)]">
        Open a committee to read about its roles, then send a request to join.
      </p>
      <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2" aria-label="Committees open for volunteers">
        {committees.map((committee, index) => {
          const cta = exploreCallToAction(committee);
          return (
            <motion.li key={committee.id} className="h-full" {...gFade(index + 2, reduce)}>
              <button
                type="button"
                onClick={() => onOpenCommittee(committee.id)}
                data-testid={`parent-committee-explore-card-${committee.id}`}
                aria-label={`${committee.name}: ${cta}`}
                className={`group flex h-full w-full flex-col rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-4 text-left hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/30 hover:bg-white hover:shadow-[0_12px_22px_-16px_rgba(43,36,29,0.55)] ${SPRINGY} ${G_FOCUS}`}
              >
                <span className="sf-display block line-clamp-2 text-[1.15rem] leading-[1.1] text-[var(--sf-ink)]">
                  {committee.name}
                </span>
                <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <GChip tone="info">{committee.termLabel}</GChip>
                  {committee.isMember ? <GChip tone="success">Member</GChip> : null}
                  {committee.requestStatus && !committee.isMember ? (
                    <RequestStatusChip status={committee.requestStatus} />
                  ) : null}
                </span>
                {committee.description ? (
                  <span className="mt-3 block line-clamp-3 text-[13.5px] font-semibold leading-relaxed text-[var(--sf-soft)]">
                    {committee.description}
                  </span>
                ) : null}
                {committee.dutyRoles.length > 0 ? (
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--sf-ink)]/70">
                    <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                    {plural(committee.dutyRoles.length, "role")}
                  </span>
                ) : null}
                <span className="mt-auto block pt-3">
                  <span className="flex items-center justify-between border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-3 text-[13.5px] font-extrabold text-[var(--sf-clay-deep)]">
                    {cta}
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </GCard>
  );
}
