"use client";

import { CalendarDays, CheckSquare, FileText, FolderKanban, Home, MessageCircle, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GChip, type GChipTone } from "@/components/school-parent/garden/ui";
import type {
  CommitteeJoinRequestStatus,
  CommitteeWorkspaceSection,
  ParentCommitteeBrowseItem,
} from "@/lib/committees/types";

/*
 * Shared bits for the Garden Committees tab (parent + teacher portals).
 * Skill: parent-portal-garden-design.
 */

export type ParentCommitteesTab = "explore" | "mine";

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function committeesTitle(tab: ParentCommitteesTab): string {
  return tab === "explore" ? "Explore committees" : "Your committees";
}

/** Existing header copy (moved from the story header). */
export function committeesSubtitle(
  tab: ParentCommitteesTab,
  exploreCount: number,
  myCount: number,
): string {
  if (tab === "explore") {
    if (exploreCount === 0) return "No volunteer committees are open right now.";
    return `${plural(exploreCount, "committee")} open for volunteers`;
  }
  if (myCount === 0) return "Approved committee workspaces will appear here.";
  return plural(myCount, "active workspace");
}

/* ------------------------------------------------------------------ */
/* Join request status                                                */
/* ------------------------------------------------------------------ */

export const REQUEST_STATUS_CHIP: Record<
  CommitteeJoinRequestStatus,
  { label: string; tone: GChipTone }
> = {
  pending: { label: "Request pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  declined: { label: "Declined", tone: "alert" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
};

export function RequestStatusChip({ status }: { status: CommitteeJoinRequestStatus }) {
  const config = REQUEST_STATUS_CHIP[status];
  return <GChip tone={config.tone}>{config.label}</GChip>;
}

/** What clicking an Explore tile does, in words. */
export function exploreCallToAction(committee: ParentCommitteeBrowseItem): string {
  if (committee.isMember) return "Open workspace";
  if (committee.requestStatus === "pending") return "View request";
  if (committee.requestStatus === "approved") return "View status";
  return "View & request to join";
}

/* ------------------------------------------------------------------ */
/* The joining journey                                                */
/* ------------------------------------------------------------------ */

export const JOIN_STEPS = [
  {
    title: "Explore committees",
    body: "See which volunteer committees are open and what each one does.",
  },
  {
    title: "Request to join",
    body: "Choose a preferred role if you have one and add a short note.",
  },
  {
    title: "School reviews",
    body: "Your request will be reviewed by the school.",
  },
  {
    title: "Workspace opens",
    body: "After approval, you will get access to the committee workspace.",
  },
] as const;

/** Total steps; a `current` equal to this means every step is done. */
export const JOIN_STEPS_DONE = JOIN_STEPS.length;

/** Which journey step a committee's request is on (0-based). */
export function requestStepIndex(committee: ParentCommitteeBrowseItem): number {
  if (committee.isMember) return JOIN_STEPS_DONE;
  switch (committee.requestStatus) {
    case "approved":
      return 3;
    case "pending":
      return 2;
    default:
      return 1;
  }
}

/* ------------------------------------------------------------------ */
/* Workspace sections                                                 */
/* ------------------------------------------------------------------ */

export const COMMITTEE_SECTION_ICONS: Partial<Record<CommitteeWorkspaceSection, LucideIcon>> = {
  home: Home,
  resources: FileText,
  calendar: CalendarDays,
  tasks: CheckSquare,
  projects: FolderKanban,
  messages: MessageCircle,
  members: Users,
};

/** Shared Garden text input (moved to the kit; re-exported for existing imports). */
export { G_INPUT } from "@/components/school-parent/garden/ui";
