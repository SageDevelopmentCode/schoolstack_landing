"use client";

import { ArrowRight, CalendarDays, CheckSquare, FileText, MessageCircle, UserRound } from "lucide-react";
import CommitteeActivityFeed from "@/components/school-admin/committees/CommitteeActivityFeed";
import CommitteeActivityFeedSkeleton from "@/components/school-admin/committees/CommitteeActivityFeedSkeleton";
import { GCard, GChip, G_FOCUS, SPRINGY, gBtnButterSm, gLinkSm } from "@/components/school-parent/garden/ui";
import type { CommitteeActivityItem } from "@/lib/committees/activity-feed";
import type { Committee, CommitteeWorkspaceSection } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { CommitteeDateStamp, formatLongDate, formatShortDate, plural } from "./committee-garden-section";

const TILE_TINT = {
  resources: "bg-[var(--sf-mint)]",
  calendar: "bg-[var(--sf-sky)]",
  messages: "bg-[var(--sf-butter)]",
} as const;

const TILE_ICON = { resources: FileText, calendar: CalendarDays, messages: MessageCircle } as const;

/**
 * Committee Home (Garden): welcome on the accent wash with the one next step,
 * a shortcut strip, "Coming up" as tickets on the page's one dark card,
 * "Open tasks" as a notebook list, and recent activity.
 */
export default function GardenCommitteeHome({
  committee,
  theme,
  upcomingEvents,
  urgentTasks,
  leaders,
  quickLinks,
  activityItems,
  loadingActivity,
  showActivity,
  onNavigate,
}: {
  committee: Committee;
  theme: ParentThemeTokens;
  upcomingEvents: Committee["events"];
  urgentTasks: Committee["tasks"];
  leaders: Committee["members"];
  quickLinks: { section: "resources" | "calendar" | "messages"; label: string; sub: string }[];
  activityItems: CommitteeActivityItem[];
  loadingActivity: boolean;
  showActivity: boolean;
  onNavigate: (section: CommitteeWorkspaceSection) => void;
}) {
  const openTasks = committee.tasks.filter((task) => task.status === "open");
  const unassigned = openTasks.filter((task) => !task.assigneeId && !task.assigneeName);
  const nextEvent = upcomingEvents[0] ?? null;

  const nextStep = unassigned.length > 0
    ? {
        label: `${plural(unassigned.length, "open task")} still ${unassigned.length === 1 ? "needs" : "need"} someone`,
        action: "See tasks",
        section: "tasks" as const,
      }
    : nextEvent
      ? {
          label: `Next up: ${nextEvent.title} · ${formatLongDate(nextEvent.date)}`,
          action: "Open calendar",
          section: "calendar" as const,
        }
      : null;

  return (
    <div className="space-y-5" data-testid="committee-home-garden">
      <GCard index={0} className="!border-[var(--sf-clay)]/25 !bg-[var(--sf-accent-wash)]">
        <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-clay-deep)]">
          {committee.termLabel}
        </p>
        <h2 className="sf-display m-0 mt-1 text-[1.9rem] leading-[1] text-[var(--sf-ink)]">
          Welcome to <span className="text-[var(--sf-clay)]">{committee.name}</span>
        </h2>
        {committee.description ? (
          <p className="m-0 mt-2.5 max-w-2xl text-[15px] leading-relaxed text-[var(--sf-ink)]/75">{committee.description}</p>
        ) : null}
        {leaders.length > 0 ? (
          <p className="m-0 mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--sf-soft)]">
            <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
            Led by {leaders.map((leader) => leader.name).join(", ")}
          </p>
        ) : null}
        {nextStep ? (
          <button
            type="button"
            onClick={() => onNavigate(nextStep.section)}
            className={`group mt-4 flex w-full flex-col gap-2 rounded-[16px] bg-white p-3.5 text-left shadow-[0_2px_0_0_rgba(43,36,29,0.08)] sm:flex-row sm:items-center ${G_FOCUS}`}
          >
            <span className="min-w-0 flex-1 text-[14.5px] font-extrabold text-[var(--sf-ink)]">{nextStep.label}</span>
            <span className={`${gLinkSm} shrink-0`}>
              {nextStep.action}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </button>
        ) : null}
      </GCard>

      <ul className="grid list-none gap-3 p-0 sm:grid-cols-3" aria-label="Workspace shortcuts">
        {quickLinks.map(({ section, label, sub }) => {
          const Icon = TILE_ICON[section];
          return (
            <li key={section}>
              <button
                type="button"
                onClick={() => onNavigate(section)}
                className={`group flex w-full items-center gap-3 rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-4 text-left shadow-[0_3px_0_0_rgba(43,36,29,0.06)] hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/30 ${SPRINGY} ${G_FOCUS}`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-2 ring-[var(--sf-ink)] ${TILE_TINT[section]}`}
                >
                  <Icon className="h-5 w-5 text-[var(--sf-ink)]" strokeWidth={2.4} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-extrabold text-[var(--sf-ink)]">{label}</span>
                  <span className="block truncate text-[13px] font-semibold text-[var(--sf-soft)]">{sub}</span>
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/50 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <GCard index={2} tone="dark" kicker="Coming up" title="Upcoming dates">
          {upcomingEvents.length === 0 ? (
            <p className="m-0 text-[15px] text-white/80">No upcoming dates.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {upcomingEvents.map((event) => (
                <li key={event.id} className="sf-ticket flex items-stretch rounded-2xl bg-[var(--sf-paper)] text-[var(--sf-ink)]">
                  <div className="flex items-center py-2.5 pl-5 pr-3">
                    <CommitteeDateStamp date={event.date} />
                  </div>
                  <div className="my-3 border-l-[1.5px] border-dashed border-[var(--sf-ink)]/20" aria-hidden="true" />
                  <div className="min-w-0 flex-1 px-4 py-3 pr-6">
                    <p className="m-0 truncate text-[15px] font-extrabold">{event.title}</p>
                    <p className="m-0 truncate text-[13px] font-semibold capitalize text-[var(--sf-soft)]">
                      {event.type}
                      {event.time ? ` · ${event.time}` : ""}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5">
            <button type="button" className={gBtnButterSm} onClick={() => onNavigate("calendar")}>
              View calendar <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </GCard>

        <GCard
          index={3}
          kicker="Action items"
          title="Open tasks"
          action={
            <button type="button" className={gLinkSm} onClick={() => onNavigate("tasks")}>
              View tasks <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          }
        >
          {urgentTasks.length === 0 ? (
            <p className="m-0 text-[15px] font-semibold text-[var(--sf-soft)]">No open tasks.</p>
          ) : (
            <ul className="sf-paper m-0 list-none divide-y-[1.5px] divide-dashed divide-[var(--sf-ink)]/10 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 p-0">
              {urgentTasks.map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate("tasks")}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-white/70 ${G_FOCUS} focus-visible:ring-inset`}
                  >
                    <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">{task.title}</span>
                      <span className="mt-0.5 block text-[13px] font-semibold text-[var(--sf-soft)]">
                        {task.assigneeName ?? "Unassigned"}
                        {task.dueDate ? ` · Due ${formatShortDate(task.dueDate)}` : ""}
                      </span>
                    </span>
                    {!task.assigneeName ? <GChip tone="warning">Needs someone</GChip> : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </GCard>
      </div>

      {showActivity ? (
        <GCard index={4}>
          {loadingActivity ? (
            <CommitteeActivityFeedSkeleton theme={theme} compact />
          ) : (
            <CommitteeActivityFeed theme={theme} items={activityItems} compact />
          )}
        </GCard>
      ) : null}
    </div>
  );
}
