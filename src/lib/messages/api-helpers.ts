import type { SupabaseClient } from "@supabase/supabase-js";
import { PortalRouteError } from "@/lib/api/portal-route-errors";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { participantsFromContact, isParentPeerGuardianContact } from "@/lib/messages/participants-from-contact";
import { assertCoopPeerMessageAllowed } from "@/lib/messages/coop-peer-messaging";
import {
  findOrCreateThread,
  getThreadDetail,
  markThreadRead,
} from "@/lib/messages/threads";
import { assertSchoolAdminCanAccessThread } from "@/lib/messages/thread-access";
import type { ParentPortalAccess } from "@/lib/parent-portal/parent-portal-access-rpc";
import type { MessageContactInput, MessageParticipantInput } from "@/lib/messages/types";
import {
  getStaffMemberIdForUser,
} from "@/lib/staff/teacher-portal-access";
import { requireTeacherPortalUser } from "@/lib/staff/teacher-portal-access-server";
import { requireSchoolAdminUser } from "@/lib/school-admin/access";

/**
 * Thread access for a parent, using the access snapshot already loaded by `withParentPortalRoute`
 * (own guardian ids, linked family ids, enrolled access) so only the participants are read.
 * Returns the parent's primary family id.
 */
export async function assertParentCanAccessThread(
  admin: SupabaseClient,
  access: ParentPortalAccess,
  organizationId: string,
  threadId: string,
): Promise<string> {
  if (!access.hasEnrolledAccess) {
    throw new PortalRouteError("You do not have access to messages.", 403, "forbidden");
  }

  const familyIds = access.familyIds;
  if (familyIds.length === 0) throw new Error("No family found for this account.");

  const guardianIds = access.guardianIds;

  const { data: participants, error } = await admin
    .from("message_thread_participants")
    .select("family_id, guardian_id, participant_kind")
    .eq("thread_id", threadId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);

  const allowed = (participants ?? []).some((row) => {
    if (
      row.participant_kind === "guardian" &&
      row.guardian_id &&
      guardianIds.includes(String(row.guardian_id))
    ) {
      return true;
    }

    return (
      row.participant_kind === "family" &&
      row.family_id &&
      familyIds.includes(String(row.family_id))
    );
  });

  if (!allowed) {
    throw new PortalRouteError("You do not have access to this thread.", 403, "forbidden");
  }
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

  if (!allowed) {
    throw new PortalRouteError("You do not have access to this thread.", 403, "forbidden");
  }
}

export { assertSchoolAdminCanAccessThread };

export async function resolveParticipantsForContact(
  admin: SupabaseClient,
  organizationId: string,
  contact: MessageContactInput,
  context: {
    guardianId?: string | null;
    familyId?: string | null;
    staffMemberId?: string | null;
    programId?: string | null;
    viewer: "parent" | "teacher" | "admin";
  },
): Promise<MessageParticipantInput[]> {
  if (context.viewer === "parent") {
    if (!context.guardianId) {
      throw new Error("No guardian profile found for this account.");
    }
    if (
      isParentPeerGuardianContact(contact, {
        guardianId: context.guardianId,
      })
    ) {
      if (!context.programId?.trim() || !context.familyId) {
        throw new Error("Program context is required to message co-op families.");
      }
      await assertCoopPeerMessageAllowed(admin, {
        organizationId,
        programId: context.programId,
        fromFamilyId: context.familyId,
        toGuardianId: contact.guardianId!,
      });
    }
    return participantsFromContact(contact, { guardianId: context.guardianId });
  }

  if (context.viewer === "teacher") {
    if (!context.staffMemberId) throw new Error("Staff profile not found.");
    if (contact.kind === "platform_support") {
      return participantsFromContact(contact, {
        staffMemberId: context.staffMemberId,
      });
    }
    if (contact.kind === "guardian" && contact.guardianId) {
      const { data: guardian, error: guardianError } = await admin
        .from("guardians")
        .select("family_id")
        .eq("id", contact.guardianId)
        .eq("organization_id", organizationId)
        .maybeSingle();

      if (guardianError) throw new Error(guardianError.message);
      if (!guardian?.family_id) {
        throw new Error("You can only message guardians of your assigned students.");
      }

      const { data: assignment, error } = await admin
        .from("student_teacher_assignments")
        .select("id, students!inner(family_id)")
        .eq("organization_id", organizationId)
        .eq("staff_member_id", context.staffMemberId)
        .eq("students.family_id", guardian.family_id)
        .limit(1)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!assignment) {
        throw new Error("You can only message guardians of your assigned students.");
      }
    }
    return participantsFromContact(contact, {
      guardianId: contact.guardianId,
      staffMemberId: context.staffMemberId,
    });
  }

  if (contact.kind === "school_office") {
    throw new Error("Select a parent to open the school office thread.");
  }

  if (contact.kind === "guardian" && contact.guardianId) {
    return participantsFromContact(contact, {});
  }

  if (contact.kind === "staff_member" && contact.staffMemberId) {
    return participantsFromContact(contact, {
      staffMemberId: context.staffMemberId,
    });
  }

  throw new Error("Invalid contact.");
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
