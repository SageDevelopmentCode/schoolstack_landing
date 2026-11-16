"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bell, CalendarDays, CheckSquare, Compass, HeartHandshake } from "lucide-react";
import { formatMessagesUnreadBadge } from "@/components/messages/MessagesNavBadge";
import { gFade } from "@/components/school-parent/garden/motion";
import {
  GCard,
  GChip,
  GIcon,
  G_FOCUS,
  NOTE_TINTS,
  SPRINGY,
  gBtnOnAccent,
  gBtnPopSm,
} from "@/components/school-parent/garden/ui";
import GardenCommitteeSteps from "@/components/school-parent/committees/garden/GardenCommitteeSteps";
import { plural } from "@/components/school-parent/committees/garden/committee-garden-shared";
import type { ParentCommitteeListItem } from "@/lib/committees/types";

/*
 * "My committees" (Garden). Recipes: "Start here" accent strip for the
 * committee with unread updates, then person-style mini-cards (one button
 * each). Empty state teaches the joining journey with one toy button.
 */

function unreadLine(count: number, sectionLabels?: string[]): string {
  const base = plural(count, "unread update");
  return sectionLabels && sectionLabels.length > 0 ? `${base} · ${sectionLabels.join(" · ")}` : base;
}

export default function ParentCommitteeMineList({
  committees,
  unreadByCommitteeId = {},
  unreadSectionLabelsByCommitteeId = {},
  onOpenCommittee,
  onExplore,
}: {
  committees: ParentCommitteeListItem[];
  unreadByCommitteeId?: Record<string, number>;
  unreadSectionLabelsByCommitteeId?: Record<string, string[]>;
  onOpenCommittee: (id: string) => void;
  onExplore: () => void;
}) {
  const reduce = useReducedMotion() === true;

  if (committees.length === 0) {
    return (
      <GCard index={1} kicker="My committees" title="No committees yet" data-testid="parent-committees-mine-empty">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <GIcon size="lg">
            <HeartHandshake />
          </GIcon>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[15px] font-semibold leading-relaxed text-[var(--sf-ink)]/80">
              After the school approves your join request, your committee workspace will appear here.
            </p>
            <span aria-hidden="true" className="sf-hand mt-1 block text-xl text-[var(--sf-clay-deep)]">
              many hands, light work ✿
            </span>
          </div>
        </div>
        <div className="mt-5">
          <GardenCommitteeSteps current={0} />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-4">
          <button type="button" onClick={onExplore} className={gBtnPopSm} data-testid="parent-committees-empty-explore">
            <Compass className="h-4 w-4" aria-hidden="true" />
            Explore committees
          </button>
          <span className="text-[13px] font-semibold text-[var(--sf-soft)]">
            It only takes a minute to send a request.
          </span>
        </div>
      </GCard>
    );
  }

  const withUnread = committees.filter((c) => (unreadByCommitteeId[c.id] ?? 0) > 0);
  const lead = withUnread[0] ?? null;
  const leadUnread = lead ? unreadByCommitteeId[lead.id] ?? 0 : 0;

  return (
    <GCard
      index={1}
      kicker="My committees"
      title={
        withUnread.length > 0
          ? `${plural(withUnread.length, "committee")} with new updates`
          : "Pick a workspace to open"
      }
      data-testid="parent-committees-mine-list"
    >
      {lead ? (
        <div className="mb-5">
          <button
            type="button"
            onClick={() => onOpenCommittee(lead.id)}
            aria-label={`Open ${lead.name}: ${unreadLine(leadUnread, unreadSectionLabelsByCommitteeId[lead.id])}`}
            className={`group flex w-full flex-col gap-4 rounded-[16px] bg-[var(--sf-clay)] p-5 text-left text-white sm:flex-row sm:items-center ${G_FOCUS}`}
          >
            <GIcon size="sm" className="!ring-white/70">
              <Bell />
            </GIcon>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-extrabold leading-snug">{lead.name}</span>
              <span className="mt-0.5 block text-sm text-white/85">
                {unreadLine(leadUnread, unreadSectionLabelsByCommitteeId[lead.id])}
              </span>
            </span>
            <span className={gBtnOnAccent} aria-hidden="true">
              Open <ArrowRight className="h-4 w-4" />
            </span>
          </button>
          {withUnread.length > 1 ? (
            <p className="m-0 mt-2.5 text-[13px] font-semibold text-[var(--sf-soft)]">
              +{plural(withUnread.length - 1, "more committee")} with updates below
            </p>
          ) : null}
        </div>
      ) : null}

      <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2" aria-label="Your committee workspaces">
        {committees.map((committee, index) => {
          const unreadCount = unreadByCommitteeId[committee.id] ?? 0;
          const sectionLabels = unreadSectionLabelsByCommitteeId[committee.id];
          return (
            <motion.li key={committee.id} className="h-full" {...gFade(index + 2, reduce)}>
              <button
                type="button"
                onClick={() => onOpenCommittee(committee.id)}
                data-testid={`parent-committee-card-${committee.id}`}
                aria-label={`Open ${committee.name} workspace${
                  unreadCount > 0 ? `, ${unreadLine(unreadCount, sectionLabels)}` : ""
                }`}
                className={`group flex h-full w-full flex-col rounded-[20px] border-[1.5px] p-4 text-left hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/30 hover:bg-white hover:shadow-[0_12px_22px_-16px_rgba(43,36,29,0.55)] ${SPRINGY} ${G_FOCUS} ${
                  unreadCount > 0
                    ? "border-[var(--sf-clay)]/40 bg-[var(--sf-accent-wash)]"
                    : "border-[var(--sf-ink)]/10 bg-[var(--sf-paper)]"
                }`}
              >
                <span className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-2 ring-[var(--sf-ink)] ${NOTE_TINTS[index % NOTE_TINTS.length]}`}
                  >
                    <HeartHandshake className="h-[18px] w-[18px] text-[var(--sf-ink)]" strokeWidth={2.4} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="sf-display block line-clamp-2 text-[1.15rem] leading-[1.1] text-[var(--sf-ink)]">
                      {committee.name}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <GChip tone="info">{committee.termLabel}</GChip>
                      {unreadCount > 0 ? (
                        <GChip tone="alert">
                          <Bell className="h-3 w-3" aria-hidden="true" />
                          {formatMessagesUnreadBadge(unreadCount)} new
                        </GChip>
                      ) : null}
                    </span>
                  </span>
                </span>

                {committee.description ? (
                  <span className="mt-3 block line-clamp-2 text-[13.5px] font-semibold leading-relaxed text-[var(--sf-soft)]">
                    {committee.description}
                  </span>
                ) : null}

                {unreadCount > 0 && sectionLabels && sectionLabels.length > 0 ? (
                  <span className="mt-2 block text-[12.5px] font-extrabold text-[var(--sf-clay-deep)]">
                    New in {sectionLabels.join(" · ")}
                  </span>
                ) : null}

                <span className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-[13px] font-semibold text-[var(--sf-ink)]/70">
                  {committee.openTaskCount > 0 ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CheckSquare className="h-3.5 w-3.5" aria-hidden="true" />
                      {plural(committee.openTaskCount, "open task")}
                    </span>
                  ) : null}
                  {committee.nextEventTitle ? (
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">Next: {committee.nextEventTitle}</span>
                    </span>
                  ) : null}
                </span>

                <span className="mt-3 flex items-center justify-between border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-3 text-[13.5px] font-extrabold text-[var(--sf-clay-deep)]">
                  Open workspace
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </GCard>
  );
}
