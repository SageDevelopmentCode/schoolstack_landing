import type { SupabaseClient } from "@supabase/supabase-js";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import {
  displayDateKeyInTimezone,
  zonedWallClockToUtc,
} from "@/lib/demo-scheduler-timezone";
import {
  buildEmailNotificationContext,
  sendStaffHoursAdjustmentRequestedEmail,
  sendStaffHoursAdjustmentReviewedEmail,
} from "@/lib/emails";
import { sendExpoPushToUsers } from "@/lib/notifications/expo-push";
import { mergeFeatures } from "@/lib/organization-settings/merge";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { revalidateOrganizationSettingsById } from "@/lib/organization-settings/revalidate";
import type { AdminStaffHoursAdjustmentRequest } from "@/lib/school-admin/staff-hours/staff-hours-types";
import { parseTimeToMinutes } from "@/lib/school-events/calendar-time";
import { loadOrganizationTimezoneForStaffHours } from "@/lib/school-admin/staff-hours/staff-hours-org-utils";
import {
  formatAdjustmentSessionsLabel,
  parseAdjustmentSessions,
  readStoredAdjustmentSessions,
  shouldSendStaffHoursAdjustmentEmail,
} from "@/lib/school-teacher/my-hours/my-hours-adjustment-rules";
import { staffDisplayName } from "@/lib/staff/staff-display";
import { resolveStaffHoursNotificationEmails } from "@/lib/notifications/org-notification-settings";
import { getRuntimeSiteUrl } from "@/lib/site";
import {
  STAFF_WORK_TIME_ENTRY_COLUMNS,
  type StaffWorkTimeEntryRow,
} from "@/lib/school-teacher/my-hours/my-hours-db-types";
import {
  MyHoursMutationError,
  parseMyHoursDateKey,
} from "@/lib/school-teacher/my-hours/my-hours-mutations";
import type {
  MyHoursAdjustmentSession,
  MyHoursPendingAdjustment,
} from "@/lib/school-teacher/my-hours/types";

const NOTE_MAX = 500;
const STAFF_HOURS_ADJUSTMENT_HISTORY_LIMIT = 100;

const STAFF_HOURS_ADJUSTMENT_REQUEST_LIST_COLUMNS =
  "id, staff_member_id, work_date, status, note, proposed_sessions, previous_sessions, reviewed_at, created_at";

type StaffHoursAdjustmentRpcFailure =
  | "not_found"
  | "already_reviewed"
  | "invalid_sessions";

const STAFF_HOURS_ADJUSTMENT_RPC_FAILURES: StaffHoursAdjustmentRpcFailure[] = [
  "not_found",
  "already_reviewed",
  "invalid_sessions",
];

function parseStaffHoursAdjustmentRpcFailure(
  message: string | null | undefined,
): StaffHoursAdjustmentRpcFailure | null {
  if (!message) return null;
  return (
    STAFF_HOURS_ADJUSTMENT_RPC_FAILURES.find((reason) =>
      message.includes(`staff_hours_adjustment:${reason}`),
    ) ?? null
  );
}

function throwStaffHoursAdjustmentRpcError(rpcError: { message?: string }): never {
  const reason = parseStaffHoursAdjustmentRpcFailure(rpcError.message);
  if (reason === "not_found") {
    throw new MyHoursMutationError("That request was not found.", "not_found", 404);
  }
  if (reason === "already_reviewed") {
    throw new MyHoursMutationError(
      "That request was already reviewed.",
      "already_reviewed",
      409,
    );
  }
  if (reason === "invalid_sessions") {
    throw new MyHoursMutationError(
      "That request has no times to save.",
      "invalid_sessions",
      400,
    );
  }
  throw rpcError;
}

export {
  formatAdjustmentSessionsLabel,
  parseAdjustmentSessions,
  shouldSendStaffHoursAdjustmentEmail,
} from "@/lib/school-teacher/my-hours/my-hours-adjustment-rules";

type AdjustmentRequestRow = {
  id: string;
  organization_id: string;
  staff_member_id: string;
  work_date: string;
  status: "pending" | "approved" | "denied" | "superseded";
  note: string | null;
  proposed_sessions: unknown;
  previous_sessions: unknown;
  reviewed_at: string | null;
  created_at: string;
};

