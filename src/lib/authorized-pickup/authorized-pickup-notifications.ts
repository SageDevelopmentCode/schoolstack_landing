import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";

export type AuthorizedPickupNotificationAction = "created" | "updated" | "deleted";

function activityAction(action: AuthorizedPickupNotificationAction): string {
  switch (action) {
    case "created":
      return ACTIVITY_ACTIONS.AUTHORIZED_PICKUP_CONTACT_CREATED;
    case "deleted":
      return ACTIVITY_ACTIONS.AUTHORIZED_PICKUP_CONTACT_DELETED;
    default:
      return ACTIVITY_ACTIONS.AUTHORIZED_PICKUP_CONTACT_UPDATED;
  }
}

function summaryForAction(
  action: AuthorizedPickupNotificationAction,
  actorName: string,
  studentName: string,
  contactName: string,
): string {
  const verb =
    action === "created" ? "added" : action === "deleted" ? "removed" : "updated";
  return `${actorName} ${verb} an authorized pickup contact for ${studentName}: ${contactName}`;
}

type AuthorizedPickupNotificationInput = {
  organizationId: string;
  studentId: string;
  studentName: string;
  contactId: string;
  contactName: string;
  action: AuthorizedPickupNotificationAction;
  actorUserId: string;
  actorName: string;
  actorEmail: string;
  activityMetadata?: Record<string, unknown>;
};

export async function sendAuthorizedPickupContactNotifications(
  supabase: SupabaseClient,
  input: AuthorizedPickupNotificationInput,
): Promise<void> {
  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "parent",
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail,
    actorName: input.actorName,
    surface: "parent_portal",
    action: activityAction(input.action),
    entityType: "authorized_pickup_contact",
    entityId: input.contactId,
    summary: summaryForAction(
      input.action,
      input.actorName,
      input.studentName,
      input.contactName,
    ),
    metadata: {
      studentId: input.studentId,
      studentName: input.studentName,
      contactName: input.contactName,
      actorName: input.actorName,
      action: input.action,
      ...(input.activityMetadata ?? {}),
    },
  });
}
