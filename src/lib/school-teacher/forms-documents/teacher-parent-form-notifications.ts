import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
  type ActivitySurface,
} from "@/lib/activity-log";
import { reportOperationalError } from "@/lib/operational-errors";
import { resolveFormAudienceFamilies } from "./audience";
import type { TeacherParentForm } from "./types";

type TeacherParentFormPublishedNotificationInput = {
  organizationId: string;
  form: TeacherParentForm;
  teacherName: string;
  staffMemberId: string;
  actorUserId: string;
  actorName: string;
  actorEmail: string;
};

type TeacherParentFormResponseSignedNotificationInput = {
  organizationId: string;
  formId: string;
  formTitle: string;
  staffMemberId: string;
  familyId: string;
  familyName: string;
  actorUserId: string;
  actorName: string;
  actorEmail: string;
};

export async function sendTeacherParentFormPublishedNotifications(
  supabase: SupabaseClient,
  input: TeacherParentFormPublishedNotificationInput,
): Promise<void> {
  const families = await resolveFormAudienceFamilies(
    supabase,
    input.organizationId,
    input.form.classroomIds,
  );

  if (families.length === 0) return;

  await Promise.all(
    families.map((family) =>
      logActivityEvent(supabase, {
        organizationId: input.organizationId,
        actorType: "teacher",
        actorUserId: input.actorUserId,
        actorEmail: input.actorEmail,
        actorName: input.actorName,
        surface: "teacher_portal",
        action: ACTIVITY_ACTIONS.TEACHER_PARENT_FORM_PUBLISHED,
        entityType: "teacher_parent_form",
        entityId: input.form.id,
        summary: `${input.teacherName} posted "${input.form.title}" for your family to sign`,
        metadata: {
          familyId: family.familyId,
          formId: input.form.id,
          formTitle: input.form.title,
          teacherName: input.teacherName,
          staffMemberId: input.staffMemberId,
          dueDate: input.form.dueDate,
        },
      }),
    ),
  );
}

export async function sendTeacherParentFormResponseSignedNotification(
  supabase: SupabaseClient,
  input: TeacherParentFormResponseSignedNotificationInput,
): Promise<void> {
  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "parent",
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail,
    actorName: input.actorName,
    surface: "parent_portal",
    action: ACTIVITY_ACTIONS.TEACHER_PARENT_FORM_RESPONSE_SIGNED,
    entityType: "teacher_parent_form",
    entityId: input.formId,
    summary: `${input.familyName} signed "${input.formTitle}"`,
    metadata: {
      staffMemberId: input.staffMemberId,
      formId: input.formId,
      formTitle: input.formTitle,
      familyId: input.familyId,
      familyName: input.familyName,
    },
  });
}

export function fireTeacherParentFormActivityNotification(
  supabase: SupabaseClient,
  promise: Promise<void>,
  input: {
    organizationId: string;
    formId: string;
    operation: string;
    surface: ActivitySurface;
    actorType: "parent" | "teacher";
    actorUserId: string;
    actorEmail: string;
  },
): void {
  void promise.catch((err) => {
    void reportOperationalError({
      supabase,
      surface: input.surface,
      organizationId: input.organizationId,
      operation: input.operation,
      error:
        err instanceof Error
          ? err.message
          : "Failed to record teacher parent form activity notification.",
      entityType: "teacher_parent_form",
      entityId: input.formId,
      actor: {
        type: input.actorType,
        userId: input.actorUserId,
        email: input.actorEmail,
      },
      cause: err,
    });
  });
}
