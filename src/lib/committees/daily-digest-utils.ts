import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import {
  type CommitteeActivityCategory,
  type CommitteeActivityEventRow,
  categoryForAction,
  sortDigestCategories,
} from "@/lib/committees/activity-feed";

const MAX_ITEMS_PER_CATEGORY = 10;

export type CommitteeDigestActivityItem = {
  title: string;
  actionLabel: string;
  details: string[];
  actorName?: string | null;
  occurredAtLabel: string;
};

export type CommitteeDigestCategoryGroup = {
  category: CommitteeActivityCategory;
  items: CommitteeDigestActivityItem[];
  truncatedCount: number;
};

export type CommitteeDigestCommitteeGroup = {
  committeeId: string;
  committeeName: string;
  categories: CommitteeDigestCategoryGroup[];
};

function metadataString(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
): string | null {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function metadataRecord(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
): Record<string, unknown> | null {
  const value = metadata?.[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function formatDigestDateLabel(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
  const date = dateOnly
    ? new Date(`${trimmed}T12:00:00`)
    : new Date(trimmed);
  if (Number.isNaN(date.getTime())) return trimmed;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDigestTimeLabel(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return trimmed;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return trimmed;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDigestOccurredAtLabel(
  createdAt: string,
  referenceDate = new Date(),
): string {
  const occurredAt = new Date(createdAt);
  if (Number.isNaN(occurredAt.getTime())) return createdAt;

  const startOfToday = new Date(referenceDate);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const timeLabel = occurredAt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (occurredAt >= startOfToday) {
    return `Today at ${timeLabel}`;
  }

  if (occurredAt >= startOfYesterday) {
    return `Yesterday at ${timeLabel}`;
  }

  return occurredAt.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function actionLabelForAction(action: string): string {
  if (action.endsWith(".created")) return "Added";
  if (action.endsWith(".updated")) return "Updated";
  if (action.endsWith(".deleted")) return "Removed";
  if (action.endsWith(".invited")) return "Invited";
  if (action.endsWith(".removed")) return "Removed";
  if (action.endsWith(".posted")) return "Posted";
  return "Updated";
}

function titleFromSummary(summary: string): string {
  const quoted = summary.match(/"([^"]+)"/);
  if (quoted?.[1]) return quoted[1];
  return summary.replace(/\.$/, "");
}

function appendDetail(details: string[], label: string, value: string | null) {
  if (!value) return;
  details.push(`${label}: ${value}`);
}

function appendFormattedDate(details: string[], value: string | null | undefined) {
  const formatted = formatDigestDateLabel(value);
  if (formatted) details.push(formatted);
}

function taskStatusLabel(status: string | null | undefined): string | null {
  if (!status?.trim()) return null;
  return status
    .trim()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildTaskDetails(
  metadata: Record<string, unknown> | null | undefined,
): string[] {
  const details: string[] = [];
  const changes = metadataRecord(metadata, "changes");

  appendDetail(
    details,
    "Status",
    taskStatusLabel(
      metadataString(changes, "status") ?? metadataString(metadata, "taskStatus"),
    ),
  );
  appendFormattedDate(
    details,
    metadataString(changes, "dueDate") ?? metadataString(metadata, "dueDate"),
  );

  return details;
}

function buildEventDetails(
  metadata: Record<string, unknown> | null | undefined,
): string[] {
  const details: string[] = [];
  const changes = metadataRecord(metadata, "changes");

  appendFormattedDate(
    details,
    metadataString(changes, "date") ?? metadataString(metadata, "eventDate"),
  );

  const time =
    metadataString(changes, "time") ?? metadataString(metadata, "eventTime");
  const formattedTime = formatDigestTimeLabel(time);
  if (formattedTime) details.push(`Time: ${formattedTime}`);

  appendDetail(
    details,
    "Location",
    metadataString(changes, "location") ?? metadataString(metadata, "location"),
  );

  return details;
}

function buildResourceDetails(
  metadata: Record<string, unknown> | null | undefined,
): string[] {
  const details: string[] = [];
  const changes = metadataRecord(metadata, "changes");
  const resourceType =
    metadataString(changes, "type") ?? metadataString(metadata, "resourceType");
  if (resourceType) {
    details.push(
      resourceType
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    );
  }
  return details;
}

function buildMemberDetails(
  metadata: Record<string, unknown> | null | undefined,
): string[] {
  const details: string[] = [];
  const role = metadataString(metadata, "memberRole");
  if (role) {
    details.push(
      role
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    );
  }
  return details;
}

export function mapDigestActivityItem(
  event: CommitteeActivityEventRow,
  referenceDate = new Date(),
): CommitteeDigestActivityItem {
  const metadata = event.metadata ?? {};
  const action = event.action;
  const actionLabel = actionLabelForAction(action);
  let title = titleFromSummary(event.summary);
  const details: string[] = [];

  if (action.startsWith("committee.task.")) {
    title =
      metadataString(metadata, "taskTitle") ??
      title;
    details.push(...buildTaskDetails(metadata));
  } else if (action.startsWith("committee.event.")) {
    title =
      metadataString(metadata, "eventTitle") ??
      title;
    details.push(...buildEventDetails(metadata));
  } else if (action.startsWith("committee.resource.")) {
    title =
      metadataString(metadata, "resourceTitle") ??
      title;
    details.push(...buildResourceDetails(metadata));
  } else if (action.startsWith("committee.member.")) {
    title =
      metadataString(metadata, "memberName") ??
      title;
    details.push(...buildMemberDetails(metadata));
  } else if (action === ACTIVITY_ACTIONS.COMMITTEE_MESSAGE_POSTED) {
    const preview = metadataString(metadata, "messagePreview");
    if (preview) {
      title = preview;
    } else if (title.toLowerCase().startsWith("new message posted")) {
      title = "New message";
    }
  }

  return {
    title,
    actionLabel,
    details,
    actorName: event.actor_name,
    occurredAtLabel: formatDigestOccurredAtLabel(event.created_at, referenceDate),
  };
}

export function committeeIdFromEvent(
  event: CommitteeActivityEventRow,
): string | null {
  const committeeId = event.metadata?.committeeId;
  return typeof committeeId === "string" && committeeId.trim()
    ? committeeId.trim()
    : null;
}

export function committeeNameFromEvent(
  event: CommitteeActivityEventRow,
): string | null {
  const committeeName = event.metadata?.committeeName;
  return typeof committeeName === "string" && committeeName.trim()
    ? committeeName.trim()
    : null;
}

export function actorMemberIdFromEvent(
  event: CommitteeActivityEventRow,
): string | null {
  const actorMemberId = event.metadata?.actorMemberId;
  return typeof actorMemberId === "string" && actorMemberId.trim()
    ? actorMemberId.trim()
    : null;
}

export function filterDigestEventsForMember(
  events: CommitteeActivityEventRow[],
  input: {
    memberIds: string[];
    committeeIds: string[];
  },
): CommitteeActivityEventRow[] {
  const committeeIdSet = new Set(input.committeeIds);
  const memberIdSet = new Set(input.memberIds);
  return events.filter((event) => {
    const committeeId = committeeIdFromEvent(event);
    if (!committeeId || !committeeIdSet.has(committeeId)) return false;
    if (event.action === ACTIVITY_ACTIONS.COMMITTEE_TASK_ASSIGNED) return false;
    const actorMemberId = actorMemberIdFromEvent(event);
    if (actorMemberId && memberIdSet.has(actorMemberId)) return false;
    return true;
  });
}

export function buildDigestCommitteeGroups(
  events: CommitteeActivityEventRow[],
  referenceDate = new Date(),
): CommitteeDigestCommitteeGroup[] {
  const byCommittee = new Map<
    string,
    { committeeName: string; events: CommitteeActivityEventRow[] }
  >();

  for (const event of events) {
    const committeeId = committeeIdFromEvent(event);
    if (!committeeId) continue;

    const existing = byCommittee.get(committeeId);
    const committeeName =
      committeeNameFromEvent(event) ?? existing?.committeeName ?? "Committee";

    if (existing) {
      existing.events.push(event);
      if (committeeNameFromEvent(event)) {
        existing.committeeName = committeeName;
      }
      continue;
    }

    byCommittee.set(committeeId, {
      committeeName,
      events: [event],
    });
  }

  const groups: CommitteeDigestCommitteeGroup[] = [];

  for (const [committeeId, committee] of byCommittee) {
    const byCategory = new Map<
      CommitteeActivityCategory,
      CommitteeDigestActivityItem[]
    >();

    for (const event of committee.events) {
      const category = categoryForAction(event.action);
      const items = byCategory.get(category) ?? [];
      items.push(mapDigestActivityItem(event, referenceDate));
      byCategory.set(category, items);
    }

    const categories = sortDigestCategories([...byCategory.keys()]).map(
      (category) => {
        const items = byCategory.get(category) ?? [];
        const visibleItems = items.slice(0, MAX_ITEMS_PER_CATEGORY);
        return {
          category,
          items: visibleItems,
          truncatedCount: Math.max(0, items.length - visibleItems.length),
        };
      },
    );

    groups.push({
      committeeId,
      committeeName: committee.committeeName,
      categories,
    });
  }

  return groups.sort((left, right) =>
    left.committeeName.localeCompare(right.committeeName),
  );
}

function formatCommitteeDigestActivityLine(
  item: CommitteeDigestActivityItem,
): string {
  const detailParts: string[] = [];
  if (item.details[0]) {
    detailParts.push(item.details[0]);
  }

  const meta = [
    item.actorName ? `By ${item.actorName}` : null,
    item.occurredAtLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  if (meta) {
    detailParts.push(meta);
  }

  const suffix =
    detailParts.length > 0 ? ` — ${detailParts.join(" — ")}` : "";

  return `• [${item.actionLabel}] ${item.title}${suffix}`;
}

export function formatCommitteeDigestGroupsForDiscord(
  committees: CommitteeDigestCommitteeGroup[],
): string {
  const sections: string[] = [];

  for (const committee of committees) {
    sections.push(`**${committee.committeeName}**`);

    for (const category of committee.categories) {
      for (const item of category.items) {
        sections.push(formatCommitteeDigestActivityLine(item));
      }

      if (category.truncatedCount > 0) {
        sections.push(
          `• …and ${category.truncatedCount} more ${category.category.toLowerCase()} updates`,
        );
      }
    }

    sections.push("");
  }

  return sections.join("\n").trim();
}