export async function loadStaffHoursAdjustmentsRequireApproval(
  admin: SupabaseClient,
  organizationId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("organization_settings")
    .select("features")
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw error;
  const stored =
    data?.features && typeof data.features === "object" && !Array.isArray(data.features)
      ? (data.features as Record<string, unknown>)
      : null;
  const features = mergeFeatures(stored);
  return features.staff_hours_adjustments_require_approval !== false;
}

export async function saveStaffHoursAdjustmentsRequireApproval(
  admin: SupabaseClient,
  organizationId: string,
  requireApproval: boolean,
): Promise<void> {
  const { data, error } = await admin
    .from("organization_settings")
    .select("features")
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw error;

  const current =
    data?.features && typeof data.features === "object" && !Array.isArray(data.features)
      ? (data.features as Record<string, unknown>)
      : {};
  const next = {
    ...current,
    staff_hours_adjustments_require_approval: requireApproval,
  };

  if (data) {
    const { error: updateError } = await admin
      .from("organization_settings")
      .update({ features: next })
      .eq("organization_id", organizationId);
    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await admin.from("organization_settings").insert({
      organization_id: organizationId,
      features: next,
    });
    if (insertError) throw insertError;
  }

  await revalidateOrganizationSettingsById(admin, organizationId);
}

export async function loadPendingAdjustmentsForStaff(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<Record<string, MyHoursPendingAdjustment>> {
  const { data, error } = await admin
    .from("staff_hours_adjustment_requests")
    .select("id, work_date, note, proposed_sessions")
    .eq("organization_id", organizationId)
    .eq("staff_member_id", staffMemberId)
    .eq("status", "pending");
  if (error) throw error;

  const byDate: Record<string, MyHoursPendingAdjustment> = {};
  for (const row of data ?? []) {
    const dateKey = String(row.work_date).slice(0, 10);
    byDate[dateKey] = {
      id: String(row.id),
      dateKey,
      note: typeof row.note === "string" ? row.note : "",
      sessions: readStoredAdjustmentSessions(row.proposed_sessions),
    };
  }
  return byDate;
}

export async function listStaffHoursAdjustmentRequests(
  admin: SupabaseClient,
  organizationId: string,
): Promise<AdminStaffHoursAdjustmentRequest[]> {
  const [pendingResult, historyResult] = await Promise.all([
    admin
      .from("staff_hours_adjustment_requests")
      .select(STAFF_HOURS_ADJUSTMENT_REQUEST_LIST_COLUMNS)
      .eq("organization_id", organizationId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    admin
      .from("staff_hours_adjustment_requests")
      .select(STAFF_HOURS_ADJUSTMENT_REQUEST_LIST_COLUMNS)
      .eq("organization_id", organizationId)
      .neq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(STAFF_HOURS_ADJUSTMENT_HISTORY_LIMIT),
  ]);
  if (pendingResult.error) throw pendingResult.error;
  if (historyResult.error) throw historyResult.error;

  const rows = [
    ...(pendingResult.data ?? []),
    ...(historyResult.data ?? []),
  ] as AdjustmentRequestRow[];
  const staffIds = [...new Set(rows.map((row) => row.staff_member_id))];
  const names = new Map<string, string>();
  if (staffIds.length > 0) {
    const { data: staffRows, error: staffError } = await admin
      .from("staff_members")
      .select("id, first_name, last_name, email")
      .in("id", staffIds);
    if (staffError) throw staffError;
    for (const staff of staffRows ?? []) {
      names.set(
        String(staff.id),
        staffDisplayName({
          firstName: staff.first_name,
          lastName: staff.last_name,
          email: staff.email,
        }),
      );
    }
  }

  return rows.map((row) => ({
    id: row.id,
    staffMemberId: row.staff_member_id,
    staffName: names.get(row.staff_member_id) ?? "Staff member",
    workDate: String(row.work_date).slice(0, 10),
    status: row.status,
    note: row.note ?? "",
    proposedSessions: readStoredAdjustmentSessions(row.proposed_sessions),
    previousSessions: readStoredAdjustmentSessions(row.previous_sessions),
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
  }));
}

export async function submitStaffHoursAdjustment(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    staffMemberId: string;
    userId: string;
    dateKey: string;
    note: string;
    sessions: unknown;
  },
): Promise<{ requireApproval: boolean; requestId: string | null }> {
  const timezone = await loadOrganizationTimezoneForStaffHours(
    admin,
    input.organizationId,
  );
  const workDate = parseMyHoursDateKey(input.dateKey);
  const todayKey = displayDateKeyInTimezone(new Date(), timezone);
  if (workDate > todayKey) {
    throw new MyHoursMutationError(
      "Future days can’t be saved yet.",
      "future_date",
      400,
    );
  }

  const sessions = parseAdjustmentSessions(input.sessions);
  const note = input.note.trim().slice(0, NOTE_MAX);

  const { data: openRow, error: openError } = await admin
    .from("staff_work_time_entries")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("staff_member_id", input.staffMemberId)
    .eq("work_date", workDate)
    .is("clock_out_at", null)
    .maybeSingle();
  if (openError) throw openError;
  if (openRow) {
    throw new MyHoursMutationError(
      "Clock out before changing this day.",
      "open_session",
      409,
    );
  }

  const previousSessions = await loadClosedSessionTimes(
    admin,
    input.organizationId,
    input.staffMemberId,
    workDate,
    timezone,
  );
  const requireApproval = await loadStaffHoursAdjustmentsRequireApproval(
    admin,
    input.organizationId,
  );

  if (!requireApproval) {
    await replaceClosedSessions({
      admin,
      organizationId: input.organizationId,
      staffMemberId: input.staffMemberId,
      workDate,
      timezone,
      sessions,
      recordedByUserId: input.userId,
    });
    await supersedePendingAdjustmentForDirectSave(admin, {
      organizationId: input.organizationId,
      staffMemberId: input.staffMemberId,
      workDate,
      actorUserId: input.userId,
    });
    return { requireApproval: false, requestId: null };
  }

  const requestId = await upsertPendingRequest(admin, {
    organizationId: input.organizationId,
    staffMemberId: input.staffMemberId,
    workDate,
    note,
    sessions,
    previousSessions,
    userId: input.userId,
  });

  await notifySchoolAdminsOfAdjustment(admin, {
    organizationId: input.organizationId,
    staffMemberId: input.staffMemberId,
    userId: input.userId,
    requestId,
    workDate,
    timezone,
    sessions,
    note,
  });

  return { requireApproval: true, requestId };
}

export async function reviewStaffHoursAdjustment(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    requestId: string;
    decision: "approved" | "denied";
    reviewerUserId: string;
  },
): Promise<void> {
  const timezone = await loadOrganizationTimezoneForStaffHours(
    admin,
    input.organizationId,
  );

  const { data, error } = await admin.rpc(
    "review_staff_hours_adjustment_request_atomic",
    {
      p_organization_id: input.organizationId,
      p_request_id: input.requestId,
      p_decision: input.decision,
      p_reviewer_user_id: input.reviewerUserId,
      p_timezone: timezone,
    },
  );
  if (error) throwStaffHoursAdjustmentRpcError(error);

  const row = data as Record<string, unknown> | null;
  if (!row || typeof row !== "object") {
    throw new Error("Could not review the adjustment.");
  }

  await notifyStaffOfAdjustmentReview(admin, {
    organizationId: input.organizationId,
    staffMemberId: String(row.staff_member_id),
    submittedByUserId:
      typeof row.submitted_by_user_id === "string" ? row.submitted_by_user_id : null,
    requestId: input.requestId,
    workDate: String(row.work_date).slice(0, 10),
    approved: row.approved === true,
  });
}

