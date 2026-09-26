import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { PortalRouteError } from "@/lib/api/portal-route-errors";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { userIsOrgAdmin } from "@/lib/admissions/application-auth";
import { dispatchMessageNotifications } from "@/lib/messages/message-notifications";
import {
  editPortalMessage,
  getGuardianIdForUser,
  postPortalMessage,
} from "@/lib/messages/messages";
import type { ParticipantDisplayContext } from "@/lib/messages/mappers";
import { getThreadDetail, markThreadRead } from "@/lib/messages/threads";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";

async function loadSenderDisplayContext(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    userId: string;
    schoolOfficeLabel: string;
    senderGuardianId: string | null;
    senderStaffMemberId: string | null;
  },
): Promise<ParticipantDisplayContext> {
  const guardians = new Map<
    string,
    {
      firstName: string;
      lastName: string;
      familyId?: string | null;
      profilePhotoUrl?: string | null;
    }
  >();
  const staffMembers = new Map<
    string,
    {
      firstName: string;
      lastName: string;
      roleTitle?: string | null;
      profilePhotoUrl?: string | null;
    }
  >();

  if (input.senderGuardianId) {
    const { data, error } = await admin
      .from("guardians")
      .select("id, first_name, last_name, family_id, profile_photo_url")
      .eq("organization_id", input.organizationId)
      .eq("id", input.senderGuardianId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (data) {
      guardians.set(String(data.id), {
        firstName: String(data.first_name ?? ""),
        lastName: String(data.last_name ?? ""),
        familyId: data.family_id ? String(data.family_id) : null,
        profilePhotoUrl:
          typeof data.profile_photo_url === "string" && data.profile_photo_url.trim()
            ? data.profile_photo_url.trim()
            : null,
      });
    }
  }

  if (input.senderStaffMemberId) {
    const { data, error } = await admin
      .from("staff_members")
      .select("id, first_name, last_name, role_title, profile_photo_url")
      .eq("organization_id", input.organizationId)
      .eq("id", input.senderStaffMemberId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (data) {
      staffMembers.set(String(data.id), {
        firstName: String(data.first_name ?? ""),
        lastName: String(data.last_name ?? ""),
        roleTitle: typeof data.role_title === "string" ? data.role_title : null,
        profilePhotoUrl:
          typeof data.profile_photo_url === "string" && data.profile_photo_url.trim()
            ? data.profile_photo_url.trim()
            : null,
      });
    }
  }

  return {
    families: new Map(),
    staffMembers,
    guardians,
    familyPrimaryGuardianIds: new Map(),
    familyFirstGuardianIds: new Map(),
    familyEnrolledStudents: new Map(),
    schoolOfficeLabel: input.schoolOfficeLabel,
    currentUserId: input.userId,
    viewerGuardianId: input.senderGuardianId,
  };
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
    activityMetadata?: Record<string, unknown>;
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
    if (!isAdmin) {
      throw new PortalRouteError("Admin access required.", 403, "forbidden");
    }
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

  const displayContext = await loadSenderDisplayContext(admin, {
    organizationId: input.organizationId,
    userId: input.userId,
    schoolOfficeLabel: input.schoolOfficeLabel,
    senderGuardianId,
    senderStaffMemberId,
  });

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
    displayContext,
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
      activityMetadata: input.activityMetadata,
    }).catch((err) => {
      void logNotificationFailure(admin, {
        organizationId: input.organizationId,
        operation: "messages.dispatch_notification",
        error: err,
        entityType: "message_thread",
        entityId: input.threadId,
      });
    });
  }

  return message;
}

export async function editMessageForViewer(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    threadId: string;
    messageId: string;
    body: string;
    userId: string;
    viewer: "parent" | "teacher" | "admin";
    schoolOfficeLabel: string;
    currentStaffMemberId?: string | null;
  },
) {
  const thread = await getThreadDetail(
    admin,
    input.organizationId,
    input.threadId,
    input.userId,
    input.schoolOfficeLabel,
    input.viewer,
    { currentStaffMemberId: input.currentStaffMemberId ?? null },
  );
  if (!thread) {
    throw new PortalRouteError("Thread not found.", 404, "not_found");
  }

  const existing = thread.messages.find((message) => message.id === input.messageId);
  if (!existing) {
    throw new PortalRouteError("Message not found.", 404, "not_found");
  }

  await editPortalMessage(admin, {
    organizationId: input.organizationId,
    threadId: input.threadId,
    messageId: input.messageId,
    userId: input.userId,
    body: input.body,
  });

  const updatedThread = await getThreadDetail(
    admin,
    input.organizationId,
    input.threadId,
    input.userId,
    input.schoolOfficeLabel,
    input.viewer,
    { currentStaffMemberId: input.currentStaffMemberId ?? null },
  );
  const message = updatedThread?.messages.find((item) => item.id === input.messageId);
  if (!message) {
    throw new Error("Message not found after update.");
  }

  return message;
}
