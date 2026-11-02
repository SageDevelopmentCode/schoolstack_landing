import type { NewsletterEdition } from "@/lib/school-admin/newsletter/newsletter-types";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";

export type ParentNewsletterStaffMember = {
  id: string;
  firstName: string;
  lastName: string;
};

function publishedTeacherUpdateStaffIds(edition: NewsletterEdition): Set<string> {
  const ids = new Set<string>();
  for (const [staffId, text] of Object.entries(edition.teacherUpdates)) {
    if (text.trim()) {
      ids.add(staffId);
    }
  }
  return ids;
}

export function staffMembersForPublishedUpdates(
  edition: NewsletterEdition,
  roster: StaffMemberRecord[],
): ParentNewsletterStaffMember[] {
  const publishedIds = publishedTeacherUpdateStaffIds(edition);
  if (publishedIds.size === 0) {
    return [];
  }

  return roster
    .filter((member) => publishedIds.has(member.id))
    .map((member) => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
    }));
}

export function sanitizeNewsletterEditionForParent(edition: NewsletterEdition): NewsletterEdition {
  const teacherUpdates: Record<string, string> = {};
  for (const [staffId, text] of Object.entries(edition.teacherUpdates)) {
    const trimmed = text.trim();
    if (trimmed) {
      teacherUpdates[staffId] = text;
    }
  }
  return { ...edition, teacherUpdates };
}