async function notifyStaffOfAdjustmentReview(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    staffMemberId: string;
    submittedByUserId: string | null;
    requestId: string;
    workDate: string;
    approved: boolean;
  },
): Promise<void> {
  try {
    await deliverStaffAdjustmentReviewNotice(admin, input);
  } catch (err) {
    await logNotificationFailure(admin, {
      organizationId: input.organizationId,
      operation: "staff_hours_adjustment_reviewed",
      error: err instanceof Error ? err.message : "Could not notify the staff member.",
      entityType: "staff_hours_adjustment_request",
      entityId: input.requestId,
    });
  }
}

async function deliverStaffAdjustmentReviewNotice(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    staffMemberId: string;
    submittedByUserId: string | null;
    requestId: string;
    workDate: string;
    approved: boolean;
  },
): Promise<void> {
  const [{ data: org }, { data: staff }] = await Promise.all([
    admin
      .from("organizations")
      .select("name, slug")
      .eq("id", input.organizationId)
      .maybeSingle(),
    admin
      .from("staff_members")
      .select("user_id, email, first_name, last_name")
      .eq("id", input.staffMemberId)
      .maybeSingle(),
  ]);

  const schoolName = org?.name?.trim() || "Your school";
  const slug = org?.slug?.trim() || "";
  const email = typeof staff?.email === "string" ? staff.email.trim() : "";
  const userId =
    input.submittedByUserId?.trim() ||
    (typeof staff?.user_id === "string" ? staff.user_id.trim() : "");
  const dateLabel = formatWorkDateLabel(input.workDate);
  const heading = input.approved
    ? `Your hours for ${dateLabel} were approved.`
    : `Your hours for ${dateLabel} were not approved.`;

  if (email) {
    try {
      const result = await sendStaffHoursAdjustmentReviewedEmail({
        email,
        schoolName,
        dateLabel,
        approved: input.approved,
        hoursUrl: slug
          ? `${getRuntimeSiteUrl()}/school/${slug}/teacher/my_hours`
          : getRuntimeSiteUrl(),
        notificationContext: buildEmailNotificationContext({
          organizationId: input.organizationId,
          organizationSlug: slug,
          surface: "web",
          entityType: "staff_hours_adjustment_request",
          entityId: input.requestId,
        }),
      });
      if (!result.ok) {
        await logNotificationFailure(admin, {
          organizationId: input.organizationId,
          operation: "staff_hours_adjustment_reviewed",
          error: "Staff hours review email did not send.",
          entityType: "staff_hours_adjustment_request",
          entityId: input.requestId,
        });
      }
    } catch (err) {
      await logNotificationFailure(admin, {
        organizationId: input.organizationId,
        operation: "staff_hours_adjustment_reviewed",
        error: err instanceof Error ? err.message : "Staff hours review email failed.",
        entityType: "staff_hours_adjustment_request",
        entityId: input.requestId,
      });
    }
  }

  if (!userId || !slug) return;

  try {
    await sendExpoPushToUsers(admin, {
      organizationId: input.organizationId,
      organizationName: schoolName,
      userIds: [userId],
      title: input.approved ? "Hours approved" : "Hours not approved",
      body: heading,
      channelId: "staff_hours",
      recipientPortal: "teacher",
      recipientEmail: email || null,
      notificationKind: "staff_hours.adjustment_reviewed",
      failureOperation: "staff_hours.adjustment_reviewed_push",
      data: {
        kind: "staff_hours",
        portal: "teacher",
        organizationSlug: slug,
      },
    });
  } catch (err) {
    await logNotificationFailure(admin, {
      organizationId: input.organizationId,
      operation: "staff_hours.adjustment_reviewed_push",
      error: err instanceof Error ? err.message : "Staff hours review push failed.",
      entityType: "staff_hours_adjustment_request",
      entityId: input.requestId,
    });
  }
}

