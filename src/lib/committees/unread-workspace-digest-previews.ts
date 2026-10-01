import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CommitteeUnreadSection } from "@/lib/committees/committee-unread-types";
import {
  formatCalendarDigestPreview,
  formatMessageDigestPreview,
  formatResourceDigestPreview,
  formatTaskDigestPreview,
  isEntityCreatedAfterRead,
  WORKSPACE_DIGEST_SECTION_LABELS,
  type WorkspaceDigestSectionPreview,
} from "@/lib/committees/unread-workspace-digest-preview-format";

export {
  WORKSPACE_DIGEST_SECTION_LABELS,
  type WorkspaceDigestSectionPreview,
} from "@/lib/committees/unread-workspace-digest-preview-format";

type MemberNameLookup = Map<string, string>;

export async function loadWorkspaceDigestSectionPreviews(
  admin: SupabaseClient,
  input: {
    committeeId: string;
    eligibleSections: CommitteeUnreadSection[];
    readAt: Partial<Record<CommitteeUnreadSection, string | null>>;
    memberDisplayNameById: MemberNameLookup;
  },
): Promise<WorkspaceDigestSectionPreview[]> {
  const { committeeId, eligibleSections, readAt, memberDisplayNameById } = input;
  if (eligibleSections.length === 0) return [];

  const previews: WorkspaceDigestSectionPreview[] = [];

  for (const section of eligibleSections) {
    const sectionReadAt = readAt[section] ?? null;
    const label = WORKSPACE_DIGEST_SECTION_LABELS[section];

    if (section === "messages") {
      const { data, error } = await admin
        .from("committee_messages")
        .select("body, created_at, sender_member_id")
        .eq("committee_id", committeeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!isEntityCreatedAfterRead(data?.created_at ? String(data.created_at) : null, sectionReadAt)) {
        continue;
      }
      const senderId = data?.sender_member_id ? String(data.sender_member_id) : "";
      const senderName = memberDisplayNameById.get(senderId) ?? "Someone";
      previews.push({
        section,
        label,
        preview: formatMessageDigestPreview(senderName, String(data?.body ?? "")),
      });
      continue;
    }

    if (section === "tasks") {
      const { data, error } = await admin
        .from("committee_tasks")
        .select("title, due_date, created_at")
        .eq("committee_id", committeeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!isEntityCreatedAfterRead(data?.created_at ? String(data.created_at) : null, sectionReadAt)) {
        continue;
      }
      previews.push({
        section,
        label,
        preview: formatTaskDigestPreview(
          String(data?.title ?? ""),
          data?.due_date ? String(data.due_date) : null,
        ),
      });
      continue;
    }

    if (section === "resources") {
      const { data, error } = await admin
        .from("committee_resources")
        .select("title, created_at")
        .eq("committee_id", committeeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!isEntityCreatedAfterRead(data?.created_at ? String(data.created_at) : null, sectionReadAt)) {
        continue;
      }
      previews.push({
        section,
        label,
        preview: formatResourceDigestPreview(String(data?.title ?? "")),
      });
      continue;
    }

    if (section === "calendar") {
      const { data, error } = await admin
        .from("committee_events")
        .select("title, event_date, event_time, created_at")
        .eq("committee_id", committeeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!isEntityCreatedAfterRead(data?.created_at ? String(data.created_at) : null, sectionReadAt)) {
        continue;
      }
      previews.push({
        section,
        label,
        preview: formatCalendarDigestPreview(
          String(data?.title ?? ""),
          String(data?.event_date ?? ""),
          data?.event_time ? String(data.event_time) : null,
        ),
      });
    }
  }

  return previews;
}

export function buildMemberDisplayNameLookup(
  members: Array<{ id: string; display_name: string | null }>,
): MemberNameLookup {
  const map = new Map<string, string>();
  for (const member of members) {
    map.set(String(member.id), String(member.display_name ?? "").trim() || "Member");
  }
  return map;
}
