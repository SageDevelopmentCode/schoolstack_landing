import type { SupabaseClient } from "@supabase/supabase-js";
import { getGuardianIdsForUser } from "@/lib/messages/messages";
import { listParentMessageContacts } from "./contacts";
import { listThreadsForOrganization } from "./threads";
import type { MessagesInboxData } from "./types";

export async function loadParentMessagesInbox(
  admin: SupabaseClient,
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
): Promise<MessagesInboxData> {
  const schoolOfficeLabel = `${schoolName} Office`;
  const { familyId, guardianId, contacts } = await listParentMessageContacts(
    admin,
    supabase,
    organizationId,
    userId,
    schoolOfficeLabel,
  );

  const guardianIds =
    guardianId
      ? [guardianId]
      : await getGuardianIdsForUser(admin, userId, organizationId);

  const threads =
    guardianIds.length > 0
      ? await listThreadsForOrganization(
          admin,
          organizationId,
          userId,
          schoolOfficeLabel,
          "parent",
          { type: "guardian", guardianIds },
        )
      : [];

  return { threads, contacts, guardianId };
}

export async function loadParentMessagesPreviewInbox(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  schoolName: string,
  previewUserId: string,
): Promise<MessagesInboxData> {
  const schoolOfficeLabel = `${schoolName} Office`;

  const contacts: MessagesInboxData["contacts"] = [
    {
      key: "school_office",
      kind: "school_office",
      name: schoolOfficeLabel,
      subtitle: "Admin",
      color: "#4A6354",
    },
  ];

  const { data: assignments, error } = await admin
    .from("student_teacher_assignments")
    .select(
      `
      staff_members!inner (
        id,
        first_name,
        last_name,
        role_title
      ),
      students!inner (
        family_id
      )
    `,
    )
    .eq("organization_id", organizationId)
    .eq("students.family_id", familyId);

  if (error) throw new Error(error.message);

  const teacherMap = new Map<string, MessagesInboxData["contacts"][number]>();
  for (const row of assignments ?? []) {
    const staffRaw = row.staff_members as
      | { id: string; first_name: string; last_name: string; role_title?: string | null }
      | { id: string; first_name: string; last_name: string; role_title?: string | null }[]
      | null;
    const staff = Array.isArray(staffRaw) ? staffRaw[0] : staffRaw;
    if (!staff) continue;
    const staffMemberId = String(staff.id);
    if (teacherMap.has(staffMemberId)) continue;
    teacherMap.set(staffMemberId, {
      key: `staff:${staffMemberId}`,
      kind: "staff_member",
      staffMemberId,
      name: [staff.first_name, staff.last_name].filter(Boolean).join(" ") || "Teacher",
      subtitle: staff.role_title ?? "Teacher",
      color: "#7FA888",
    });
  }
  contacts.push(...teacherMap.values());

  const { data: guardianRows, error: guardianError } = await admin
    .from("guardians")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId);

  if (guardianError) throw new Error(guardianError.message);

  const guardianIds = (guardianRows ?? []).map((row) => String(row.id));
  const threads =
    guardianIds.length > 0
      ? await listThreadsForOrganization(
          admin,
          organizationId,
          previewUserId,
          schoolOfficeLabel,
          "parent",
          { type: "guardian", guardianIds },
        )
      : [];

  return { threads, contacts, guardianId: guardianIds[0] ?? null };
}
