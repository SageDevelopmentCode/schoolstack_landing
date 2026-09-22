import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  formatActivityActionLabel,
} from "@/lib/activity-log";
import type { CommitteeWorkspaceSection } from "./types";

export const COMMITTEE_ACTIVITY_ACTIONS: string[] = [
  ACTIVITY_ACTIONS.COMMITTEE_JOIN_REQUESTED,
  ACTIVITY_ACTIONS.COMMITTEE_JOIN_APPROVED,
  ACTIVITY_ACTIONS.COMMITTEE_JOIN_DECLINED,
  ACTIVITY_ACTIONS.COMMITTEE_JOIN_WITHDRAWN,
  ACTIVITY_ACTIONS.COMMITTEE_MEMBER_INVITED,
  ACTIVITY_ACTIONS.COMMITTEE_MEMBER_REMOVED,
  ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED,
  ACTIVITY_ACTIONS.COMMITTEE_TASK_UPDATED,
  ACTIVITY_ACTIONS.COMMITTEE_TASK_DELETED,
  ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_CREATED,
  ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_UPDATED,
  ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_DELETED,
  ACTIVITY_ACTIONS.COMMITTEE_EVENT_CREATED,
  ACTIVITY_ACTIONS.COMMITTEE_EVENT_UPDATED,
  ACTIVITY_ACTIONS.COMMITTEE_EVENT_DELETED,
  ACTIVITY_ACTIONS.COMMITTEE_MESSAGE_POSTED,
  ACTIVITY_ACTIONS.COMMITTEE_DUTY_ROLE_CREATED,
  ACTIVITY_ACTIONS.COMMITTEE_DUTY_ROLE_UPDATED,
  ACTIVITY_ACTIONS.COMMITTEE_DUTY_ROLE_DELETED,
];

export const COMMITTEE_PARENT_ACTIVITY_ACTIONS: string[] = [
  ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED,
  ACTIVITY_ACTIONS.COMMITTEE_TASK_UPDATED,
  ACTIVITY_ACTIONS.COMMITTEE_TASK_DELETED,
  ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_CREATED,
  ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_UPDATED,
  ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_DELETED,
  ACTIVITY_ACTIONS.COMMITTEE_EVENT_CREATED,
  ACTIVITY_ACTIONS.COMMITTEE_EVENT_UPDATED,
  ACTIVITY_ACTIONS.COMMITTEE_EVENT_DELETED,
  ACTIVITY_ACTIONS.COMMITTEE_MESSAGE_POSTED,
];

export type CommitteeActivityAudience = "admin" | "parent";

export type CommitteeActivityCategory =
  | "Members"
  | "Tasks"
  | "Resources"
  | "Calendar"
  | "Messages"
  | "Roles";

export type CommitteeActivityEventRow = {
  id: string;
  organization_id: string;
  actor_name: string | null;
  action: string;
  summary: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type CommitteeActivityItem = {
  id: string;
  summary: string;
  actorName: string | null;
  actionLabel: string;
  category: CommitteeActivityCategory;
  committeeId: string | null;
  committeeName: string | null;
  createdAt: string;
  href?: string;
  section?: CommitteeWorkspaceSection;
};

export type CommitteeActivityLinkSurface = "admin" | "parent";

export async function fetchCommitteeActivityEvents(
  admin: SupabaseClient,
  options: {
    organizationId: string;
    committeeId?: string;
    limit?: number;
    days?: number;
    audience?: CommitteeActivityAudience;
  },
): Promise<CommitteeActivityEventRow[]> {
  const limit = options.limit ?? 30;
  const days = options.days ?? 30;
  const audience = options.audience ?? "admin";
  const actions =
    audience === "parent"
      ? COMMITTEE_PARENT_ACTIVITY_ACTIONS
      : COMMITTEE_ACTIVITY_ACTIONS;
  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - days);

  let query = admin
    .from("activity_events")
    .select("id, organization_id, actor_name, action, summary, metadata, created_at")
    .eq("organization_id", options.organizationId)
    .in("action", actions)
    .gte("created_at", rangeStart.toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options.committeeId) {
    query = query.filter("metadata->>committeeId", "eq", options.committeeId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as CommitteeActivityEventRow[];
}

function categoryForAction(action: string): CommitteeActivityCategory {
  if (action.includes(".member.") || action.includes(".join_")) return "Members";
  if (action.includes(".task.")) return "Tasks";
  if (action.includes(".resource.")) return "Resources";
  if (action.includes(".event.")) return "Calendar";
  if (action.includes(".message.")) return "Messages";
  if (action.includes(".duty_role.")) return "Roles";
  return "Members";
}

function sectionForAction(action: string): CommitteeWorkspaceSection {
  if (action.includes(".member.") || action.includes(".join_")) return "members";
  if (action.includes(".task.")) return "tasks";
  if (action.includes(".resource.")) return "resources";
  if (action.includes(".event.")) return "calendar";
  if (action.includes(".message.")) return "messages";
  if (action.includes(".duty_role.")) return "about";
  return "home";
}

function buildCommitteeActivityHref(
  slug: string,
  committeeId: string,
  section: CommitteeWorkspaceSection,
  surface: CommitteeActivityLinkSurface,
): string {
  if (surface === "admin") {
    return `/school/${slug}/admin/committees?committee=${encodeURIComponent(committeeId)}&section=${section}`;
  }
  const params = new URLSearchParams({
    committee: committeeId,
    section,
    tab: "mine",
  });
  return `/school/${slug}/parent/committees?${params.toString()}`;
}

export function mapCommitteeActivityItem(
  row: CommitteeActivityEventRow,
  options: {
    slug: string;
    committeeId?: string;
    linkSurface?: CommitteeActivityLinkSurface;
    includeHref?: boolean;
  },
): CommitteeActivityItem {
  const metadata = row.metadata ?? {};
  const resolvedCommitteeId =
    (typeof metadata.committeeId === "string" ? metadata.committeeId : null) ??
    options.committeeId ??
    null;
  const committeeName =
    typeof metadata.committeeName === "string" ? metadata.committeeName : null;
  const section = sectionForAction(row.action);
  const linkSurface = options.linkSurface ?? "admin";
  const includeHref = options.includeHref ?? true;

  return {
    id: row.id,
    summary: row.summary,
    actorName: row.actor_name,
    actionLabel: formatActivityActionLabel(row.action),
    category: categoryForAction(row.action),
    committeeId: resolvedCommitteeId,
    committeeName,
    createdAt: row.created_at,
    section,
    href:
      includeHref && resolvedCommitteeId && options.slug
        ? buildCommitteeActivityHref(
            options.slug,
            resolvedCommitteeId,
            section,
            linkSurface,
          )
        : undefined,
  };
}

export function mapCommitteeActivityItems(
  rows: CommitteeActivityEventRow[],
  options: {
    slug: string;
    committeeId?: string;
    linkSurface?: CommitteeActivityLinkSurface;
    includeHref?: boolean;
  },
): CommitteeActivityItem[] {
  return rows.map((row) => mapCommitteeActivityItem(row, options));
}
