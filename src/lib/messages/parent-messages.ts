import type { SupabaseClient } from "@supabase/supabase-js";
import { getGuardianIdsForUser } from "@/lib/messages/messages";
import { listParentMessageContacts } from "./contacts";
import {
  mainPortalMessageAudienceScope,
  programPortalMessageAudienceScope,
  type MessageThreadAudienceScope,
} from "./message-audience";
import { listThreadsForOrganization } from "./threads";
import type { MessageThreadSummary, MessagesInboxData } from "./types";

type LoadParentMessagesInboxOptions = {
  includeContacts?: boolean;
  programId?: string | null;
  audienceScope?: MessageThreadAudienceScope;
};

function resolveParentMessageAudienceScope(
  programId?: string | null,
  audienceScope?: MessageThreadAudienceScope,
): MessageThreadAudienceScope {
  if (audienceScope) return audienceScope;
  const normalizedProgramId = programId?.trim() || null;
  return normalizedProgramId
    ? programPortalMessageAudienceScope(normalizedProgramId)
    : mainPortalMessageAudienceScope();
}

export async function loadParentMessagesThreads(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
  supabase?: SupabaseClient,
  options: Pick<LoadParentMessagesInboxOptions, "programId" | "audienceScope"> = {},
): Promise<{
  threads: MessageThreadSummary[];
  guardianId: string | null;
}> {
  const schoolOfficeLabel = `${schoolName} Office`;
  const audienceScope = resolveParentMessageAudienceScope(
    options.programId,
    options.audienceScope,
  );

  let guardianId: string | null = null;
  if (supabase) {
    const contactsResult = await listParentMessageContacts(
      admin,
      supabase,
      organizationId,
      userId,
      schoolOfficeLabel,
      { programId: options.programId },
    );
    guardianId = contactsResult.guardianId;
  }

  const guardianIds = await getGuardianIdsForUser(admin, userId, organizationId);

  const threads =
    guardianIds.length > 0
      ? await listThreadsForOrganization(
          admin,
          organizationId,
          userId,
          schoolOfficeLabel,
          "parent",
          { type: "guardian", guardianIds },
          audienceScope,
        )
      : [];

  return { threads, guardianId };
}

export async function loadParentMessagesContacts(
  admin: SupabaseClient,
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
  programId?: string | null,
) {
  const schoolOfficeLabel = `${schoolName} Office`;
  const { contacts } = await listParentMessageContacts(
    admin,
    supabase,
    organizationId,
    userId,
    schoolOfficeLabel,
    { programId },
  );
  return contacts;
}

export async function loadParentMessagesInbox(
  admin: SupabaseClient,
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
  options: LoadParentMessagesInboxOptions = {},
): Promise<MessagesInboxData> {
  const includeContacts = options.includeContacts ?? true;
  const schoolOfficeLabel = `${schoolName} Office`;
  const audienceScope = resolveParentMessageAudienceScope(
    options.programId,
    options.audienceScope,
  );

  const contactsResult = includeContacts
    ? await listParentMessageContacts(
        admin,
        supabase,
        organizationId,
        userId,
        schoolOfficeLabel,
        { programId: options.programId },
      )
    : { familyId: null, guardianId: null, contacts: [] as MessagesInboxData["contacts"] };

  const { guardianId, contacts } = contactsResult;

  const guardianIds = await getGuardianIdsForUser(admin, userId, organizationId);

  const threads =
    guardianIds.length > 0
      ? await listThreadsForOrganization(
          admin,
          organizationId,
          userId,
          schoolOfficeLabel,
          "parent",
          { type: "guardian", guardianIds },
          audienceScope,
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
  options: Pick<LoadParentMessagesInboxOptions, "programId" | "audienceScope"> = {},
): Promise<MessagesInboxData> {
  const schoolOfficeLabel = `${schoolName} Office`;
  const audienceScope = resolveParentMessageAudienceScope(
    options.programId,
    options.audienceScope,
  );
  const programId = options.programId?.trim() || null;

  const contacts: MessagesInboxData["contacts"] = [
    {
      key: "school_office",
      kind: "school_office",
      name: schoolOfficeLabel,
      subtitle: "Admin",
      color: "#4A6354",
    },
  ];

  let enrolledStudentIds: string[] | null = null;
  if (programId) {
    const { data: studentRows, error: studentError } = await admin
      .from("students")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("family_id", familyId);

    if (studentError) throw new Error(studentError.message);

    const studentIds = (studentRows ?? []).map((row) => String(row.id));
    if (studentIds.length === 0) {
      return { threads: [], contacts, guardianId: null };
    }

    const { data: enrollmentRows, error: enrollmentError } = await admin
      .from("enrollments")
      .select("student_id")
      .eq("organization_id", organizationId)
      .eq("program_id", programId)
      .eq("status", "enrolled")
      .in("student_id", studentIds);

    if (enrollmentError) throw new Error(enrollmentError.message);

    enrolledStudentIds = (enrollmentRows ?? [])
      .map((row) => (row.student_id ? String(row.student_id) : null))
      .filter((id): id is string => Boolean(id));
  }

  let assignmentsQuery = admin
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
        id,
        family_id
      )
    `,
    )
    .eq("organization_id", organizationId)
    .eq("students.family_id", familyId);

  if (enrolledStudentIds) {
    if (enrolledStudentIds.length === 0) {
      const { data: guardianRows, error: guardianError } = await admin
        .from("guardians")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("family_id", familyId);

      if (guardianError) throw new Error(guardianError.message);

      return {
        threads: [],
        contacts,
        guardianId: guardianRows?.[0]?.id ? String(guardianRows[0].id) : null,
      };
    }
    assignmentsQuery = assignmentsQuery.in("students.id", enrolledStudentIds);
  }

  const { data: assignments, error } = await assignmentsQuery;

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
          audienceScope,
        )
      : [];

  return { threads, contacts, guardianId: guardianIds[0] ?? null };
}
