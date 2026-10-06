import type { SupabaseClient } from "@supabase/supabase-js";
import { sendIncompleteAdmissionsReminders } from "@/lib/admissions/incomplete-admissions-reminders";
import type { ScheduledVisitRemindersResult } from "@/lib/admissions/scheduled-visit-reminders";
import { sendScheduledVisitRemindersForOrganization } from "@/lib/admissions/scheduled-visit-reminders";
import { messageFromCause } from "@/lib/api/error-serialization";
import { notifyTuitionBillingCronSummary } from "@/lib/discord";
import { runActivityEventsRetentionSafely } from "@/lib/activity-events-retention";
import { reportOperationalError } from "@/lib/operational-errors";
import { markOverdueCharges } from "@/lib/tuition/charge-generator";
import { processAutopayForOrganization } from "@/lib/tuition/autopay";
import {
  applyLateFeesForOrganization,
  getGraceDaysForSettings,
  getReminderDaysForSettings,
} from "@/lib/tuition/late-fees";
import { getTuitionOrgSettings } from "@/lib/tuition/org-settings";
import {
  ACTIVITY_ACTIONS,
  logTuitionActivity,
  summarizeBillingRunSummary,
  systemActivityContext,
} from "@/lib/tuition/tuition-activity";
import {
  AUTOPAY_LINES_GLOBAL_CAP,
  mergeAutopayLines,
  type AutopayLineItem,
} from "@/lib/tuition/autopay-cron-report";
import { sendCommitteeDailyDigestsForOrganization } from "@/lib/committees/daily-digest";
import type { CommitteeUnreadWorkspaceDigestResult } from "@/lib/committees/unread-workspace-digest";
import type { UnreadMessageDigestResult } from "@/lib/messages/unread-message-digest-types";
import { sendAutopayUpcomingReminders } from "@/lib/tuition/autopay-reminders";
import { sendTuitionDueReminders } from "@/lib/tuition/reminders";
import { evaluateRulesForOrganization } from "@/lib/tuition/rules-engine";
import {
  sendPendingScheduledBulletinEmailsForOrganization,
  type PendingBulletinEmailCronResult,
} from "@/lib/school-bulletin/bulletin-notifications";

const FAILED_ORGANIZATION_IDS_CAP = 10;

export type TuitionBillingCronSummary = {
  organizations: number;
  organizationFailures: number;
  failedOrganizationIds: string[];
  overdueCount: number;
  remindersSent: number;
  autopayRemindersSent: number;
  incompleteAdmissionsRemindersSent: number;
  rulesEvaluated: number;
  lateFeesApplied: number;
  lateFeesNotified: number;
  autopayProcessed: number;
  autopayFailed: number;
  autopaySkipped: number;
  autopayDueCandidates: number;
  autopayLines: AutopayLineItem[];
  autopayLinesTruncated: boolean;
  committeeDigestsSent: number;
  committeeDigestFailures: number;
  unreadMessageDigestsSent: number;
  unreadMessageDigestFailures: number;
  committeeUnreadWorkspaceDigestsSent: number;
  committeeUnreadWorkspaceDigestFailures: number;
  scheduledVisitParentRemindersSent: number;
  scheduledVisitAdminWeeklyDigestsSent: number;
  scheduledVisitAdminDayBeforeDigestsSent: number;
  scheduledVisitReminderFailures: number;
  bulletinEmailsSent: number;
  bulletinEmailFailures: number;
  activityEventsRetentionMonths?: number;
  activityEventsRetentionWarnDays?: number;
  activityEventsRetentionCutoff?: string | null;
  activityEventsApproachingCount?: number;
  activityEventsOldestApproachingAt?: string | null;
  activityEventsPurged?: number;
  activityEventsPurgeTruncated?: boolean;
};

export type TuitionBillingCronDeps = {
  listLiveOrganizationIds?: (admin: SupabaseClient) => Promise<string[]>;
  getTuitionOrgSettings?: typeof getTuitionOrgSettings;
  markOverdueCharges?: typeof markOverdueCharges;
  sendTuitionDueReminders?: typeof sendTuitionDueReminders;
  sendAutopayUpcomingReminders?: typeof sendAutopayUpcomingReminders;
  sendIncompleteAdmissionsReminders?: typeof sendIncompleteAdmissionsReminders;
  applyLateFeesForOrganization?: typeof applyLateFeesForOrganization;
  evaluateRulesForOrganization?: typeof evaluateRulesForOrganization;
  processAutopayForOrganization?: typeof processAutopayForOrganization;
  notifySummary?: typeof notifyTuitionBillingCronSummary;
  sendCommitteeDailyDigestsForOrganization?: typeof sendCommitteeDailyDigestsForOrganization;
  sendUnreadMessageDigestsForOrganization?: (
    admin: SupabaseClient,
    organizationId: string,
  ) => Promise<UnreadMessageDigestResult>;
  sendCommitteeUnreadWorkspaceDigestsForOrganization?: (
    admin: SupabaseClient,
    organizationId: string,
  ) => Promise<CommitteeUnreadWorkspaceDigestResult>;
  sendScheduledVisitRemindersForOrganization?: (
    admin: SupabaseClient,
    organizationId: string,
  ) => Promise<ScheduledVisitRemindersResult>;
  sendPendingScheduledBulletinEmailsForOrganization?: (
    admin: SupabaseClient,
    organizationId: string,
  ) => Promise<PendingBulletinEmailCronResult>;
  runActivityEventsRetention?: typeof runActivityEventsRetentionSafely;
};

