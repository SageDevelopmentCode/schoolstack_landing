import type { SupabaseClient } from "@supabase/supabase-js";
import {
  logSettledNotificationFailures,
} from "@/lib/admissions/notification-logging";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
  type ActivitySurface,
  type ActorType,
} from "@/lib/activity-log";
import {
  sendTeacherParentFormPublishedEmail,
  sendTeacherParentFormResponseSignedEmail,
} from "@/lib/emails";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import { schoolParentPath } from "@/lib/organization-settings/parent-routes";
import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";
import { reportOperationalError } from "@/lib/operational-errors";
import { SITE_URL } from "@/lib/site";
import { resolveFormAudienceForType } from "./audience";
import type { TeacherParentForm } from "./types";

type TeacherParentFormPublishedNotificationInput = {
  organizationId: string;
  form: TeacherParentForm;
  publisherName: string;
  staffMemberId: string;
  actorUserId: string;
  actorName: string;
  actorEmail: string;
  actorType?: ActorType;
  surface?: ActivitySurface;
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

type OrganizationNotificationContext = {
  schoolName: string;
  schoolSlug: string;
};

export type TeacherParentFormNotificationDeps = {
  resolveFormAudienceForType?: typeof resolveFormAudienceForType;
  loadOrganizationContext?: (
    supabase: SupabaseClient,
    organizationId: string,
  ) => Promise<OrganizationNotificationContext | null>;
  loadFamilyNotificationEmails?: typeof loadFamilyNotificationEmails;
  loadStaffNotificationEmail?: (
    supabase: SupabaseClient,
    staffMemberId: string,
  ) => Promise<string | null>;
  sendPublishedEmail?: typeof sendTeacherParentFormPublishedEmail;
  sendSignedEmail?: typeof sendTeacherParentFormResponseSignedEmail;
  logSettledNotificationFailures?: typeof logSettledNotificationFailures;
};

async function loadOrganizationNotificationContext(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<OrganizationNotificationContext | null> {
  const { data: org, error } = await supabase
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!org?.slug) return null;

  return {
    schoolName: String(org.name ?? "Your school"),
    schoolSlug: String(org.slug),
  };
}

async function loadStaffNotificationEmail(
  supabase: SupabaseClient,
  staffMemberId: string,
): Promise<string | null> {
  const { data: staff, error } = await supabase
    .from("staff_members")
    .select("email, user_id")
    .eq("id", staffMemberId)
    .maybeSingle();

  if (error) throw error;

  const staffEmail =
    typeof staff?.email === "string" ? staff.email.trim().toLowerCase() : "";
  if (staffEmail) return staffEmail;

  const userId = staff?.user_id ? String(staff.user_id) : null;
  if (!userId) return null;

  const { data, error: authError } = await supabase.auth.admin.getUserById(userId);
  if (authError || !data.user?.email) return null;

  return data.user.email.trim().toLowerCase();
}

export async function sendTeacherParentFormPublishedNotifications(
  supabase: SupabaseClient,
  input: TeacherParentFormPublishedNotificationInput,
  deps: TeacherParentFormNotificationDeps = {},
): Promise<void> {
  const resolveFamilies =
    deps.resolveFormAudienceForType ?? resolveFormAudienceForType;
  const loadOrganizationContext =
    deps.loadOrganizationContext ?? loadOrganizationNotificationContext;
  const loadFamilyEmails =
    deps.loadFamilyNotificationEmails ?? loadFamilyNotificationEmails;
  const sendPublishedEmail =
    deps.sendPublishedEmail ?? sendTeacherParentFormPublishedEmail;
  const logFailures =
    deps.logSettledNotificationFailures ?? logSettledNotificationFailures;

  const families = await resolveFamilies(
    supabase,
    input.organizationId,
    input.form.audienceType,
    input.form.classroomIds,
    input.form.familyIds,
  );

  if (families.length === 0) return;

  const actorType = input.actorType ?? "teacher";
  const surface = input.surface ?? "teacher_portal";

  await Promise.all(
    families.map((family) =>
      logActivityEvent(supabase, {
        organizationId: input.organizationId,
        actorType,
        actorUserId: input.actorUserId,
        actorEmail: input.actorEmail,
        actorName: input.actorName,
        surface,
        action: ACTIVITY_ACTIONS.TEACHER_PARENT_FORM_PUBLISHED,
        entityType: "teacher_parent_form",
        entityId: input.form.id,
        summary: `${input.publisherName} posted "${input.form.title}" for your family to sign`,
        metadata: {
          familyId: family.familyId,
          formId: input.form.id,
          formTitle: input.form.title,
          formCategory: input.form.formCategory,
          teacherName: input.publisherName,
          staffMemberId: input.staffMemberId,
          dueDate: input.form.dueDate,
        },
      }),
    ),
  );

  const org = await loadOrganizationContext(supabase, input.organizationId);
  if (!org) return;

  const formUrl =
    input.form.formCategory === "tuition"
      ? `${SITE_URL}${schoolParentPath(org.schoolSlug, "billing")}?tab=agreements&form=${encodeURIComponent(input.form.id)}`
      : `${SITE_URL}${schoolParentPath(org.schoolSlug, "forms_documents")}?form=${encodeURIComponent(input.form.id)}`;
  const emailSendPromises: Promise<unknown>[] = [];

  for (const family of families) {
    const emails = await loadFamilyEmails(supabase, family.familyId);
    for (const email of emails) {
      emailSendPromises.push(
        sendPublishedEmail({
          to: email,
          schoolName: org.schoolName,
          publisherName: input.publisherName,
          formTitle: input.form.title,
          dueDate: input.form.dueDate,
          studentNames: family.studentNames,
          formUrl,
        }),
      );
    }
  }

  if (emailSendPromises.length === 0) return;

  const emailResults = await Promise.allSettled(emailSendPromises);
  await logFailures(
    supabase,
    {
      organizationId: input.organizationId,
      operation: "teacher_parent_form_published_email",
      entityType: "teacher_parent_form",
      entityId: input.form.id,
    },
    emailResults,
  );
}

export async function sendTeacherParentFormResponseSignedNotification(
  supabase: SupabaseClient,
  input: TeacherParentFormResponseSignedNotificationInput,
  deps: TeacherParentFormNotificationDeps = {},
): Promise<void> {
  const loadOrganizationContext =
    deps.loadOrganizationContext ?? loadOrganizationNotificationContext;
  const loadStaffEmail =
    deps.loadStaffNotificationEmail ?? loadStaffNotificationEmail;
  const sendSignedEmail =
    deps.sendSignedEmail ?? sendTeacherParentFormResponseSignedEmail;
  const logFailures =
    deps.logSettledNotificationFailures ?? logSettledNotificationFailures;

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

  const org = await loadOrganizationContext(supabase, input.organizationId);
  if (!org) return;

  const teacherEmail = await loadStaffEmail(supabase, input.staffMemberId);
  if (!teacherEmail) return;

  const formUrl = `${SITE_URL}${schoolTeacherPath(org.schoolSlug, "forms_documents")}?form=${encodeURIComponent(input.formId)}`;
  const emailResults = await Promise.allSettled([
    sendSignedEmail({
      to: teacherEmail,
      schoolName: org.schoolName,
      familyName: input.familyName,
      formTitle: input.formTitle,
      formUrl,
    }),
  ]);

  await logFailures(
    supabase,
    {
      organizationId: input.organizationId,
      operation: "teacher_parent_form_response_signed_email",
      entityType: "teacher_parent_form",
      entityId: input.formId,
      metadata: {
        staffMemberId: input.staffMemberId,
        familyId: input.familyId,
      },
    },
    emailResults,
  );
}

export function fireTeacherParentFormActivityNotification(
  supabase: SupabaseClient,
  promise: Promise<void>,
  input: {
    organizationId: string;
    formId: string;
    operation: string;
    surface: ActivitySurface;
    actorType: ActorType;
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
