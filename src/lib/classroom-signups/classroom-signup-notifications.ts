import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";

type ClassroomSignupNotificationInput = {
  organizationId: string;
  signupId: string;
  signupTitle: string;
  teacherName: string;
  staffMemberId: string;
  actorUserId: string;
  actorName: string;
  actorEmail: string;
};

type ClassroomSignupResponseNotificationInput = {
  organizationId: string;
  signupId: string;
  signupTitle: string;
  staffMemberId: string;
  familyName: string;
  studentName: string;
  actorUserId: string;
  actorName: string;
  actorEmail: string;
};

export async function sendClassroomSignupPublishedNotification(
  supabase: SupabaseClient,
  input: ClassroomSignupNotificationInput,
): Promise<void> {
  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "teacher",
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail,
    actorName: input.actorName,
    surface: "teacher_portal",
    action: ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_PUBLISHED,
    entityType: "classroom_signup",
    entityId: input.signupId,
    summary: `${input.teacherName} published "${input.signupTitle}"`,
    metadata: {
      signupId: input.signupId,
      signupTitle: input.signupTitle,
      teacherName: input.teacherName,
      staffMemberId: input.staffMemberId,
    },
  });
}

export async function sendClassroomSignupClosedNotification(
  supabase: SupabaseClient,
  input: ClassroomSignupNotificationInput,
): Promise<void> {
  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "teacher",
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail,
    actorName: input.actorName,
    surface: "teacher_portal",
    action: ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_CLOSED,
    entityType: "classroom_signup",
    entityId: input.signupId,
    summary: `${input.teacherName} closed "${input.signupTitle}"`,
    metadata: {
      signupId: input.signupId,
      signupTitle: input.signupTitle,
      teacherName: input.teacherName,
      staffMemberId: input.staffMemberId,
    },
  });
}

export async function sendClassroomSignupResponseSubmittedNotification(
  supabase: SupabaseClient,
  input: ClassroomSignupResponseNotificationInput,
): Promise<void> {
  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "parent",
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail,
    actorName: input.actorName,
    surface: "parent_portal",
    action: ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_RESPONSE_SUBMITTED,
    entityType: "classroom_signup",
    entityId: input.signupId,
    summary: `${input.familyName} signed up for "${input.signupTitle}" (${input.studentName})`,
    metadata: {
      signupId: input.signupId,
      signupTitle: input.signupTitle,
      staffMemberId: input.staffMemberId,
      familyName: input.familyName,
      studentName: input.studentName,
    },
  });
}
