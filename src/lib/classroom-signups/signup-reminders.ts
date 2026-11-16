import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import { buildEmailNotificationContext, sendClassroomSignupReminderEmail } from "@/lib/emails";
import { sendExpoPushToUsers } from "@/lib/notifications/expo-push";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import { resolveGuardianPushRecipientsForFamilies } from "@/lib/notifications/push-recipients";
import { parentClassroomSignupPath } from "@/lib/organization-settings/parent-routes";
import { getRuntimeSiteUrl } from "@/lib/site";
import { resolveAudienceFamilyIds } from "./audience";
import {
  familiesToRemind,
  reminderCooldownRemainingMs,
  validateReminderMessage,
} from "./signup-reminder-rules";
import type { ClassroomSignup, ClassroomSignupResponse } from "./types";
import { formatSignupDeadline } from "./utils";

export {
  familiesToRemind,
  reminderCooldownRemainingMs,
  validateReminderMessage,
  SIGNUP_REMINDER_COOLDOWN_MS,
  SIGNUP_REMINDER_MAX_MESSAGE_LENGTH,
} from "./signup-reminder-rules";

export type SendClassroomSignupReminderInput = {
  organizationId: string;
  signup: ClassroomSignup;
  responses: ClassroomSignupResponse[];
  message: string;
  teacherName: string;
  staffMemberId: string;
  actor: { userId: string; email: string; name: string };
  now?: Date;
};

export type ClassroomSignupReminderResult =
  | {
      status: "sent";
      familiesNotified: number;
      emailsAttempted: number;
      emailsSent: number;
      pushRecipients: number;
    }
  | { status: "nobody_to_remind" }
  | { status: "cooldown"; retryAfterMs: number }
  | { status: "invalid_message"; error: string };

type OrganizationContext = { name: string; slug: string };

export type ClassroomSignupReminderDeps = {
  findLastReminderAt?: (admin: SupabaseClient, organizationId: string, signupId: string) => Promise<string | null>;
  resolveAudienceFamilyIds?: typeof resolveAudienceFamilyIds;
  loadOrganization?: (admin: SupabaseClient, organizationId: string) => Promise<OrganizationContext | null>;
  loadFamilyNotificationEmails?: typeof loadFamilyNotificationEmails;
  sendEmail?: typeof sendClassroomSignupReminderEmail;
  resolvePushRecipients?: typeof resolveGuardianPushRecipientsForFamilies;
  sendPush?: typeof sendExpoPushToUsers;
  logActivity?: typeof logActivityEvent;
  logSettledNotificationFailures?: typeof logSettledNotificationFailures;
};