function buildClosedSessionRpcEntries(input: {
  workDate: string;
  timezone: string;
  sessions: MyHoursAdjustmentSession[];
}): Array<{ clock_in_at: string; clock_out_at: string }> {
  return input.sessions.map((session) => {
    const start = parseTimeToMinutes(session.clockIn);
    const end = parseTimeToMinutes(session.clockOut);
    if (start == null || end == null || end <= start) {
      throw new MyHoursMutationError(
        "Check the times before saving.",
        "invalid_sessions",
        400,
      );
    }
    return {
      clock_in_at: zonedWallClockToUtc(input.workDate, start, input.timezone).toISOString(),
      clock_out_at: zonedWallClockToUtc(input.workDate, end, input.timezone).toISOString(),
    };
  });
}

async function replaceClosedSessions(input: {
  admin: SupabaseClient;
  organizationId: string;
  staffMemberId: string;
  workDate: string;
  timezone: string;
  sessions: MyHoursAdjustmentSession[];
  recordedByUserId: string;
}): Promise<void> {
  const entries = buildClosedSessionRpcEntries({
    workDate: input.workDate,
    timezone: input.timezone,
    sessions: input.sessions,
  });

  const { error } = await input.admin.rpc(
    "replace_staff_work_time_closed_sessions_atomic",
    {
      p_organization_id: input.organizationId,
      p_staff_member_id: input.staffMemberId,
      p_work_date: input.workDate,
      p_recorded_by_user_id: input.recordedByUserId,
      p_entries: entries,
    },
  );
  if (error) throw error;
}

