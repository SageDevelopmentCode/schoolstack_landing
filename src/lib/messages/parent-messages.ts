import type { SupabaseClient } from "@supabase/supabase-js";
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
  const { familyId, contacts } = await listParentMessageContacts(
    admin,
    supabase,
    organizationId,
    userId,
    schoolOfficeLabel,
  );

  const threads = familyId
    ? await listThreadsForOrganization(
        admin,
        organizationId,
        userId,
        schoolOfficeLabel,
        "parent",
        { type: "family", familyIds: [familyId] },
      )
    : [];

  return { threads, contacts };
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

  const { data: students, error } = await admin
    .from("enrollments")
    .select(
      `
      students!inner (
        assigned_teacher_id,
        staff_members:assigned_teacher_id (
          id,
          first_name,
          last_name,
          role_title
        )
      )
    `,
    )
    .eq("organization_id", organizationId)
    .eq("status", "enrolled")
    .eq("students.family_id", familyId);

  if (error) throw new Error(error.message);

  const teacherMap = new Map<string, MessagesInboxData["contacts"][number]>();
  for (const row of students ?? []) {
    const student = row.students as
      | {
          staff_members?:
            | { id: string; first_name: string; last_name: string; role_title?: string | null }
            | { id: string; first_name: string; last_name: string; role_title?: string | null }[]
            | null;
        }
      | {
          staff_members?:
            | { id: string; first_name: string; last_name: string; role_title?: string | null }
            | { id: string; first_name: string; last_name: string; role_title?: string | null }[]
            | null;
        }[]
      | null;
    const studentRow = Array.isArray(student) ? student[0] : student;
    const staffRaw = studentRow?.staff_members;
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

  const threads = await listThreadsForOrganization(
    admin,
    organizationId,
    previewUserId,
    schoolOfficeLabel,
    "parent",
    { type: "family", familyIds: [familyId] },
  );

  return { threads, contacts };
}
