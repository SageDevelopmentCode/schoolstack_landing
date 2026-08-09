import type { SupabaseClient } from "@supabase/supabase-js";
import { getFamilyIdsForUser, userIsOrgAdmin } from "@/lib/admissions/application-auth";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { dispatchMessageNotifications } from "@/lib/messages/message-notifications";
import { getGuardianIdForUser, postPortalMessage } from "@/lib/messages/messages";
import { participantsFromContact } from "@/lib/messages/participants-from-contact";
import {
  findOrCreateThread,
  getThreadDetail,
  markThreadRead,
} from "@/lib/messages/threads";
import type { MessageContactInput, MessageParticipantInput } from "@/lib/messages/types";
import {
  getStaffMemberIdForUser,
  requireTeacherPortalUser,
} from "@/lib/staff/teacher-portal-access";
import { requireSchoolAdminUser } from "@/lib/school-admin/access";

export async function assertParentCanAccessThread(
  admin: SupabaseClient,
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  threadId: string,
): Promise<string> {
  const hasAccess = await userHasEnrolledAccess(supabase, userId, organizationId);
  if (!hasAccess) throw new Error("You do not have access to messages.");

  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  if (familyIds.length === 0) throw new Error("No family found for this account.");

  const { data: participants, error } = await admin
    .from("message_thread_participants")
    .select("family_id, participant_kind")
    .eq("thread_id", threadId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);

  const allowed = (participants ?? []).some(
    (row) =>
      row.participant_kind === "family" &&
      row.family_id &&
      familyIds.includes(String(row.family_id)),
  );

  if (!allowed) throw new Error("You do not have access to this thread.");
  return familyIds[0];
}

export async function assertTeacherCanAccessThread(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  threadId: string,
): Promise<void> {
  const { data: participants, error } = await admin
    .from("message_thread_participants")
    .select("staff_member_id, participant_kind")
    .eq("thread_id", threadId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);

  const allowed = (participants ?? []).some((row) => {
    if (
      row.participant_kind === "staff_member" &&
      String(row.staff_member_id) === staffMemberId
    ) {
      return true;
    }
    if (row.participant_kind === "school_office") {
      return (participants ?? []).some(
        (inner) =>
          inner.participant_kind === "staff_member" &&
          String(inner.staff_member_id) === staffMemberId,
      );
    }
    return false;
  });

  if (!allowed) throw new Error("You do not have access to this thread.");
}

export async function resolveParticipantsForContact(
  admin: SupabaseClient,
  organizationId: string,
  contact: MessageContactInput,
  context: {
    familyId?: string | null;
    staffMemberId?: string | null;
    viewer: "parent" | "teacher" | "admin";
  },
): Promise<MessageParticipantInput[]> {
  if (context.viewer === "parent") {
    const familyIds = context.familyId ? [context.familyId] : [];
    if (!familyIds.length) throw new Error("No family found for this account.");
    return participantsFromContact(contact, { familyId: familyIds[0] });
  }

  if (context.viewer === "teacher") {
    if (!context.staffMemberId) throw new Error("Staff profile not found.");
    if (contact.kind === "family" && contact.familyId) {
      const { data: student, error } = await admin
        .from("students")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("family_id", contact.familyId)
        .eq("assigned_teacher_id", context.staffMemberId)
        .limit(1)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!student) throw new Error("You can only message families of your assigned students.");
    }
    return participantsFromContact(contact, {
      familyId: contact.familyId,
      staffMemberId: context.staffMemberId,
    });
  }

  if (contact.kind === "school_office") {
    throw new Error("Select a family to open the school office thread.");
  }

  if (contact.kind === "family" && contact.familyId) {
    return participantsFromContact(contact, { familyId: contact.familyId });
  }

  if (contact.kind === "staff_member" && contact.staffMemberId) {
    return participantsFromContact(contact, {
      staffMemberId: context.staffMemberId,
    });
  }

  throw new Error("Invalid contact.");
}

export async function sendMessageForViewer(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    organizationSlug: string;
    threadId: string;
    body: string;
    files?: File[];
    userId: string;
    viewer: "parent" | "teacher" | "admin";
    familyId?: string;
    staffMemberId?: string | null;
    schoolName: string;
    schoolOfficeLabel: string;
    skipNotifications?: boolean;
  },
) {
  const thread = await getThreadDetail(
    admin,
    input.organizationId,
    input.threadId,
    input.userId,
    input.schoolOfficeLabel,
    input.viewer,
  );
  if (!thread) throw new Error("Thread not found.");

  let senderKind: "guardian" | "staff_member" | "org_admin" = "staff_member";
  let senderGuardianId: string | null = null;
  let senderStaffMemberId: string | null = input.staffMemberId ?? null;

  if (input.viewer === "parent") {
    senderKind = "guardian";
    if (!input.familyId) throw new Error("No family found.");
    senderGuardianId = await getGuardianIdForUser(
      admin,
      input.userId,
      input.organizationId,
      input.familyId,
    );
    senderStaffMemberId = null;
  } else if (input.viewer === "admin") {
    const isAdmin = await userIsOrgAdmin(admin, input.userId, input.organizationId);
    if (!isAdmin) throw new Error("Admin access required.");
    const hasOffice = thread.participants.some((p) => p.kind === "school_office");
    senderKind = hasOffice ? "org_admin" : "staff_member";
    if (!senderStaffMemberId) {
      senderStaffMemberId = await getStaffMemberIdForUser(
        admin,
        input.userId,
        input.organizationId,
      );
    }
  }

  const message = await postPortalMessage(
    admin,
    {
      organizationId: input.organizationId,
      threadId: input.threadId,
      body: input.body,
      files: input.files,
      senderUserId: input.userId,
      senderKind,
      senderGuardianId,
      senderStaffMemberId,
    },
    {
      families: new Map(),
      staffMembers: new Map(),
      schoolOfficeLabel: input.schoolOfficeLabel,
      currentUserId: input.userId,
    },
  );

  await markThreadRead(admin, input.threadId, input.userId);

  if (!input.skipNotifications) {
    void dispatchMessageNotifications(admin, {
      organizationId: input.organizationId,
      organizationSlug: input.organizationSlug,
      schoolName: input.schoolName,
      threadId: input.threadId,
      senderUserId: input.userId,
      senderName: message.senderName,
      message,
      viewer: input.viewer,
    });
  }

  return message;
}

export {
  findOrCreateThread,
  getThreadDetail,
  markThreadRead,
  requireSchoolAdminUser,
  requireTeacherPortalUser,
  getStaffMemberIdForUser,
  getFamilyIdsForUser,
  userHasEnrolledAccess,
};