async function loadClosedSessionTimes(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  workDate: string,
  timezone: string,
): Promise<MyHoursAdjustmentSession[]> {
  const { data, error } = await admin
    .from("staff_work_time_entries")
    .select(STAFF_WORK_TIME_ENTRY_COLUMNS)
    .eq("organization_id", organizationId)
    .eq("staff_member_id", staffMemberId)
    .eq("work_date", workDate)
    .not("clock_out_at", "is", null)
    .order("clock_in_at", { ascending: true });
  if (error) throw error;

  return ((data ?? []) as StaffWorkTimeEntryRow[]).flatMap((row) => {
    if (!row.clock_out_at) return [];
    return [
      {
        clockIn: isoToTimeInput(row.clock_in_at, timezone),
        clockOut: isoToTimeInput(row.clock_out_at, timezone),
      },
    ];
  });
}

async function supersedePendingAdjustmentForDirectSave(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    staffMemberId: string;
    workDate: string;
    actorUserId: string;
  },
): Promise<void> {
  const { error } = await admin
    .from("staff_hours_adjustment_requests")
    .update({
      status: "superseded",
      reviewed_by_user_id: input.actorUserId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("organization_id", input.organizationId)
    .eq("staff_member_id", input.staffMemberId)
    .eq("work_date", input.workDate)
    .eq("status", "pending");
  if (error) throw error;
}

async function upsertPendingRequest(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    staffMemberId: string;
    workDate: string;
    note: string;
    sessions: MyHoursAdjustmentSession[];
    previousSessions: MyHoursAdjustmentSession[];
    userId: string;
  },
): Promise<string> {
  const { data, error } = await admin.rpc(
    "upsert_staff_hours_adjustment_request_atomic",
    {
      p_organization_id: input.organizationId,
      p_staff_member_id: input.staffMemberId,
      p_work_date: input.workDate,
      p_note: input.note,
      p_proposed_sessions: input.sessions,
      p_previous_sessions: input.previousSessions,
      p_submitted_by_user_id: input.userId,
    },
  );
  if (error) {
    const reason = parseStaffHoursAdjustmentRpcFailure(error.message);
    if (reason === "invalid_sessions") {
      throw new MyHoursMutationError(
        "Check the times before saving.",
        "invalid_sessions",
        400,
      );
    }
    throwStaffHoursAdjustmentRpcError(error);
  }
  if (data == null) throw new Error("Could not save the adjustment.");
  return String(data);
}

async function notifySchoolAdminsOfAdjustment(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    staffMemberId: string;
    userId: string;
    requestId: string;
    workDate: string;
    timezone: string;
    sessions: MyHoursAdjustmentSession[];
    note: string;
  },
): Promise<void> {
  const [{ data: org }, { data: staff }] = await Promise.all([
    admin
      .from("organizations")
      .select("name, slug")
      .eq("id", input.organizationId)
      .maybeSingle(),
    admin
      .from("staff_members")
      .select("first_name, last_name, email")
      .eq("id", input.staffMemberId)
      .maybeSingle(),
  ]);

  const schoolName = org?.name?.trim() || "Your school";
  const slug = org?.slug?.trim() || "";
  const staffName = staff
    ? staffDisplayName({
        firstName: staff.first_name,
        lastName: staff.last_name,
        email: staff.email,
      })
    : "A staff member";
  const dateLabel = formatWorkDateLabel(input.workDate);
  const proposedLabel = formatAdjustmentSessionsLabel(input.sessions);
  const summary = `${staffName} adjusted hours for ${dateLabel}.`;

  let emailSent = false;
  try {
    const sentToday = await countAdjustmentEmailsSentToday(
      admin,
      input.organizationId,
      input.timezone,
    );
    const recipients = shouldSendStaffHoursAdjustmentEmail(sentToday)
      ? await resolveStaffHoursNotificationEmails(admin, input.organizationId)
      : [];

    if (recipients.length > 0 && slug) {
      const reviewUrl = `${getRuntimeSiteUrl()}${schoolAdminPath(slug, "my_school", "staff_hours")}?view=requests&request=${encodeURIComponent(input.requestId)}`;
      const context = buildEmailNotificationContext({
        organizationId: input.organizationId,
        organizationSlug: slug,
        surface: "web",
        entityType: "staff_hours_adjustment_request",
        entityId: input.requestId,
      });
      const results = await Promise.all(
        recipients.map((email) =>
          sendStaffHoursAdjustmentRequestedEmail({
            email,
            schoolName,
            staffName,
            dateLabel,
            proposedLabel,
            note: input.note || null,
            reviewUrl,
            notificationContext: context,
          }),
        ),
      );
      emailSent = results.some((result) => result.ok);
      if (!emailSent) {
        await logNotificationFailure(admin, {
          organizationId: input.organizationId,
          operation: "staff_hours_adjustment_requested",
          error: "Staff hours adjustment email did not send.",
          entityType: "staff_hours_adjustment_request",
          entityId: input.requestId,
        });
      }
      if (emailSent) {
        await admin
          .from("staff_hours_adjustment_requests")
          .update({ admin_email_sent_at: new Date().toISOString() })
          .eq("id", input.requestId);
      }
    }
  } catch (err) {
    await logNotificationFailure(admin, {
      organizationId: input.organizationId,
      operation: "staff_hours_adjustment_requested",
      error: err instanceof Error ? err.message : "Staff hours adjustment email failed.",
      entityType: "staff_hours_adjustment_request",
      entityId: input.requestId,
    });
  }

  try {
    await logActivityEvent(admin, {
      organizationId: input.organizationId,
      actorType: "teacher",
      actorUserId: input.userId,
      actorName: staffName,
      action: ACTIVITY_ACTIONS.STAFF_HOURS_ADJUSTMENT_REQUESTED,
      summary,
      entityType: "staff_hours_adjustment_request",
      entityId: input.requestId,
      surface: "teacher_portal",
      metadata: {
        requestId: input.requestId,
        workDate: input.workDate,
        staffName,
        emailSent,
      },
    });
  } catch (err) {
    await logNotificationFailure(admin, {
      organizationId: input.organizationId,
      operation: "staff_hours_adjustment_activity",
      error: err instanceof Error ? err.message : "Could not record the adjustment notification.",
      entityType: "staff_hours_adjustment_request",
      entityId: input.requestId,
    });
  }
}

async function countAdjustmentEmailsSentToday(
  admin: SupabaseClient,
  organizationId: string,
  timezone: string,
): Promise<number> {
  const dateKey = displayDateKeyInTimezone(new Date(), timezone);
  const start = zonedWallClockToUtc(dateKey, 0, timezone);
  const end = zonedWallClockToUtc(addDateKeyDays(dateKey, 1), 0, timezone);
  const { data, error } = await admin
    .from("activity_events")
    .select("metadata")
    .eq("organization_id", organizationId)
    .eq("action", ACTIVITY_ACTIONS.STAFF_HOURS_ADJUSTMENT_REQUESTED)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());
  if (error) throw error;
  return (data ?? []).filter((row) => {
    const metadata = row.metadata;
    return (
      metadata != null &&
      typeof metadata === "object" &&
      !Array.isArray(metadata) &&
      (metadata as { emailSent?: unknown }).emailSent === true
    );
  }).length;
}

function isoToTimeInput(iso: string, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

function addDateKeyDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

function formatWorkDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
