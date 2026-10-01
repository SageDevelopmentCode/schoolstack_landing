import type { CommitteeUnreadSection } from "@/lib/committees/committee-unread-types";

export const WORKSPACE_DIGEST_SECTION_LABELS: Record<CommitteeUnreadSection, string> = {
  messages: "Messages",
  tasks: "Tasks",
  resources: "Resources",
  calendar: "Calendar",
};

export type WorkspaceDigestSectionPreview = {
  section: CommitteeUnreadSection;
  label: string;
  preview: string;
};

const PREVIEW_MAX_LEN = 120;

export function stripMessageBodyForDigest(body: string): string {
  const withoutTags = body.replace(/<[^>]*>/g, " ");
  return withoutTags.replace(/\s+/g, " ").trim();
}

export function truncateDigestPreview(text: string, maxLen = PREVIEW_MAX_LEN): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen - 1).trimEnd()}…`;
}

export function formatMessageDigestPreview(senderName: string, body: string): string {
  const plain = stripMessageBodyForDigest(body);
  const snippet = truncateDigestPreview(plain || "(attachment)");
  const from = senderName.trim() || "Someone";
  return `${from}: ${snippet}`;
}

export function formatTaskDigestPreview(title: string, dueDate: string | null): string {
  const name = title.trim() || "New task";
  if (!dueDate) return name;
  return `${name} (due ${formatShortDate(dueDate)})`;
}

export function formatResourceDigestPreview(title: string): string {
  return title.trim() || "New resource";
}

export function formatCalendarDigestPreview(
  title: string,
  eventDate: string,
  eventTime: string | null,
): string {
  const name = title.trim() || "New event";
  const when = formatEventWhen(eventDate, eventTime);
  return when ? `${name} — ${when}` : name;
}

function formatShortDate(isoDate: string): string {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(parsed));
}

function formatEventWhen(eventDate: string, eventTime: string | null): string {
  const datePart = formatShortDate(eventDate);
  if (!eventTime?.trim()) return datePart;
  return `${datePart} at ${eventTime.trim()}`;
}

export function isEntityCreatedAfterRead(
  createdAt: string | null | undefined,
  readAt: string | null,
): boolean {
  if (!createdAt) return false;
  const createdMs = Date.parse(createdAt);
  if (Number.isNaN(createdMs)) return false;
  if (!readAt) return true;
  const readMs = Date.parse(readAt);
  if (Number.isNaN(readMs)) return true;
  return createdMs > readMs;
}