export function authorizeTuitionBillingCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

async function defaultListLiveOrganizationIds(
  admin: SupabaseClient,
): Promise<string[]> {
  const { data: organizations, error } = await admin
    .from("organizations")
    .select("id")
    .eq("status", "live");

  if (error) throw error;
  return (organizations ?? []).map((organization) => String(organization.id));
}

export async function runTuitionBillingCron(
  admin: SupabaseClient,
  deps: TuitionBillingCronDeps = {},
): Promise<TuitionBillingCronSummary> {
  const listLiveOrganizationIds =
    deps.listLiveOrganizationIds ?? defaultListLiveOrganizationIds;
  const loadSettings = deps.getTuitionOrgSettings ?? getTuitionOrgSettings;
  const markOverdue = deps.markOverdueCharges ?? markOverdueCharges;
  const sendReminders = deps.sendTuitionDueReminders ?? sendTuitionDueReminders;
  const sendAutopayReminders =
    deps.sendAutopayUpcomingReminders ?? sendAutopayUpcomingReminders;
  const sendIncompleteAdmissionsRemindersFn =
    deps.sendIncompleteAdmissionsReminders ?? sendIncompleteAdmissionsReminders;
  const applyLateFees =
    deps.applyLateFeesForOrganization ?? applyLateFeesForOrganization;
  const evaluateRules = deps.evaluateRulesForOrganization ?? evaluateRulesForOrganization;
  const processAutopay = deps.processAutopayForOrganization ?? processAutopayForOrganization;
  const notifySummary = deps.notifySummary ?? notifyTuitionBillingCronSummary;
  const sendCommitteeDailyDigests =
    deps.sendCommitteeDailyDigestsForOrganization ??
    sendCommitteeDailyDigestsForOrganization;
  const sendUnreadMessageDigests =
    deps.sendUnreadMessageDigestsForOrganization ??
    (async (adminClient, organizationId) => {
      const { sendUnreadMessageDigestsForOrganization } = await import(
        "@/lib/messages/unread-message-digest"
      );
      return sendUnreadMessageDigestsForOrganization(adminClient, organizationId);
    });
  const sendCommitteeUnreadWorkspaceDigests =
    deps.sendCommitteeUnreadWorkspaceDigestsForOrganization ??
    (async (adminClient, organizationId) => {
      const { sendCommitteeUnreadWorkspaceDigestsForOrganization } = await import(
        "@/lib/committees/unread-workspace-digest"
      );
      return sendCommitteeUnreadWorkspaceDigestsForOrganization(
        adminClient,
        organizationId,
      );
    });
  const sendScheduledVisitReminders =
    deps.sendScheduledVisitRemindersForOrganization ??
    sendScheduledVisitRemindersForOrganization;
  const sendPendingBulletinEmails =
    deps.sendPendingScheduledBulletinEmailsForOrganization ??
    sendPendingScheduledBulletinEmailsForOrganization;

  const organizationIds = await listLiveOrganizationIds(admin);

  let overdueCount = 0;
  let remindersSent = 0;
  let autopayRemindersSent = 0;
  let incompleteAdmissionsRemindersSent = 0;
  let rulesEvaluated = 0;
  let lateFeesApplied = 0;
  let lateFeesNotified = 0;
  let autopayProcessed = 0;
  let autopayFailed = 0;
  let autopaySkipped = 0;
  let autopayDueCandidates = 0;
  let autopayLines: AutopayLineItem[] = [];
  let autopayLinesTruncated = false;
  let organizationFailures = 0;
  let committeeDigestsSent = 0;
  let committeeDigestFailures = 0;
  let unreadMessageDigestsSent = 0;
  let unreadMessageDigestFailures = 0;
  let committeeUnreadWorkspaceDigestsSent = 0;
  let committeeUnreadWorkspaceDigestFailures = 0;
  let scheduledVisitParentRemindersSent = 0;
  let scheduledVisitAdminWeeklyDigestsSent = 0;
  let scheduledVisitAdminDayBeforeDigestsSent = 0;
  let scheduledVisitReminderFailures = 0;
  let bulletinEmailsSent = 0;
  let bulletinEmailFailures = 0;
  const failedOrganizationIds: string[] = [];

  for (const organizationId of organizationIds) {
    try {
      const settings = await loadSettings(admin, organizationId);
      const graceDays = getGraceDaysForSettings(settings);
      const reminderDaysList = getReminderDaysForSettings(settings);

      const orgOverdue = await markOverdue(admin, organizationId, graceDays);
      overdueCount += orgOverdue;

      let orgReminders = 0;
      for (const reminderDays of reminderDaysList) {
        const sent = await sendReminders(admin, organizationId, reminderDays);
        orgReminders += sent;
        remindersSent += sent;
      }

      const orgAutopayReminders = await sendAutopayReminders(admin, organizationId);
      autopayRemindersSent += orgAutopayReminders;

      const orgIncompleteAdmissionsReminders =
        await sendIncompleteAdmissionsRemindersFn(admin, organizationId);
      incompleteAdmissionsRemindersSent += orgIncompleteAdmissionsReminders;

      const orgRules = await evaluateRules(admin, organizationId);
      rulesEvaluated += orgRules;

      const lateFeeResult = await applyLateFees(admin, organizationId);
      lateFeesApplied += lateFeeResult.applied;
      lateFeesNotified += lateFeeResult.notified;

      const autopayResult = await processAutopay(admin, organizationId);
      autopayProcessed += autopayResult.processed;
      autopayFailed += autopayResult.failed;
      autopaySkipped += autopayResult.skipped;
      autopayDueCandidates += autopayResult.dueCandidates;
      const merged = mergeAutopayLines(
        autopayLines,
        autopayResult.lines,
        AUTOPAY_LINES_GLOBAL_CAP,
      );
      autopayLines = merged.lines;
      autopayLinesTruncated =
        autopayLinesTruncated || autopayResult.truncated || merged.truncated;

      void logTuitionActivity(admin, {
        organizationId,
        action: ACTIVITY_ACTIONS.TUITION_BILLING_RUN_COMPLETED,
        entityType: "organization",
        entityId: organizationId,
        summary: "Tuition billing run completed",
        changeSummary: summarizeBillingRunSummary({
          overdueCount: orgOverdue,
          remindersSent: orgReminders,
          rulesEvaluated: orgRules,
          lateFeesApplied: lateFeeResult.applied,
          lateFeesNotified: lateFeeResult.notified,
          autopayProcessed: autopayResult.processed,
          autopayFailed: autopayResult.failed,
          autopaySkipped: autopayResult.skipped,
        }),
        logWhenEmpty: true,
        context: systemActivityContext(),
      });

      if (lateFeeResult.applied > 0) {
        void logTuitionActivity(admin, {
          organizationId,
          action: ACTIVITY_ACTIONS.TUITION_LATE_FEE_APPLIED,
          entityType: "organization",
          entityId: organizationId,
          summary: `Applied ${lateFeeResult.applied} late fee${lateFeeResult.applied === 1 ? "" : "s"}`,
          changeSummary: {
            changedFields: ["lateFees"],
            changes: [
              `Applied ${lateFeeResult.applied} late fee${lateFeeResult.applied === 1 ? "" : "s"}`,
            ],
          },
          logWhenEmpty: true,
          context: systemActivityContext(),
        });
      }

      try {
        const digestResult = await sendCommitteeDailyDigests(admin, organizationId);
        committeeDigestsSent += digestResult.digestsSent;
        committeeDigestFailures += digestResult.digestFailures;
      } catch (error) {
        committeeDigestFailures += 1;
        void reportOperationalError({
          supabase: admin,
          surface: "system",
          organizationId,
          operation: "committee_daily_digest_cron.organization",
          error:
            messageFromCause(error) ??
            "Committee daily digest cron failed for organization",
          entityType: "organization",
          entityId: organizationId,
          actor: { type: "system" },
          cause: error,
        });
      }

      try {
        const unreadDigestResult = await sendUnreadMessageDigests(
          admin,
          organizationId,
        );
        unreadMessageDigestsSent += unreadDigestResult.digestsSent;
        unreadMessageDigestFailures += unreadDigestResult.digestFailures;
      } catch (error) {
        unreadMessageDigestFailures += 1;
        void reportOperationalError({
          supabase: admin,
          surface: "system",
          organizationId,
          operation: "messages_unread_digest_cron.organization",
          error:
            messageFromCause(error) ??
            "Unread message digest cron failed for organization",
          entityType: "organization",
          entityId: organizationId,
          actor: { type: "system" },
          cause: error,
        });
      }

      try {
        const committeeUnreadDigestResult = await sendCommitteeUnreadWorkspaceDigests(
          admin,
          organizationId,
        );
        committeeUnreadWorkspaceDigestsSent += committeeUnreadDigestResult.digestsSent;
        committeeUnreadWorkspaceDigestFailures +=
          committeeUnreadDigestResult.digestFailures;
      } catch (error) {
        committeeUnreadWorkspaceDigestFailures += 1;
        void reportOperationalError({
          supabase: admin,
          surface: "system",
          organizationId,
          operation: "committee_unread_workspace_digest_cron.organization",
          error:
            messageFromCause(error) ??
            "Committee unread workspace digest cron failed for organization",
          entityType: "organization",
          entityId: organizationId,
          actor: { type: "system" },
          cause: error,
        });
      }

      try {
        const visitReminderResult = await sendScheduledVisitReminders(
          admin,
          organizationId,
        );
        scheduledVisitParentRemindersSent +=
          visitReminderResult.parentRemindersSent;
        scheduledVisitAdminWeeklyDigestsSent +=
          visitReminderResult.adminWeeklyDigestsSent;
        scheduledVisitAdminDayBeforeDigestsSent +=
          visitReminderResult.adminDayBeforeDigestsSent;
        scheduledVisitReminderFailures += visitReminderResult.failures;
      } catch (error) {
        scheduledVisitReminderFailures += 1;
        void reportOperationalError({
          supabase: admin,
          surface: "system",
          organizationId,
          operation: "scheduled_visit_reminders_cron.organization",
          error:
            messageFromCause(error) ??
            "Scheduled visit reminders cron failed for organization",
          entityType: "organization",
          entityId: organizationId,
          actor: { type: "system" },
          cause: error,
        });
      }

      try {
        const bulletinResult = await sendPendingBulletinEmails(admin, organizationId);
        bulletinEmailsSent += bulletinResult.emailsSucceeded;
        bulletinEmailFailures += bulletinResult.failures;
      } catch (error) {
        bulletinEmailFailures += 1;
        void reportOperationalError({
          supabase: admin,
          surface: "system",
          organizationId,
          operation: "bulletin_published_email_cron.organization",
          error:
            messageFromCause(error) ??
            "Bulletin published email cron failed for organization",
          entityType: "organization",
          entityId: organizationId,
          actor: { type: "system" },
          cause: error,
        });
      }
    } catch (error) {
      organizationFailures += 1;
      if (failedOrganizationIds.length < FAILED_ORGANIZATION_IDS_CAP) {
        failedOrganizationIds.push(organizationId);
      }

      void reportOperationalError({
        supabase: admin,
        surface: "system",
        organizationId,
        operation: "tuition_billing_cron.organization",
        error:
          messageFromCause(error) ??
          "Tuition billing cron failed for organization",
        entityType: "organization",
        entityId: organizationId,
        actor: { type: "system" },
        cause: error,
      });
    }
  }

  const summary: TuitionBillingCronSummary = {
    organizations: organizationIds.length,
    organizationFailures,
    failedOrganizationIds,
    overdueCount,
    remindersSent,
    autopayRemindersSent,
    incompleteAdmissionsRemindersSent,
    rulesEvaluated,
    lateFeesApplied,
    lateFeesNotified,
    autopayProcessed,
    autopayFailed,
    autopaySkipped,
    autopayDueCandidates,
    autopayLines,
    autopayLinesTruncated,
    committeeDigestsSent,
    committeeDigestFailures,
    unreadMessageDigestsSent,
    unreadMessageDigestFailures,
    committeeUnreadWorkspaceDigestsSent,
    committeeUnreadWorkspaceDigestFailures,
    scheduledVisitParentRemindersSent,
    scheduledVisitAdminWeeklyDigestsSent,
    scheduledVisitAdminDayBeforeDigestsSent,
    scheduledVisitReminderFailures,
    bulletinEmailsSent,
    bulletinEmailFailures,
  };

  const runRetention =
    deps.runActivityEventsRetention ?? runActivityEventsRetentionSafely;
  const retentionResult = await runRetention(admin);
  if (retentionResult) {
    summary.activityEventsRetentionMonths =
      retentionResult.approaching.retentionMonths;
    summary.activityEventsRetentionWarnDays =
      retentionResult.approaching.warnDays;
    summary.activityEventsRetentionCutoff =
      retentionResult.approaching.cutoffIso;
    summary.activityEventsApproachingCount =
      retentionResult.approaching.approachingCount;
    summary.activityEventsOldestApproachingAt =
      retentionResult.approaching.oldestApproachingAt;
    summary.activityEventsPurged = retentionResult.purge.deletedCount;
    summary.activityEventsPurgeTruncated = retentionResult.purge.truncated;
  }

  try {
    await notifySummary(summary);
  } catch (error) {
    console.error("Tuition billing cron Discord notification failed:", error);
  }

  return summary;
}
