import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { PortalRouteError } from "@/lib/api/portal-route-errors";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { userIsOrgAdmin } from "@/lib/admissions/application-auth";
import { dispatchMessageNotifications } from "@/lib/messages/message-notifications";
import {
  getGuardianIdForUser,
  postPortalMessage,
} from "@/lib/messages/messages";
import { getThreadDetail, markThreadRead } from "@/lib/messages/threads";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";

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
      guardians: new Map(),
      familyPrimaryGuardianIds: new Map(),
      familyFirstGuardianIds: new Map(),
      familyEnrolledStudents: new Map(),
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
