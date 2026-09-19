import type { SupabaseClient } from "@supabase/supabase-js";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import { sendFridayBranchEnrollmentAdminNotification } from "@/lib/emails";
import { resolveProgramSignupNotificationEmails } from "@/lib/notifications/org-notification-settings";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { SITE_URL } from "@/lib/site";
import type { ParentFridayBranchClassDetailBundle } from "@/lib/parent-portal/friday-branch/types";
import type { FridayBranchClassEnrollmentStatus } from "@/lib/school-admin/friday-branch/friday-branch-types";

type ParentActor = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

function resolveGuardianName(actor: ParentActor): string {
  const metadata = actor.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";
  if (fullName) return fullName;
  const name = typeof metadata.name === "string" ? metadata.name.trim() : "";
  if (name) return name;
  return actor.email?.trim() || "Parent";
}

async function loadOrganizationContext(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<{ schoolName: string; schoolSlug: string } | null> {
  const { data, error } = await supabase
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.slug) return null;

  return {
    schoolName: String(data.name ?? "School"),
    schoolSlug: String(data.slug),
  };
}

async function loadFamilyName(
  supabase: SupabaseClient,
  familyId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("families")
    .select("name")
    .eq("id", familyId)
    .maybeSingle();

  if (error) throw error;
  return data?.name?.trim() || "Family";
}

function formatEnrollmentStatusLabel(
  status: FridayBranchClassEnrollmentStatus,
): string {
  return status === "waitlisted" ? "Waitlisted" : "Signed up";
}

function buildEnrollmentSummary(input: {
  studentName: string;
  className: string;
  slotTime: string;
  status: FridayBranchClassEnrollmentStatus;
}): string {
  const statusLabel = input.status === "waitlisted" ? "joined the waitlist for" : "signed up for";
  return `${input.studentName} ${statusLabel} ${input.className} (${input.slotTime})`;
}

export async function sendFridayBranchEnrollmentAdminNotifications(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    enrollmentId: string;
    classId: string;
    className: string;
    slotTime: string;
    blockLabel: string;
    blockDateRange?: string;
    studentName: string;
    familyName: string;
    guardianName: string;
    guardianEmail: string;
    status: FridayBranchClassEnrollmentStatus;
    schoolName: string;
    schoolSlug: string;
    actorUserId: string;
  },
): Promise<void> {
  const summary = buildEnrollmentSummary({
    studentName: input.studentName,
    className: input.className,
    slotTime: input.slotTime,
    status: input.status,
  });

  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "parent",
    actorUserId: input.actorUserId,
    actorEmail: input.guardianEmail,
    actorName: input.guardianName,
    surface: "parent_portal",
    action: ACTIVITY_ACTIONS.FRIDAY_BRANCH_CLASS_ENROLLED,
    entityType: "friday_branch_class_enrollment",
    entityId: input.enrollmentId,
    summary,
    metadata: {
      classId: input.classId,
      className: input.className,
      slotTime: input.slotTime,
      blockLabel: input.blockLabel,
      blockDateRange: input.blockDateRange,
      studentName: input.studentName,
      familyName: input.familyName,
      guardianName: input.guardianName,
      guardianEmail: input.guardianEmail,
      status: input.status,
    },
  });

  const adminEmails = await resolveProgramSignupNotificationEmails(
    supabase,
    input.organizationId,
  );
  if (adminEmails.length === 0) return;

  const fridayBranchAdminUrl = `${SITE_URL}${schoolAdminPath(input.schoolSlug, "my_school", "friday_branch")}?class=${encodeURIComponent(input.classId)}`;
  const submittedAtLabel = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const statusLabel = formatEnrollmentStatusLabel(input.status);

  const results = await Promise.allSettled(
    adminEmails.map((email) =>
      sendFridayBranchEnrollmentAdminNotification({
        email,
        schoolName: input.schoolName,
        className: input.className,
        slotTime: input.slotTime,
        blockLabel: input.blockLabel,
        blockDateRange: input.blockDateRange,
        studentName: input.studentName,
        familyName: input.familyName,
        guardianName: input.guardianName,
        guardianEmail: input.guardianEmail,
        statusLabel,
        submittedAtLabel,
        fridayBranchAdminUrl,
      }),
    ),
  );

  await logSettledNotificationFailures(supabase, {
    organizationId: input.organizationId,
    operation: "friday_branch.class.enroll.admin_notify",
    entityType: "friday_branch_class_enrollment",
    entityId: input.enrollmentId,
  }, results);
}

export async function notifyFridayBranchEnrollmentFromParentPortal(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    enrollmentId: string;
    classId: string;
    studentId: string;
    studentName: string;
    status: FridayBranchClassEnrollmentStatus;
    detail: ParentFridayBranchClassDetailBundle;
    actor: ParentActor;
  },
): Promise<void> {
  const org = await loadOrganizationContext(supabase, input.organizationId);
  if (!org) return;

  const familyName = await loadFamilyName(supabase, input.familyId);
  const guardianEmail = input.actor.email?.trim() || "";

  await sendFridayBranchEnrollmentAdminNotifications(supabase, {
    organizationId: input.organizationId,
    enrollmentId: input.enrollmentId,
    classId: input.classId,
    className: input.detail.name,
    slotTime: input.detail.slotTime,
    blockLabel: input.detail.blockLabel,
    blockDateRange: input.detail.blockDateRange,
    studentName: input.studentName,
    familyName,
    guardianName: resolveGuardianName(input.actor),
    guardianEmail,
    status: input.status,
    schoolName: org.schoolName,
    schoolSlug: org.schoolSlug,
    actorUserId: input.actor.id,
  });
}

export async function notifyFridayBranchWithdrawalFromParentPortal(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    enrollmentId: string;
    classId: string;
    studentName: string;
    detail: ParentFridayBranchClassDetailBundle;
    actor: ParentActor;
  },
): Promise<void> {
  const familyName = await loadFamilyName(supabase, input.familyId);
  const guardianEmail = input.actor.email?.trim() || "";

  await sendFridayBranchWithdrawalActivityNotification(supabase, {
    organizationId: input.organizationId,
    enrollmentId: input.enrollmentId,
    classId: input.classId,
    className: input.detail.name,
    slotTime: input.detail.slotTime,
    blockLabel: input.detail.blockLabel,
    studentName: input.studentName,
    familyName,
    guardianName: resolveGuardianName(input.actor),
    guardianEmail,
    actorUserId: input.actor.id,
  });
}

export async function sendFridayBranchWithdrawalActivityNotification(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    enrollmentId: string;
    classId: string;
    className: string;
    slotTime: string;
    blockLabel: string;
    studentName: string;
    familyName: string;
    guardianName: string;
    guardianEmail: string;
    actorUserId: string;
  },
): Promise<void> {
  await logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType: "parent",
    actorUserId: input.actorUserId,
    actorEmail: input.guardianEmail,
    actorName: input.guardianName,
    surface: "parent_portal",
    action: ACTIVITY_ACTIONS.FRIDAY_BRANCH_CLASS_WITHDRAWN,
    entityType: "friday_branch_class_enrollment",
    entityId: input.enrollmentId,
    summary: `${input.studentName} withdrew from ${input.className} (${input.slotTime})`,
    metadata: {
      classId: input.classId,
      className: input.className,
      slotTime: input.slotTime,
      blockLabel: input.blockLabel,
      studentName: input.studentName,
      familyName: input.familyName,
      guardianName: input.guardianName,
      guardianEmail: input.guardianEmail,
    },
  });
}
