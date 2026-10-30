import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import type { MobilePushNotificationKind } from "@/lib/notifications/mobile-push-catalog";
import { sendExpoPushToUsers } from "@/lib/notifications/expo-push";
import { resolveFamilyGuardianPushRecipients } from "@/lib/notifications/push-recipients";
import { reportOperationalError } from "@/lib/operational-errors";
export {
  shouldSendAttendancePickupPush,
  shouldSendAttendancePresentPush,
} from "@/lib/school-admin/attendance/attendance-push-gating";

async function loadAttendancePushContext(
  admin: SupabaseClient,
  organizationId: string,
  studentId: string,
): Promise<{ organizationName: string; organizationSlug: string; studentName: string } | null> {
  const [{ data: org, error: orgError }, { data: student, error: studentError }] =
    await Promise.all([
      admin
        .from("organizations")
        .select("name, slug")
        .eq("id", organizationId)
        .maybeSingle(),
      admin
        .from("students")
        .select("first_name, last_name, preferred_name")
        .eq("id", studentId)
        .eq("organization_id", organizationId)
        .maybeSingle(),
    ]);

  if (orgError) throw orgError;
  if (studentError) throw studentError;
  if (!org?.slug || !student) return null;

  const preferred =
    typeof student.preferred_name === "string" ? student.preferred_name.trim() : "";
  const first =
    typeof student.first_name === "string" ? student.first_name.trim() : "";
  const last = typeof student.last_name === "string" ? student.last_name.trim() : "";
  const studentName =
    preferred || [first, last].filter(Boolean).join(" ") || "Your child";

  return {
    organizationName: String(org.name ?? "Your school"),
    organizationSlug: String(org.slug),
    studentName,
  };
}

async function sendAttendancePushToFamily(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    studentId: string;
    notificationKind: MobilePushNotificationKind;
    intent: "present" | "pickup";
    titleSuffix: string;
    body: string;
    failureOperation: string;
  },
): Promise<void> {
  const context = await loadAttendancePushContext(
    admin,
    input.organizationId,
    input.studentId,
  );
  if (!context) return;

  const recipients = await resolveFamilyGuardianPushRecipients(admin, input.familyId);
  if (recipients.length === 0) return;

  const title = `${context.organizationName} — ${input.titleSuffix}`;

  const results = await Promise.allSettled(
    recipients.map((recipient) =>
      sendExpoPushToUsers(admin, {
        organizationId: input.organizationId,
        organizationName: context.organizationName,
        userIds: [recipient.userId],
        title,
        body: input.body,
        channelId: "attendance",
        recipientPortal: "parent",
        recipientEmail: recipient.email,
        notificationKind: input.notificationKind,
        failureOperation: input.failureOperation,
        data: {
          kind: "attendance",
          portal: "parent",
          organizationSlug: context.organizationSlug,
          studentId: input.studentId,
          intent: input.intent,
        },
      }),
    ),
  );

  await logSettledNotificationFailures(
    admin,
    {
      organizationId: input.organizationId,
      operation: input.failureOperation,
      entityType: "student",
      entityId: input.studentId,
      metadata: { familyId: input.familyId, intent: input.intent },
    },
    results,
  );
}

export async function sendAttendancePresentParentExpoPush(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    studentId: string;
  },
): Promise<void> {
  const context = await loadAttendancePushContext(
    admin,
    input.organizationId,
    input.studentId,
  );
  if (!context) return;

  await sendAttendancePushToFamily(admin, {
    organizationId: input.organizationId,
    familyId: input.familyId,
    studentId: input.studentId,
    notificationKind: "attendance.present",
    intent: "present",
    titleSuffix: "Attendance",
    body: `${context.studentName} was marked present today.`,
    failureOperation: "attendance.present.expo_push",
  });
}

export function fireAttendanceParentExpoPush(
  admin: SupabaseClient,
  promise: Promise<void>,
  input: {
    organizationId: string;
    studentId: string;
    operation: string;
  },
): void {
  void promise.catch((err) => {
    void reportOperationalError({
      supabase: admin,
      surface: "system",
      organizationId: input.organizationId,
      operation: input.operation,
      error:
        err instanceof Error
          ? err.message
          : "Failed to send attendance push notification.",
      entityType: "student",
      entityId: input.studentId,
      actor: { type: "system" },
      cause: err,
    });
  });
}

export async function sendAttendancePickupParentExpoPush(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    studentId: string;
    pickedUpByName?: string | null;
  },
): Promise<void> {
  const context = await loadAttendancePushContext(
    admin,
    input.organizationId,
    input.studentId,
  );
  if (!context) return;

  const pickupName = input.pickedUpByName?.trim();
  const body = pickupName
    ? `${context.studentName} was picked up by ${pickupName}.`
    : `${context.studentName} was picked up.`;

  await sendAttendancePushToFamily(admin, {
    organizationId: input.organizationId,
    familyId: input.familyId,
    studentId: input.studentId,
    notificationKind: "attendance.pickup",
    intent: "pickup",
    titleSuffix: "Pickup",
    body,
    failureOperation: "attendance.pickup.expo_push",
  });
}

