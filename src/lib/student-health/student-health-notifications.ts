import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS, logActivityEvent, type ActorType } from "@/lib/activity-log";
import type { HealthItemType } from "@/lib/student-health/types";
import {
  healthItemLabel,
  healthItemTypeLabel,
} from "@/lib/student-health/types";

export type StudentHealthNotificationAction = "created" | "updated" | "deleted";

export type StudentHealthActorType = Extract<ActorType, "parent" | "school_admin" | "teacher">;

function activityAction(action: StudentHealthNotificationAction): string {
  switch (action) {
    case "created":
      return ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_CREATED;
    case "deleted":
      return ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_DELETED;
    default:
      return ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_UPDATED;
  }
}

function summaryForAction(
  action: StudentHealthNotificationAction,
  actorName: string,
  studentName: string,
  itemType: HealthItemType,
  itemLabel: string,
): string {
  const verb =
    action === "created" ? "added" : action === "deleted" ? "removed" : "updated";
  return `${actorName} ${verb} a ${healthItemTypeLabel(itemType)} for ${studentName}: ${itemLabel}`;
}

type StudentHealthNotificationInput = {
  organizationId: string;
  studentId: string;
  studentName: string;
  itemId: string;
  itemType: HealthItemType;
  payload: Record<string, unknown>;
  action: StudentHealthNotificationAction;
  actorType: StudentHealthActorType;
  actorUserId: string;
  actorName: string;
  actorEmail: string;
};

export async function sendStudentHealthItemNotifications(
  supabase: SupabaseClient,
  input: StudentHealthNotificationInput,
): Promise<void> {
  const itemLabel = healthItemLabel(input.itemType, input.payload);

  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: input.actorType,
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail,
    actorName: input.actorName,
    surface:
      input.actorType === "parent"
        ? "parent_portal"
        : input.actorType === "teacher"
          ? "teacher_portal"
          : "school_admin",
    action: activityAction(input.action),
    entityType: "student_health_item",
    entityId: input.itemId,
    summary: summaryForAction(
      input.action,
      input.actorName,
      input.studentName,
      input.itemType,
      itemLabel,
    ),
    metadata: {
      studentId: input.studentId,
      studentName: input.studentName,
      itemType: input.itemType,
      itemLabel,
      action: input.action,
    },
  });
}
