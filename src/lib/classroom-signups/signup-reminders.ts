import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  logOutboundEmailSettledFailures,
  logSettledNotificationFailures,
} from "@/lib/admissions/notification-logging";
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
  SIGNUP_REMINDER_COOLDOWN_MS,
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
  | { status: "invalid_message"; error: string }
  | { status: "delivery_failed"; error: string };

type OrganizationContext = { name: string; slug: string };

export type ClassroomSignupReminderClaimResult =
  | { claimed: true; previousLastSentAt: string | null; claimedAt: string }
  | { claimed: false; retryAfterMs: number };

export type ClassroomSignupReminderDeps = {
  claimReminderWindow?: (
    admin: SupabaseClient,
    organizationId: string,
    signupId: string,
    now: Date,
  ) => Promise<ClassroomSignupReminderClaimResult>;
  revertReminderClaim?: (
    admin: SupabaseClient,
    organizationId: string,
    signupId: string,
    claimedAt: string,
    previousLastSentAt: string | null,
  ) => Promise<void>;
  resolveAudienceFamilyIds?: typeof resolveAudienceFamilyIds;
  loadOrganization?: (admin: SupabaseClient, organizationId: string) => Promise<OrganizationContext | null>;
  loadFamilyNotificationEmails?: typeof loadFamilyNotificationEmails;
  sendEmail?: typeof sendClassroomSignupReminderEmail;
  resolvePushRecipients?: typeof resolveGuardianPushRecipientsForFamilies;
  sendPush?: typeof sendExpoPushToUsers;
  logActivity?: typeof logActivityEvent;
  logSettledNotificationFailures?: typeof logSettledNotificationFailures;
  logOutboundEmailSettledFailures?: typeof logOutboundEmailSettledFailures;
};

async function readSignupLastReminderSentAt(
  admin: SupabaseClient,
  organizationId: string,
  signupId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("classroom_signups")
    .select("last_reminder_sent_at")
    .eq("id", signupId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw error;
  return data?.last_reminder_sent_at ? String(data.last_reminder_sent_at) : null;
}

async function claimClassroomSignupReminderWindowDefault(
  admin: SupabaseClient,
  organizationId: string,
  signupId: string,
  now: Date,
): Promise<ClassroomSignupReminderClaimResult> {
  const claimedAt = now.toISOString();
  const cooldownCutoff = new Date(now.getTime() - SIGNUP_REMINDER_COOLDOWN_MS).toISOString();
  const previousLastSentAt = await readSignupLastReminderSentAt(admin, organizationId, signupId);

  const { data: claimedRows, error: claimError } = await admin
    .from("classroom_signups")
    .update({ last_reminder_sent_at: claimedAt })
    .eq("id", signupId)
    .eq("organization_id", organizationId)
    .or(`last_reminder_sent_at.is.null,last_reminder_sent_at.lt.${cooldownCutoff}`)
    .select("id");

  if (claimError) throw claimError;
  if (!claimedRows?.length) {
    const lastSentAt = await readSignupLastReminderSentAt(admin, organizationId, signupId);
    return { claimed: false, retryAfterMs: reminderCooldownRemainingMs(lastSentAt, now) };
  }

  return { claimed: true, previousLastSentAt, claimedAt };
}

async function revertClassroomSignupReminderClaimDefault(
  admin: SupabaseClient,
  organizationId: string,
  signupId: string,
  claimedAt: string,
  previousLastSentAt: string | null,
): Promise<void> {
  const { error } = await admin
    .from("classroom_signups")
    .update({ last_reminder_sent_at: previousLastSentAt })
    .eq("id", signupId)
    .eq("organization_id", organizationId)
    .eq("last_reminder_sent_at", claimedAt);
  if (error) throw error;
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
  const claimReminderWindow = deps.claimReminderWindow ?? claimClassroomSignupReminderWindowDefault;
  const revertReminderClaim = deps.revertReminderClaim ?? revertClassroomSignupReminderClaimDefault;
  const resolveAudience = deps.resolveAudienceFamilyIds ?? resolveAudienceFamilyIds;
  const loadOrganization = deps.loadOrganization ?? loadOrganizationDefault;
  const loadEmails = deps.loadFamilyNotificationEmails ?? loadFamilyNotificationEmails;
  const sendEmail = deps.sendEmail ?? sendClassroomSignupReminderEmail;
  const resolvePushRecipients = deps.resolvePushRecipients ?? resolveGuardianPushRecipientsForFamilies;
  const sendPush = deps.sendPush ?? sendExpoPushToUsers;
  const logActivity = deps.logActivity ?? logActivityEvent;
  const logPushFailures = deps.logSettledNotificationFailures ?? logSettledNotificationFailures;
  const logEmailFailures = deps.logOutboundEmailSettledFailures ?? logOutboundEmailSettledFailures;
  const now = input.now ?? new Date();
  const { signup, organizationId } = input;

  const validated = validateReminderMessage(input.message);
  if (!validated.ok) return { status: "invalid_message", error: validated.error };

  const audienceFamilyIds = await resolveAudience(admin, signup);
  const familyIds = familiesToRemind(audienceFamilyIds, input.responses);
  if (familyIds.length === 0) return { status: "nobody_to_remind" };

  const claim = await claimReminderWindow(admin, organizationId, signup.id, now);
  if (!claim.claimed) return { status: "cooldown", retryAfterMs: claim.retryAfterMs };

  // Resolve every recipient before any delivery starts. If a lookup fails we
  // release the hourly claim, which is only safe while nothing has been sent.
  let org: OrganizationContext;
  let emailRecipients: string[];
  let pushRecipients: Awaited<ReturnType<typeof resolveGuardianPushRecipientsForFamilies>>;

  try {
    org = (await loadOrganization(admin, organizationId)) ?? { name: "Your school", slug: "" };

    // Email: every notification address of every family still to sign up, once each.
    const seen = new Set<string>();
    emailRecipients = [];
    for (const familyId of familyIds) {
      const emails = await loadEmails(admin, familyId);
      for (const email of emails) {
        const normalized = email.trim().toLowerCase();
        if (!normalized || seen.has(normalized)) continue;
        seen.add(normalized);
        emailRecipients.push(normalized);
      }
    }

    // Push: linked guardians of those families.
    pushRecipients = await resolvePushRecipients(admin, familyIds);
  } catch (error) {
    await revertReminderClaim(admin, organizationId, signup.id, claim.claimedAt, claim.previousLastSentAt);
    throw error;
  }

  // Delivery has started from here on: keep the claim so a retry can't send duplicates.
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

  const emailSends = emailRecipients.map((to) =>
    sendEmail({
      to,
      schoolName: org.name,
      teacherName: input.teacherName,
      signupTitle: signup.title,
      message: validated.message,
      deadlineLabel,
      signupUrl,
      notificationContext,
    }),
  );
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
    logEmailFailures(
      admin,
      {
        organizationId,
        operation: "classroom_signup_reminder_email",
        entityType: "classroom_signup",
        entityId: signup.id,
      },
      emailResults,
    ),
    logPushFailures(
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
  const pushSent = pushResults.reduce((total, result) => {
    if (result.status !== "fulfilled") return total;
    return total + result.value.sentCount;
  }, 0);

  if (emailsSent === 0 && pushSent === 0) {
    await revertReminderClaim(admin, organizationId, signup.id, claim.claimedAt, claim.previousLastSentAt);
    return {
      status: "delivery_failed",
      error: "We couldn't deliver the reminder to any families. Try again in a moment.",
    };
  }

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