async function findLastReminderAtDefault(
  admin: SupabaseClient,
  organizationId: string,
  signupId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("activity_events")
    .select("created_at")
    .eq("organization_id", organizationId)
    .eq("action", ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_REMINDER_SENT)
    .eq("entity_id", signupId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.created_at ? String(data.created_at) : null;
}

async function loadOrganizationDefault(
  admin: SupabaseClient,
  organizationId: string,
): Promise<OrganizationContext | null> {
  const { data, error } = await admin.from("organizations").select("name, slug").eq("id", organizationId).maybeSingle();
  if (error) throw error;
  if (!data?.slug) return null;
  return { name: String(data.name ?? "Your school"), slug: String(data.slug) };
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1)}…`;
}

/**
 * Sends a teacher's reminder for an open classroom signup to the families in
 * its audience who haven't signed up yet: email (respecting each family's
 * notification addresses) + a push to linked guardians, then logs
 * `classroom_signup.reminder_sent`. At most one reminder per signup per hour.
 */
export async function sendClassroomSignupReminder(
  admin: SupabaseClient,
  input: SendClassroomSignupReminderInput,
  deps: ClassroomSignupReminderDeps = {},
): Promise<ClassroomSignupReminderResult> {
  const findLastReminderAt = deps.findLastReminderAt ?? findLastReminderAtDefault;
  const resolveAudience = deps.resolveAudienceFamilyIds ?? resolveAudienceFamilyIds;
  const loadOrganization = deps.loadOrganization ?? loadOrganizationDefault;
  const loadEmails = deps.loadFamilyNotificationEmails ?? loadFamilyNotificationEmails;
  const sendEmail = deps.sendEmail ?? sendClassroomSignupReminderEmail;
  const resolvePushRecipients = deps.resolvePushRecipients ?? resolveGuardianPushRecipientsForFamilies;
  const sendPush = deps.sendPush ?? sendExpoPushToUsers;
  const logActivity = deps.logActivity ?? logActivityEvent;
  const logFailures = deps.logSettledNotificationFailures ?? logSettledNotificationFailures;
  const now = input.now ?? new Date();
  const { signup, organizationId } = input;

  const validated = validateReminderMessage(input.message);
  if (!validated.ok) return { status: "invalid_message", error: validated.error };

  const lastSentAt = await findLastReminderAt(admin, organizationId, signup.id);
  const retryAfterMs = reminderCooldownRemainingMs(lastSentAt, now);
  if (retryAfterMs > 0) return { status: "cooldown", retryAfterMs };

  const audienceFamilyIds = await resolveAudience(admin, signup);
  const familyIds = familiesToRemind(audienceFamilyIds, input.responses);
  if (familyIds.length === 0) return { status: "nobody_to_remind" };

  const org = (await loadOrganization(admin, organizationId)) ?? { name: "Your school", slug: "" };
  const signupUrl = org.slug
    ? `${getRuntimeSiteUrl()}${parentClassroomSignupPath(org.slug, signup.id)}`
    : getRuntimeSiteUrl();
  const deadlineLabel = formatSignupDeadline(signup.responseDeadline);
  const notificationContext = buildEmailNotificationContext({
    organizationId,
    organizationSlug: org.slug,
    surface: "web",
    entityType: "classroom_signup",
    entityId: signup.id,
  });

  // Email: every notification address of every family still to sign up, once each.
  const seen = new Set<string>();
  const emailSends: Promise<{ ok: boolean }>[] = [];
  for (const familyId of familyIds) {
    const emails = await loadEmails(admin, familyId);
    for (const email of emails) {
      const normalized = email.trim().toLowerCase();
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      emailSends.push(
        sendEmail({
          to: normalized,
          schoolName: org.name,
          teacherName: input.teacherName,
          signupTitle: signup.title,
          message: validated.message,
          deadlineLabel,
          signupUrl,
          notificationContext,
        }),
      );
    }
  }

  // Push: linked guardians of those families.
  const pushRecipients = await resolvePushRecipients(admin, familyIds);
  const pushSends = pushRecipients.map((recipient) =>
    sendPush(admin, {
      organizationId,
      organizationName: org.name,
      userIds: [recipient.userId],
      title: `${org.name} — ${truncate(signup.title, 60)}`,
      body: truncate(validated.message, 160),
      recipientPortal: "parent",
      recipientEmail: recipient.email,
      notificationKind: "classroom_signup.reminder",
      failureOperation: "classroom_signup.reminder.expo_push",
      data: { kind: "classroom_signup", portal: "parent", organizationSlug: org.slug, signupId: signup.id },
    }),
  );

  const [emailResults, pushResults] = await Promise.all([Promise.allSettled(emailSends), Promise.allSettled(pushSends)]);
  await Promise.all([
    logFailures(
      admin,
      { organizationId, operation: "classroom_signup_reminder_email", entityType: "classroom_signup", entityId: signup.id },
      emailResults,
    ),
    logFailures(
      admin,
      {
        organizationId,
        operation: "classroom_signup.reminder.expo_push",
        entityType: "classroom_signup",
        entityId: signup.id,
        metadata: { recipientCount: pushRecipients.length },
      },
      pushResults,
    ),
  ]);

  const emailsSent = emailResults.filter((r) => r.status === "fulfilled" && r.value.ok).length;

  await logActivity(admin, {
    organizationId,
    actorType: "teacher",
    actorUserId: input.actor.userId,
    actorEmail: input.actor.email,
    actorName: input.actor.name,
    surface: "teacher_portal",
    action: ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_REMINDER_SENT,
    entityType: "classroom_signup",
    entityId: signup.id,
    summary: `${input.teacherName} sent a reminder for "${signup.title}" to ${familyIds.length} ${
      familyIds.length === 1 ? "family" : "families"
    }`,
    metadata: {
      signupId: signup.id,
      signupTitle: signup.title,
      staffMemberId: input.staffMemberId,
      familiesNotified: familyIds.length,
      emailsAttempted: emailSends.length,
      emailsSent,
      pushRecipients: pushRecipients.length,
    },
  });

  return {
    status: "sent",
    familiesNotified: familyIds.length,
    emailsAttempted: emailSends.length,
    emailsSent,
    pushRecipients: pushRecipients.length,
  };
}
