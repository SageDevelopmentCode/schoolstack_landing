import {
  composeEmail,
  emailBadge,
  emailBulletList,
  emailCta,
  emailDetailCard,
  emailDigestActivityCard,
  emailDigestSectionHeader,
  emailHeading,
  emailMutedParagraph,
  emailParagraph,
  emailSignOff,
  escapeHtml,
} from "@/lib/email-layout";
import {
  formatDateOnlyLongLabel,
  formatDateOnlyWithWeekdayLabel,
  formatDurationLabel,
} from "@/lib/admissions/admissions-availability";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type {
  OutboundEmailAudience,
  OutboundEmailDiscordMeta,
} from "@/lib/discord";
import { deliverZohoEmail } from "@/lib/notification-delivery";
import { isZohoConfigured, sendZohoEmail } from "@/lib/zoho";

/** Optional fields from domain libs for outbound email Discord alerts. */
export type OutboundEmailNotificationContext = Pick<
  OutboundEmailDiscordMeta,
  "organizationId" | "organizationSlug" | "surface" | "entityType" | "entityId"
>;

function schoolOutboundDiscord(
  channel: string,
  audience: OutboundEmailAudience,
  schoolName: string,
  ctx?: OutboundEmailNotificationContext,
): OutboundEmailDiscordMeta {
  return {
    channel,
    audience,
    organizationName: schoolName,
    organizationId: ctx?.organizationId,
    organizationSlug: ctx?.organizationSlug,
    surface: ctx?.surface,
    entityType: ctx?.entityType,
    entityId: ctx?.entityId,
  };
}

function prospectOutboundDiscord(channel: string): OutboundEmailDiscordMeta {
  return { channel, audience: "prospect" };
}

export function buildEmailNotificationContext(input: {
  organizationId: string;
  organizationSlug: string;
  surface?: OutboundEmailNotificationContext["surface"];
  entityType?: string;
  entityId?: string;
}): OutboundEmailNotificationContext {
  return {
    organizationId: input.organizationId,
    organizationSlug: input.organizationSlug,
    surface: input.surface,
    entityType: input.entityType,
    entityId: input.entityId,
  };
}

export function messageRecipientAudience(
  portal: "parent" | "teacher" | "admin",
): OutboundEmailAudience {
  if (portal === "admin") return "school_admin";
  if (portal === "teacher") return "teacher";
  return "parent";
}

function formatSelectedDate(dateStr: string) {
  return formatDateOnlyWithWeekdayLabel(dateStr);
}

function firstName(name: string): string {
  return escapeHtml(name.split(" ")[0] || name);
}

export function buildDemoBookingConfirmationHtml(payload: {
  name: string;
  schoolName: string;
  roleLabel?: string;
  scheduledDate: string;
  scheduledTime: string;
}): string {
  const when = `${formatSelectedDate(payload.scheduledDate)} at ${payload.scheduledTime} CT`;
  const detailRows = [
    { label: "When", value: when },
    { label: "School / program", value: payload.schoolName },
  ];
  if (payload.roleLabel?.trim()) {
    detailRows.push({
      label: "Where you are today",
      value: payload.roleLabel.trim(),
    });
  }

  return composeEmail({
    preheader: "Your demo is confirmed — we'll be in touch soon.",
    contentHtml: `
      ${emailBadge("Demo Confirmed")}
      ${emailHeading(`You're all set, ${firstName(payload.name)}.`)}
      ${emailParagraph(
        `Thanks for booking a demo with ${escapeHtml(SITE_NAME)}. We look forward to showing you how ${escapeHtml(SITE_NAME)} can simplify enrollment, billing, family communication, and daily operations for your school.`
      )}
      ${emailDetailCard(detailRows)}
      ${emailParagraph(
        "We'll send a calendar invite or follow up shortly if we need anything else before your session."
      )}
      ${emailCta({ label: "Visit MudKitchen", href: SITE_URL })}
      ${emailSignOff()}
    `,
  });
}

export function buildHomepageQuestionConfirmationHtml(payload: { name: string }): string {
  return composeEmail({
    preheader: "We received your message.",
    contentHtml: `
      ${emailBadge("Message Received")}
      ${emailHeading(`Thanks for reaching out, ${firstName(payload.name)}.`)}
      ${emailParagraph(
        `We received your message and a member of the ${escapeHtml(SITE_NAME)} team will get back to you as soon as we can — usually within one business day.`
      )}
      ${emailParagraph(
        "In the meantime, feel free to explore how MudKitchen helps microschool founders replace the patchwork of tools they're stitching together."
      )}
      ${emailCta({ label: "Explore MudKitchen", href: SITE_URL })}
      ${emailSignOff()}
    `,
  });
}

export function buildDemoFeedbackConfirmationHtml(payload: {
  name: string;
  schoolName: string;
}): string {
  return composeEmail({
    preheader: "Thanks for your feedback.",
    contentHtml: `
      ${emailBadge("Feedback Received")}
      ${emailHeading(`We appreciate your input, ${firstName(payload.name)}.`)}
      ${emailParagraph(
        `Thanks for sharing feedback on the ${escapeHtml(payload.schoolName)} demo. Your perspective helps us build better tools for microschool founders who need one system for enrollment, billing, and daily operations.`
      )}
      ${emailCta({ label: "Book a Demo", href: `${SITE_URL}/get-started` })}
      ${emailSignOff()}
    `,
  });
}

export async function sendDemoBookingConfirmation(payload: {
  name: string;
  email: string;
  schoolName: string;
  role?: string;
  roleLabel?: string;
  scheduledDate: string;
  scheduledTime: string;
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildDemoBookingConfirmationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Your ${SITE_NAME} demo is confirmed`,
    content,
    discord: prospectOutboundDiscord("demo_booking_confirmation"),
  });

  if (!result.success) {
    console.error("Demo booking confirmation email failed:", result.error);
  }
}

export async function sendHomepageQuestionConfirmation(payload: {
  name: string;
  email: string;
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildHomepageQuestionConfirmationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `We received your message — ${SITE_NAME}`,
    content,
    discord: prospectOutboundDiscord("homepage_question_confirmation"),
  });

  if (!result.success) {
    console.error("Homepage question confirmation email failed:", result.error);
  }
}

export function buildPublicSupportRequestConfirmationHtml(payload: {
  name: string;
}): string {
  return composeEmail({
    preheader: "We received your support request.",
    contentHtml: `
      ${emailBadge("Support Request Received")}
      ${emailHeading(`Thanks for reaching out, ${firstName(payload.name)}.`)}
      ${emailParagraph(
        `We received your support request and a member of the ${escapeHtml(SITE_NAME)} team will get back to you as soon as we can — usually within one business day.`,
      )}
      ${emailParagraph(
        "If your question is urgent, you can also book a demo to speak with us directly.",
      )}
      ${emailCta({ label: "Book a Demo", href: `${SITE_URL}/get-started` })}
      ${emailSignOff()}
    `,
  });
}

export async function sendPublicSupportRequestConfirmation(payload: {
  name: string;
  email: string;
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildPublicSupportRequestConfirmationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `We received your support request — ${SITE_NAME}`,
    content,
    discord: prospectOutboundDiscord("public_support_request_confirmation"),
  });

  if (!result.success) {
    console.error("Public support request confirmation email failed:", result.error);
  }
}

export async function sendDemoFeedbackConfirmation(payload: {
  name: string;
  email: string;
  schoolName: string;
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildDemoFeedbackConfirmationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Thanks for your feedback — ${SITE_NAME}`,
    content,
    discord: prospectOutboundDiscord("demo_feedback_confirmation"),
  });

  if (!result.success) {
    console.error("Demo feedback confirmation email failed:", result.error);
  }
}

const SUPPORT_REQUEST_TOPIC_LABELS: Record<string, string> = {
  general: "General question",
  bug: "Something isn't working",
  "application-forms": "Application forms",
  enrollment: "Enrollment",
  billing: "Billing",
  feature: "Feature request",
  other: "Other",
};

function firstNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim() ?? "";
  const token = local.split(/[._+-]/)[0]?.trim();
  if (!token) return "there";
  return escapeHtml(token.charAt(0).toUpperCase() + token.slice(1));
}

export function buildAdminSupportRequestConfirmationHtml(payload: {
  submitterEmail: string;
  schoolName: string;
  topic: string;
}): string {
  const topicLabel =
    SUPPORT_REQUEST_TOPIC_LABELS[payload.topic] ?? payload.topic;
  const greetingName = firstNameFromEmail(payload.submitterEmail);

  const detailRows = [
    { label: "Topic", value: topicLabel },
    { label: "School", value: payload.schoolName },
  ];

  return composeEmail({
    preheader: "We received your support request.",
    contentHtml: `
      ${emailBadge("Support Request Received")}
      ${emailHeading(`Thanks, ${greetingName}.`)}
      ${emailParagraph(
        `We received your support request and will get back to you at ${escapeHtml(payload.submitterEmail)} as soon as we can — usually within one business day.`,
      )}
      ${emailDetailCard(detailRows)}
      ${emailParagraph(
        "If you attached screenshots or files, we have those on our end and will review them with your message.",
      )}
      ${emailSignOff()}
    `,
  });
}

export async function sendAdminSupportRequestConfirmation(payload: {
  submitterEmail: string;
  schoolName: string;
  topic: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildAdminSupportRequestConfirmationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.submitterEmail,
    subject: `We received your support request — ${SITE_NAME}`,
    content,
    discord: schoolOutboundDiscord(
      "admin_support_request_confirmation",
      "school_admin",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Admin support request confirmation email failed:", result.error);
  }
}

export function buildApplicationSubmittedConfirmationHtml(payload: {
  name: string;
  schoolName: string;
  formTitle: string;
  applyDashboardUrl: string;
}): string {
  return composeEmail({
    preheader: `Your application to ${payload.schoolName} was received.`,
    contentHtml: `
      ${emailBadge("Application Received")}
      ${emailHeading(`Thank you, ${firstName(payload.name)}.`)}
      ${emailParagraph(
        `We received your application for ${escapeHtml(payload.formTitle)} at ${escapeHtml(payload.schoolName)}. The admissions team will review your submission and follow up with next steps.`,
      )}
      ${emailDetailCard([
        { label: "School", value: payload.schoolName },
        { label: "Application", value: payload.formTitle },
      ])}
      ${emailParagraph(
        "You can check the status of your application anytime from your apply dashboard.",
      )}
      ${emailCta({ label: "View apply dashboard", href: payload.applyDashboardUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendApplicationSubmittedConfirmation(payload: {
  name: string;
  email: string;
  schoolName: string;
  formTitle: string;
  applyDashboardUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  const content = buildApplicationSubmittedConfirmationHtml(payload);
  await deliverZohoEmail({
    channel: "Application submitted confirmation",
    toAddress: payload.email,
    subject: `Application received — ${payload.schoolName}`,
    content,
    discord: schoolOutboundDiscord(
      "application_submitted_confirmation",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });
}

export function buildApplicationAcceptedEnrollmentHtml(payload: {
  name: string;
  schoolName: string;
  formTitle: string;
  studentName?: string;
  enrollmentChecklistUrl: string;
}): string {
  const studentLine = payload.studentName
    ? ` for ${escapeHtml(payload.studentName)}`
    : "";

  return composeEmail({
    preheader: `Your application to ${payload.schoolName} was accepted — continue enrollment.`,
    contentHtml: `
      ${emailBadge("Application Accepted")}
      ${emailHeading(`Congratulations, ${firstName(payload.name)}!`)}
      ${emailParagraph(
        `Great news — your application${studentLine} for ${escapeHtml(payload.formTitle)} at ${escapeHtml(payload.schoolName)} has been accepted.`,
      )}
      ${emailDetailCard([
        { label: "School", value: payload.schoolName },
        { label: "Application", value: payload.formTitle },
        ...(payload.studentName ? [{ label: "Student", value: payload.studentName }] : []),
      ])}
      ${emailParagraph(
        "The next step is to complete your enrollment checklist — agreements, forms, and any required fees.",
      )}
      ${emailCta({
        label: "Continue enrollment checklist",
        href: payload.enrollmentChecklistUrl,
      })}
      ${emailSignOff()}
    `,
  });
}

export async function sendApplicationAcceptedEnrollmentEmail(payload: {
  name: string;
  email: string;
  schoolName: string;
  formTitle: string;
  studentName?: string;
  enrollmentChecklistUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildApplicationAcceptedEnrollmentHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Congratulations — continue enrollment at ${payload.schoolName}`,
    content,
    discord: schoolOutboundDiscord(
      "application_accepted_enrollment",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Application accepted enrollment email failed:", result.error);
  }
}

export function buildDraftApplicationReminderHtml(payload: {
  name: string;
  schoolName: string;
  formTitle: string;
  applyDashboardUrl: string;
  contactEmail: string;
}): string {
  const contactMailto = `mailto:${encodeURIComponent(payload.contactEmail)}`;

  return composeEmail({
    preheader: `${payload.schoolName} would love to see you finish your application.`,
    contentHtml: `
      ${emailBadge("Finish Your Application")}
      ${emailHeading(`We're excited you're applying, ${firstName(payload.name)}.`)}
      ${emailParagraph(
        `Thank you for starting your application for ${escapeHtml(payload.formTitle)} at ${escapeHtml(payload.schoolName)}. We're thrilled you're considering joining our community and would love to see you complete your application when you have a few minutes.`,
      )}
      ${emailDetailCard([
        { label: "School", value: payload.schoolName },
        { label: "Application", value: payload.formTitle },
      ])}
      ${emailParagraph(
        "Your progress has been saved — pick up right where you left off whenever you're ready.",
      )}
      ${emailCta({ label: "Continue your application", href: payload.applyDashboardUrl })}
      ${emailParagraph(
        `Have questions or want to meet with someone from the ${escapeHtml(payload.schoolName)} team? We'd be happy to help — reach out at <a href="${contactMailto}" style="color:inherit;">${escapeHtml(payload.contactEmail)}</a>.`,
      )}
      ${emailSignOff()}
    `,
  });
}

export async function sendDraftApplicationReminderEmail(payload: {
  to: string;
  schoolName: string;
  html: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `Finish your application — ${payload.schoolName}`,
    content: payload.html,
    discord: schoolOutboundDiscord(
      "draft_application_reminder",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Draft application reminder email failed:", result.error);
    return { ok: false };
  }

  return { ok: true };
}

export function buildIncompleteAdmissionsReminderSubject(payload: {
  schoolName: string;
  hasDraftApplications: boolean;
  hasIncompleteEnrollments: boolean;
}): string {
  if (payload.hasDraftApplications && payload.hasIncompleteEnrollments) {
    return `Reminder: finish your admissions steps — ${payload.schoolName}`;
  }
  if (payload.hasIncompleteEnrollments) {
    return `Reminder: complete your enrollment — ${payload.schoolName}`;
  }
  return `Reminder: finish your application — ${payload.schoolName}`;
}

export function buildIncompleteAdmissionsReminderHtml(payload: {
  name: string;
  schoolName: string;
  contactEmail: string;
  applyDashboardUrl: string;
  draftApplications: Array<{ formTitle: string; applyUrl: string }>;
  incompleteEnrollments: Array<{
    label: string;
    progressLabel: string;
    enrollmentUrl: string;
  }>;
}): string {
  const hasDrafts = payload.draftApplications.length > 0;
  const hasEnrollments = payload.incompleteEnrollments.length > 0;
  const contactMailto = payload.contactEmail
    ? `mailto:${encodeURIComponent(payload.contactEmail)}`
    : null;

  const draftSection = hasDrafts
    ? `
      ${emailHeading("Applications in progress")}
      ${emailParagraph(
        "You started an application but have not submitted it yet. Your progress is saved — pick up where you left off whenever you are ready.",
      )}
      ${emailBulletList(
        payload.draftApplications.map(
          (application) => `${application.formTitle}`,
        ),
      )}
      ${emailCta({
        label: "Continue your application",
        href: payload.draftApplications[0]?.applyUrl ?? payload.applyDashboardUrl,
      })}
    `
    : "";

  const enrollmentSection = hasEnrollments
    ? `
      ${emailHeading("Enrollment checklist")}
      ${emailParagraph(
        "Your enrollment checklist still has steps to complete before your student can be fully enrolled.",
      )}
      ${emailBulletList(
        payload.incompleteEnrollments.map(
          (enrollment) => `${enrollment.label} (${enrollment.progressLabel})`,
        ),
      )}
      ${emailCta({
        label: "Complete enrollment",
        href:
          payload.incompleteEnrollments[0]?.enrollmentUrl ??
          payload.applyDashboardUrl,
      })}
    `
    : "";

  const contactSection = payload.contactEmail && contactMailto
    ? emailParagraph(
        `Questions? Reach out to the ${escapeHtml(payload.schoolName)} team at <a href="${contactMailto}" style="color:inherit;">${escapeHtml(payload.contactEmail)}</a>.`,
      )
    : "";

  const preheader = hasDrafts && hasEnrollments
    ? `${payload.schoolName} — finish your application and enrollment steps.`
    : hasEnrollments
      ? `${payload.schoolName} — complete your enrollment checklist.`
      : `${payload.schoolName} would love to see you finish your application.`;

  return composeEmail({
    preheader,
    contentHtml: `
      ${emailBadge("Friendly Reminder")}
      ${emailHeading(`Hi ${firstName(payload.name)},`)}
      ${emailParagraph(
        `This is a friendly reminder from ${escapeHtml(payload.schoolName)} about outstanding admissions steps for your family.`,
      )}
      ${draftSection}
      ${enrollmentSection}
      ${contactSection}
      ${emailSignOff()}
    `,
  });
}

export async function sendIncompleteAdmissionsReminderEmail(payload: {
  to: string;
  schoolName: string;
  subject: string;
  html: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: payload.subject,
    content: payload.html,
    discord: schoolOutboundDiscord(
      "incomplete_admissions_reminder",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Incomplete admissions reminder email failed:", result.error);
    return { ok: false };
  }

  return { ok: true };
}

export function buildEnrollmentCompletedConfirmationHtml(payload: {
  name: string;
  schoolName: string;
  studentName: string;
  programName?: string;
  parentPortalUrl: string;
  parentPortalEnabled: boolean;
}): string {
  const portalLabel = payload.parentPortalEnabled
    ? "Open parent portal"
    : "View apply dashboard";
  const portalCopy = payload.parentPortalEnabled
    ? "You can now sign in to your parent portal for billing, messages, calendar, and other family updates."
    : "You can sign in to your apply dashboard to view family details and school updates.";

  const details = [
    { label: "School", value: payload.schoolName },
    { label: "Student", value: payload.studentName },
  ];
  if (payload.programName) {
    details.push({ label: "Program", value: payload.programName });
  }

  return composeEmail({
    preheader: `${payload.studentName} is enrolled at ${payload.schoolName}.`,
    contentHtml: `
      ${emailBadge("Enrollment Confirmed")}
      ${emailHeading(`Welcome, ${firstName(payload.name)}.`)}
      ${emailParagraph(
        `${escapeHtml(payload.studentName)} is now enrolled at ${escapeHtml(payload.schoolName)}.`,
      )}
      ${emailDetailCard(details)}
      ${emailParagraph(portalCopy)}
      ${emailMutedParagraph(
        "Family notification emails (applications, billing, messages, and more) go to the addresses in your notification settings. You can update those anytime in the parent portal.",
      )}
      ${emailCta({ label: portalLabel, href: payload.parentPortalUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendEnrollmentCompletedConfirmation(payload: {
  name: string;
  email: string;
  schoolName: string;
  studentName: string;
  programName?: string;
  parentPortalUrl: string;
  parentPortalEnabled: boolean;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildEnrollmentCompletedConfirmationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Enrollment confirmed — ${payload.schoolName}`,
    content,
    discord: schoolOutboundDiscord(
      "enrollment_completed_confirmation",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Enrollment completed confirmation email failed:", result.error);
  }
}

export function buildApplicationSubmittedOwnerNotificationHtml(payload: {
  schoolName: string;
  formTitle: string;
  studentName?: string;
  contactName?: string;
  contactEmail?: string;
  programName?: string;
  submittedAtLabel: string;
  submissionAdminUrl: string;
}): string {
  const details = [
    { label: "School", value: payload.schoolName },
    { label: "Application", value: payload.formTitle },
  ];

  if (payload.studentName) {
    details.push({ label: "Student", value: payload.studentName });
  }
  if (payload.contactName) {
    details.push({ label: "Contact", value: payload.contactName });
  }
  if (payload.contactEmail) {
    details.push({ label: "Email", value: payload.contactEmail });
  }
  if (payload.programName) {
    details.push({ label: "Program", value: payload.programName });
  }
  details.push({ label: "Submitted", value: payload.submittedAtLabel });

  return composeEmail({
    preheader: `A new application was submitted to ${payload.schoolName}.`,
    contentHtml: `
      ${emailBadge("New Application")}
      ${emailHeading("A new application was submitted")}
      ${emailParagraph(
        `A family submitted ${escapeHtml(payload.formTitle)} at ${escapeHtml(payload.schoolName)}. Review the submission in your admissions dashboard.`,
      )}
      ${emailDetailCard(details)}
      ${emailCta({ label: "View submission", href: payload.submissionAdminUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendApplicationSubmittedOwnerNotification(payload: {
  email: string;
  schoolName: string;
  formTitle: string;
  studentName?: string;
  contactName?: string;
  contactEmail?: string;
  programName?: string;
  submittedAtLabel: string;
  submissionAdminUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  const content = buildApplicationSubmittedOwnerNotificationHtml(payload);
  await deliverZohoEmail({
    channel: "Application submitted owner notification",
    toAddress: payload.email,
    subject: `New application submitted — ${payload.schoolName}`,
    content,
    discord: schoolOutboundDiscord(
      "application_submitted_owner_notification",
      "school_admin",
      payload.schoolName,
      payload.notificationContext,
    ),
  });
}

export function buildPostSubmitVisitConfirmationHtml(payload: {
  name: string;
  schoolName: string;
  stepTitle: string;
  scheduledDate: string;
  endDate?: string;
  startTimeSlot: string;
  schedulingMode?: "time_slot" | "whole_day";
  visitDayCount?: number;
  timezoneLabel: string;
  whenLabel: string;
  durationLabel: string;
  applyDashboardUrl: string;
}): string {
  const when = `${payload.whenLabel} (${payload.timezoneLabel})`;

  return composeEmail({
    preheader: `Your ${payload.stepTitle} at ${payload.schoolName} is confirmed.`,
    contentHtml: `
      ${emailBadge("Visit Confirmed")}
      ${emailHeading(`Your ${escapeHtml(payload.stepTitle)} is confirmed, ${firstName(payload.name)}.`)}
      ${emailParagraph(
        `Thank you for scheduling with ${escapeHtml(payload.schoolName)}. We look forward to seeing your family.`,
      )}
      ${emailDetailCard([
        { label: "When", value: when },
        { label: "School", value: payload.schoolName },
        { label: "Duration", value: payload.durationLabel },
      ])}
      ${emailParagraph(
        "You can review your application and any remaining steps from your apply dashboard.",
      )}
      ${emailCta({ label: "View apply dashboard", href: payload.applyDashboardUrl })}
      ${emailSignOff()}
    `,
  });
}

export function buildPostSubmitVisitOwnerNotificationHtml(payload: {
  schoolName: string;
  stepTitle: string;
  whenLabel: string;
  timezoneLabel: string;
  durationLabel: string;
  studentName?: string;
  contactName?: string;
  contactEmail?: string;
  submissionAdminUrl: string;
}): string {
  const when = `${payload.whenLabel} (${payload.timezoneLabel})`;
  const details = [
    { label: "School", value: payload.schoolName },
    { label: "Visit", value: payload.stepTitle },
    { label: "When", value: when },
    { label: "Duration", value: payload.durationLabel },
  ];

  if (payload.studentName) {
    details.push({ label: "Student", value: payload.studentName });
  }
  if (payload.contactName) {
    details.push({ label: "Contact", value: payload.contactName });
  }
  if (payload.contactEmail) {
    details.push({ label: "Email", value: payload.contactEmail });
  }

  return composeEmail({
    preheader: `A family scheduled a visit at ${payload.schoolName}.`,
    contentHtml: `
      ${emailBadge("Visit Scheduled")}
      ${emailHeading("A family scheduled a visit")}
      ${emailParagraph(
        `A family scheduled ${escapeHtml(payload.stepTitle)} at ${escapeHtml(payload.schoolName)}. Review the submission in your admissions dashboard.`,
      )}
      ${emailDetailCard(details)}
      ${emailCta({ label: "View submission", href: payload.submissionAdminUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendPostSubmitVisitOwnerNotification(payload: {
  email: string;
  schoolName: string;
  stepTitle: string;
  whenLabel: string;
  timezoneLabel: string;
  durationLabel: string;
  studentName?: string;
  contactName?: string;
  contactEmail?: string;
  submissionAdminUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  const content = buildPostSubmitVisitOwnerNotificationHtml(payload);
  await deliverZohoEmail({
    channel: "Post-submit visit owner notification",
    toAddress: payload.email,
    subject: `Visit scheduled — ${payload.schoolName}`,
    content,
    discord: schoolOutboundDiscord(
      "post_submit_visit_owner_notification",
      "school_admin",
      payload.schoolName,
      payload.notificationContext,
    ),
  });
}

export async function sendPostSubmitVisitConfirmation(payload: {
  name: string;
  email: string;
  schoolName: string;
  stepTitle: string;
  scheduledDate: string;
  endDate?: string;
  startTimeSlot: string;
  schedulingMode?: "time_slot" | "whole_day";
  visitDayCount?: number;
  timezoneLabel: string;
  durationMinutes: number;
  whenLabel: string;
  durationLabel: string;
  applyDashboardUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  const content = buildPostSubmitVisitConfirmationHtml(payload);
  await deliverZohoEmail({
    channel: "Post-submit visit confirmation",
    toAddress: payload.email,
    subject: `${payload.stepTitle} confirmed — ${payload.schoolName}`,
    content,
    discord: schoolOutboundDiscord(
      "post_submit_visit_confirmation",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });
}

export function buildPublicCampusTourConfirmationHtml(payload: {
  name: string;
  schoolName: string;
  whenLabel: string;
  timezoneLabel: string;
  durationLabel: string;
}): string {
  const when = `${payload.whenLabel} (${payload.timezoneLabel})`;

  return composeEmail({
    preheader: `Your campus tour at ${payload.schoolName} is confirmed.`,
    contentHtml: `
      ${emailBadge("Visit Confirmed")}
      ${emailHeading(`Your campus tour is confirmed, ${firstName(payload.name)}.`)}
      ${emailParagraph(
        `Thank you for scheduling with ${escapeHtml(payload.schoolName)}. We look forward to seeing your family.`,
      )}
      ${emailDetailCard([
        { label: "When", value: when },
        { label: "School", value: payload.schoolName },
        { label: "Duration", value: payload.durationLabel },
      ])}
      ${emailParagraph(
        `If you need to change your visit, contact ${escapeHtml(payload.schoolName)} directly.`,
      )}
      ${emailSignOff()}
    `,
  });
}

export async function sendPublicCampusTourConfirmation(payload: {
  name: string;
  email: string;
  schoolName: string;
  whenLabel: string;
  timezoneLabel: string;
  durationLabel: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  const content = buildPublicCampusTourConfirmationHtml(payload);
  await deliverZohoEmail({
    channel: "Public campus tour confirmation",
    toAddress: payload.email,
    subject: `Campus tour confirmed — ${payload.schoolName}`,
    content,
    discord: schoolOutboundDiscord(
      "public_campus_tour_confirmation",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });
}

export function buildScheduledVisitDayBeforeReminderHtml(payload: {
  name: string;
  schoolName: string;
  stepTitle: string;
  whenLabel: string;
  timezoneLabel: string;
  durationLabel: string;
  optionalLink?: { label: string; href: string };
}): string {
  const when = `${payload.whenLabel} (${payload.timezoneLabel})`;
  const linkBlock = payload.optionalLink
    ? emailCta({ label: payload.optionalLink.label, href: payload.optionalLink.href })
    : emailParagraph(
        `If you need to change your visit, contact ${escapeHtml(payload.schoolName)} directly.`,
      );

  return composeEmail({
    preheader: `Reminder: your ${payload.stepTitle} at ${payload.schoolName} is tomorrow.`,
    contentHtml: `
      ${emailBadge("Visit Tomorrow")}
      ${emailHeading(`See you tomorrow, ${firstName(payload.name)}.`)}
      ${emailParagraph(
        `This is a friendly reminder about your upcoming ${escapeHtml(payload.stepTitle)} at ${escapeHtml(payload.schoolName)}.`,
      )}
      ${emailDetailCard([
        { label: "When", value: when },
        { label: "School", value: payload.schoolName },
        { label: "Duration", value: payload.durationLabel },
      ])}
      ${linkBlock}
      ${emailSignOff()}
    `,
  });
}

export async function sendScheduledVisitDayBeforeReminderEmail(payload: {
  email: string;
  schoolName: string;
  stepTitle: string;
  name: string;
  whenLabel: string;
  timezoneLabel: string;
  durationLabel: string;
  optionalLink?: { label: string; href: string };
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ ok: boolean }> {
  const content = buildScheduledVisitDayBeforeReminderHtml(payload);
  try {
    await deliverZohoEmail({
      channel: "Scheduled visit day-before reminder",
      toAddress: payload.email,
      subject: `Reminder: ${payload.stepTitle} tomorrow — ${payload.schoolName}`,
      content,
      discord: schoolOutboundDiscord(
        "scheduled_visit_day_before_reminder",
        "parent",
        payload.schoolName,
        payload.notificationContext,
      ),
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export type ScheduledVisitAdminDigestRow = {
  whenLabel: string;
  stepTitle: string;
  contactLabel: string;
  bookingSourceLabel: string;
};

export function buildScheduledVisitAdminDigestHtml(payload: {
  schoolName: string;
  digestKind: "weekly" | "day_before";
  scheduleAdminUrl: string;
  rows: ScheduledVisitAdminDigestRow[];
}): string {
  const heading =
    payload.digestKind === "weekly"
      ? "Upcoming visits this week"
      : "Visits scheduled for tomorrow";
  const preheader =
    payload.digestKind === "weekly"
      ? `Scheduled visits coming up at ${payload.schoolName}.`
      : `Visits tomorrow at ${payload.schoolName}.`;

  const listItems = payload.rows.map((row) => {
    const parts = [
      escapeHtml(row.whenLabel),
      escapeHtml(row.stepTitle),
      escapeHtml(row.contactLabel),
      `(${escapeHtml(row.bookingSourceLabel)})`,
    ];
    return parts.join(" — ");
  });

  return composeEmail({
    preheader,
    contentHtml: `
      ${emailBadge("Visit Reminder")}
      ${emailHeading(`${heading} — ${escapeHtml(payload.schoolName)}`)}
      ${emailParagraph(
        payload.digestKind === "weekly"
          ? "Here are scheduled admissions visits in the next seven days."
          : "Here are admissions visits scheduled for tomorrow.",
      )}
      ${emailBulletList(listItems)}
      ${emailCta({ label: "Open schedule", href: payload.scheduleAdminUrl })}
      ${emailSignOff()}
    `,
  });
}

export function buildScheduledVisitAdminDigestSubject(payload: {
  schoolName: string;
  digestKind: "weekly" | "day_before";
}): string {
  return payload.digestKind === "weekly"
    ? `Upcoming visits this week — ${payload.schoolName}`
    : `Visits tomorrow — ${payload.schoolName}`;
}

export async function sendScheduledVisitAdminDigestEmail(payload: {
  email: string;
  schoolName: string;
  digestKind: "weekly" | "day_before";
  scheduleAdminUrl: string;
  rows: ScheduledVisitAdminDigestRow[];
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ ok: boolean }> {
  const content = buildScheduledVisitAdminDigestHtml(payload);
  const subject = buildScheduledVisitAdminDigestSubject({
    schoolName: payload.schoolName,
    digestKind: payload.digestKind,
  });
  try {
    await deliverZohoEmail({
      channel: "Scheduled visit admin digest",
      toAddress: payload.email,
      subject,
      content,
      discord: schoolOutboundDiscord(
        "scheduled_visit_admin_digest",
        "school_admin",
        payload.schoolName,
        payload.notificationContext,
      ),
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export function buildPaymentReceiptConfirmationHtml(payload: {
  name: string;
  schoolName: string;
  label: string;
  amountCents: number;
  chargedAmountCents: number;
  processingFeeCents?: number | null;
  paymentMethodLabel: string;
  paidAtLabel: string;
  applyDashboardUrl: string;
}): string {
  const detailRows: Array<{ label: string; value: string }> = [
    { label: "School amount", value: formatFeeAmount(payload.amountCents) },
  ];

  if (payload.processingFeeCents && payload.processingFeeCents > 0) {
    detailRows.push({
      label: "Processing fee",
      value: formatFeeAmount(payload.processingFeeCents),
    });
  }

  detailRows.push(
    { label: "Total paid", value: formatFeeAmount(payload.chargedAmountCents) },
    { label: "Payment method", value: payload.paymentMethodLabel },
    { label: "Date paid", value: payload.paidAtLabel },
  );

  return composeEmail({
    preheader: `Your payment receipt for ${payload.schoolName}.`,
    contentHtml: `
      ${emailBadge("Payment Receipt")}
      ${emailHeading(`Thank you, ${firstName(payload.name)}.`)}
      ${emailParagraph(
        `We received your payment for ${escapeHtml(payload.label)} at ${escapeHtml(payload.schoolName)}.`,
      )}
      ${emailDetailCard(detailRows)}
      ${emailParagraph(
        "You can review your application and enrollment steps anytime from your apply dashboard.",
      )}
      ${emailCta({ label: "View apply dashboard", href: payload.applyDashboardUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendPaymentReceiptConfirmation(payload: {
  name: string;
  email: string;
  schoolName: string;
  label: string;
  amountCents: number;
  chargedAmountCents: number;
  processingFeeCents?: number | null;
  paymentMethodLabel: string;
  paidAt: string;
  applyDashboardUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const paidAtLabel = new Date(payload.paidAt).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const content = buildPaymentReceiptConfirmationHtml({
    ...payload,
    paidAtLabel,
  });

  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Payment receipt — ${payload.schoolName}`,
    content,
    discord: schoolOutboundDiscord(
      "admissions_payment_receipt",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Payment receipt confirmation email failed:", result.error);
  }
}

export type TuitionPaymentReceiptLineItem = {
  studentName: string;
  chargeLabel: string;
  amountCents: number;
};

export type TuitionPaymentReceiptLumpSumBreakdown = {
  installmentCents: number;
  futureCents: number;
  redistributed: boolean;
};

export function buildTuitionPaymentReceiptHtml(payload: {
  name: string;
  schoolName: string;
  billingUrl: string;
  paidAtLabel: string;
  paymentMethodLabel: string;
  amountCents: number;
  chargedAmountCents: number;
  processingFeeCents?: number | null;
  studentName?: string | null;
  chargeLabel?: string;
  lumpSumBreakdown?: TuitionPaymentReceiptLumpSumBreakdown;
  combinedLineItems?: TuitionPaymentReceiptLineItem[];
}): string {
  const isCombined =
    payload.combinedLineItems != null && payload.combinedLineItems.length > 0;

  const detailRows: Array<{ label: string; value: string }> = [];

  if (!isCombined) {
    if (payload.studentName) {
      detailRows.push({ label: "Student", value: payload.studentName });
    }
    if (payload.chargeLabel) {
      detailRows.push({ label: "Charge", value: payload.chargeLabel });
    }
  }

  detailRows.push({
    label: "School amount",
    value: formatFeeAmount(payload.amountCents),
  });

  if (payload.processingFeeCents && payload.processingFeeCents > 0) {
    detailRows.push({
      label: "Processing fee",
      value: formatFeeAmount(payload.processingFeeCents),
    });
  }

  detailRows.push(
    { label: "Total paid", value: formatFeeAmount(payload.chargedAmountCents) },
    { label: "Payment method", value: payload.paymentMethodLabel },
    { label: "Date paid", value: payload.paidAtLabel },
  );

  const lumpSumHtml =
    payload.lumpSumBreakdown && payload.lumpSumBreakdown.futureCents > 0
      ? `
      ${emailParagraph("Payment breakdown:")}
      ${emailDetailCard([
        {
          label: "Applied",
          value: `${formatFeeAmount(payload.lumpSumBreakdown.installmentCents)} installment · ${formatFeeAmount(payload.lumpSumBreakdown.futureCents)} future`,
        },
      ])}
      ${
        payload.lumpSumBreakdown.redistributed
          ? emailMutedParagraph("Future installments were recalculated.")
          : ""
      }
    `
      : "";

  const combinedHtml = isCombined
    ? `
      ${emailParagraph("Charges paid:")}
      ${emailBulletList(
        payload.combinedLineItems!.map(
          (item) =>
            `${escapeHtml(item.studentName)} — ${escapeHtml(item.chargeLabel)} — ${formatFeeAmount(item.amountCents)}`,
        ),
      )}
    `
    : "";

  return composeEmail({
    preheader: `Your tuition payment receipt for ${payload.schoolName}.`,
    contentHtml: `
      ${emailBadge("Payment Receipt")}
      ${emailHeading(`Thank you, ${firstName(payload.name)}.`)}
      ${emailParagraph(
        `We received your payment at ${escapeHtml(payload.schoolName)}.`,
      )}
      ${emailDetailCard(detailRows)}
      ${combinedHtml}
      ${lumpSumHtml}
      ${emailCta({ label: "View billing", href: payload.billingUrl })}
      ${emailSignOff()}
    `,
  });
}

export type AchBankVerificationLineItem = {
  label: string;
  amountCents: number;
  studentName?: string | null;
};

function achVerificationTimingParagraph(
  microdepositType: string | null,
  arrivalDateLabel: string | null,
): string {
  if (microdepositType === "descriptor_code") {
    const timing = arrivalDateLabel
      ? `Watch for a small Stripe entry on your bank statement around ${arrivalDateLabel}. The description includes a short verification code.`
      : "Watch for a small Stripe entry on your bank statement in the next few business days. The description includes a short verification code.";
    return `${timing} Then use the button below to enter that code. Until you do, your bank payment has not been submitted.`;
  }

  if (microdepositType === "amounts") {
    const timing = arrivalDateLabel
      ? `Two small deposits should appear around ${arrivalDateLabel}.`
      : "Two small deposits should appear in the next few business days.";
    return `${timing} Use the button below to enter both amounts. Until you do, your bank payment has not been submitted.`;
  }

  return "Your bank account still needs verification before the payment can go through. Use the button below to complete verification with Stripe.";
}

export function buildAchBankVerificationHtml(payload: {
  name: string;
  schoolName: string;
  verificationUrl: string;
  portalUrl: string;
  lineItems?: AchBankVerificationLineItem[];
  microdepositType?: string | null;
  arrivalDateLabel?: string | null;
}): string {
  const lineItems = payload.lineItems ?? [];
  const lineItemsHtml =
    lineItems.length > 0
      ? `
      ${emailParagraph("Payment(s) waiting on verification:")}
      ${emailBulletList(
        lineItems.map((item) => {
          const student =
            item.studentName != null && item.studentName.trim()
              ? `${escapeHtml(item.studentName)} — `
              : "";
          return `${student}${escapeHtml(item.label)} — ${formatFeeAmount(item.amountCents)}`;
        }),
      )}
    `
      : "";

  return composeEmail({
    preheader: `Verify your bank account to complete your payment at ${payload.schoolName}.`,
    contentHtml: `
      ${emailBadge("Action required")}
      ${emailHeading(`Hi ${firstName(payload.name)},`)}
      ${emailParagraph(
        `You started a bank account payment at ${escapeHtml(payload.schoolName)}, but Stripe still needs you to verify your bank before the payment can go through.`,
      )}
      ${emailParagraph(
        achVerificationTimingParagraph(
          payload.microdepositType ?? null,
          payload.arrivalDateLabel ?? null,
        ),
      )}
      ${lineItemsHtml}
      ${emailCta({ label: "Verify bank account", href: payload.verificationUrl })}
      ${emailMutedParagraph(
        `If you have trouble, you can pay with a card from your MudKitchen portal instead.`,
      )}
      ${emailCta({ label: "Open portal", href: payload.portalUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendAchBankVerificationEmail(payload: {
  email: string;
  name: string;
  schoolName: string;
  verificationUrl: string;
  portalUrl: string;
  lineItems?: AchBankVerificationLineItem[];
  microdepositType?: string | null;
  arrivalDate?: Date | null;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const arrivalDateLabel =
    payload.arrivalDate != null
      ? payload.arrivalDate.toLocaleDateString("en-US", { dateStyle: "long" })
      : null;

  const content = buildAchBankVerificationHtml({
    name: payload.name,
    schoolName: payload.schoolName,
    verificationUrl: payload.verificationUrl,
    portalUrl: payload.portalUrl,
    lineItems: payload.lineItems,
    microdepositType: payload.microdepositType,
    arrivalDateLabel,
  });

  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Verify your bank to complete payment — ${payload.schoolName}`,
    content,
    discord: schoolOutboundDiscord(
      "ach_bank_verification",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success || result.skipped) {
    return { ok: false };
  }

  return { ok: true };
}

export function buildTuitionAchSettlementFailedHtml(payload: {
  name: string;
  schoolName: string;
  billingUrl: string;
  chargeLabel: string;
  amountCents: number;
  settlementFailure: boolean;
  /** When settlement failed after an optimistic record, whether billing was reopened for payment. */
  chargeReopened?: boolean;
}): string {
  const chargeLabelHtml = escapeHtml(payload.chargeLabel);
  const amountLabel = formatFeeAmount(payload.amountCents);

  let detailParagraph: string;
  let actionParagraph: string;

  if (payload.settlementFailure) {
    if (payload.chargeReopened) {
      detailParagraph =
        `Your bank transfer for ${chargeLabelHtml} (${amountLabel}) did not complete. ` +
        "We updated billing so this charge is open again.";
      actionParagraph =
        "Open billing to pay with a card or a verified bank account.";
    } else {
      detailParagraph =
        `Your bank transfer for ${chargeLabelHtml} (${amountLabel}) did not complete. ` +
        "Billing may still show this charge as paid until your school corrects it.";
      actionParagraph =
        "Open billing to review your balance, or contact your school if you need help.";
    }
  } else {
    detailParagraph =
      `Your bank account payment could not be completed. No tuition was collected for ${chargeLabelHtml} (${amountLabel}).`;
    actionParagraph =
      "Please open billing and pay again with a card or a verified bank account.";
  }

  return composeEmail({
    preheader: `Your tuition bank payment did not go through at ${payload.schoolName}.`,
    contentHtml: `
      ${emailBadge("Payment issue")}
      ${emailHeading(`Hi ${firstName(payload.name)},`)}
      ${emailParagraph(detailParagraph)}
      ${emailParagraph(actionParagraph)}
      ${emailCta({ label: "View billing", href: payload.billingUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendTuitionAchSettlementFailedEmail(payload: {
  email: string;
  name: string;
  schoolName: string;
  billingUrl: string;
  chargeLabel: string;
  amountCents: number;
  settlementFailure: boolean;
  chargeReopened?: boolean;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const content = buildTuitionAchSettlementFailedHtml(payload);

  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Bank payment did not go through — ${payload.schoolName}`,
    content,
    discord: schoolOutboundDiscord(
      "tuition_ach_settlement_failed",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success || result.skipped) {
    return { ok: false };
  }

  return { ok: true };
}

export async function sendTuitionPaymentReceiptEmail(payload: {
  email: string;
  schoolName: string;
  name: string;
  billingUrl: string;
  paidAt: string;
  paymentMethodLabel: string;
  amountCents: number;
  chargedAmountCents: number;
  processingFeeCents?: number | null;
  studentName?: string | null;
  chargeLabel?: string;
  lumpSumBreakdown?: TuitionPaymentReceiptLumpSumBreakdown;
  combinedLineItems?: TuitionPaymentReceiptLineItem[];
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const paidAtLabel = new Date(payload.paidAt).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const content = buildTuitionPaymentReceiptHtml({
    name: payload.name,
    schoolName: payload.schoolName,
    billingUrl: payload.billingUrl,
    paidAtLabel,
    paymentMethodLabel: payload.paymentMethodLabel,
    amountCents: payload.amountCents,
    chargedAmountCents: payload.chargedAmountCents,
    processingFeeCents: payload.processingFeeCents,
    studentName: payload.studentName,
    chargeLabel: payload.chargeLabel,
    lumpSumBreakdown: payload.lumpSumBreakdown,
    combinedLineItems: payload.combinedLineItems,
  });

  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Payment receipt — ${payload.schoolName}`,
    content,
    discord: schoolOutboundDiscord(
      "tuition_payment_receipt",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Tuition payment receipt email failed:", result.error);
  }
}

export function buildTuitionAutopayConfirmationHtml(payload: {
  name: string;
  schoolName: string;
  billingUrl: string;
  periodLabel: string;
  paidAtLabel: string;
  paymentMethodLabel: string;
  lineItems: TuitionPaymentReceiptLineItem[];
  amountCents: number;
  chargedAmountCents: number;
  processingFeeCents?: number | null;
  showDisregardNote?: boolean;
}): string {
  const detailRows: Array<{ label: string; value: string }> = [
    { label: "School amount", value: formatFeeAmount(payload.amountCents) },
  ];
  if (payload.processingFeeCents && payload.processingFeeCents > 0) {
    detailRows.push({
      label: "Processing fee",
      value: formatFeeAmount(payload.processingFeeCents),
    });
  }
  detailRows.push(
    { label: "Total paid", value: formatFeeAmount(payload.chargedAmountCents) },
    { label: "Payment method", value: payload.paymentMethodLabel },
    { label: "Date paid", value: payload.paidAtLabel },
  );

  return composeEmail({
    preheader: `Your ${payload.periodLabel} tuition autopay at ${payload.schoolName} went through.`,
    contentHtml: `
      ${emailBadge("Autopay Confirmation")}
      ${emailHeading(`You're all set for ${escapeHtml(payload.periodLabel)}, ${firstName(payload.name)}.`)}
      ${emailParagraph(
        `Your autopay for ${escapeHtml(payload.periodLabel)} tuition at ${escapeHtml(payload.schoolName)} went through. Here's your receipt.`,
      )}
      ${emailParagraph("Charges paid:")}
      ${emailBulletList(
        payload.lineItems.map(
          (item) =>
            `${item.studentName} — ${item.chargeLabel} — ${formatFeeAmount(item.amountCents)}`,
        ),
      )}
      ${emailDetailCard(detailRows)}
      ${emailMutedParagraph("Bank payments can take 3–4 business days to appear on your statement.")}
      ${
        payload.showDisregardNote
          ? emailMutedParagraph(
              "If you saw an earlier autopay notice, you can disregard it. No action is needed.",
            )
          : ""
      }
      ${emailCta({ label: "View billing", href: payload.billingUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendTuitionAutopayConfirmationEmail(payload: {
  to: string;
  schoolName: string;
  periodLabel: string;
  html: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `Autopay received — ${payload.periodLabel} tuition — ${payload.schoolName}`,
    content: payload.html,
    discord: schoolOutboundDiscord(
      "tuition_autopay_confirmation",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Tuition autopay confirmation email failed:", result.error);
    return { ok: false };
  }

  return { ok: true };
}

export function buildStripePaymentsReadyHtml(payload: {
  schoolName: string;
  paymentsAdminUrl: string;
}): string {
  return composeEmail({
    preheader: `${payload.schoolName} can now collect application and enrollment fees online.`,
    contentHtml: `
      ${emailBadge("Payments Live")}
      ${emailHeading("You're ready to collect fees")}
      ${emailParagraph(
        `${escapeHtml(payload.schoolName)} can now accept application and enrollment fees online. Funds from family payments go directly to your school's Stripe account.`,
      )}
      ${emailParagraph(
        "Publish your application form so families can apply and pay. You can view payment history in your admissions dashboard, and manage payouts in your Stripe Express dashboard.",
      )}
      ${emailCta({ label: "Open payments setup", href: payload.paymentsAdminUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendStripePaymentsReadyNotification(payload: {
  email: string;
  schoolName: string;
  paymentsAdminUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildStripePaymentsReadyHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Payments are live — ${payload.schoolName}`,
    content,
    discord: schoolOutboundDiscord(
      "stripe_payments_ready",
      "school_admin",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Stripe payments ready notification email failed:", result.error);
  }
}

export type PaymentReceivedAdminLineItem = {
  label: string;
  amountCents: number;
  studentName?: string | null;
};

export function buildPaymentReceivedAdminNotificationHtml(payload: {
  schoolName: string;
  paymentTypeLabel: string;
  payerLabel: string;
  amountCents: number;
  chargedAmountCents: number;
  processingFeeCents?: number | null;
  paymentMethodLabel: string;
  paidAtLabel: string;
  studentName?: string | null;
  chargeLabel?: string | null;
  lineItems?: PaymentReceivedAdminLineItem[];
  paymentsAdminUrl: string;
}): string {
  const detailRows: Array<{ label: string; value: string }> = [
    { label: "Payment type", value: payload.paymentTypeLabel },
    { label: "Family / payer", value: payload.payerLabel },
  ];

  if (payload.studentName) {
    detailRows.push({ label: "Student", value: payload.studentName });
  }

  if (payload.chargeLabel && !payload.lineItems?.length) {
    detailRows.push({ label: "Charge", value: payload.chargeLabel });
  }

  detailRows.push(
    { label: "School amount", value: formatFeeAmount(payload.amountCents) },
  );

  if (payload.processingFeeCents && payload.processingFeeCents > 0) {
    detailRows.push({
      label: "Processing fee",
      value: formatFeeAmount(payload.processingFeeCents),
    });
  }

  detailRows.push(
    { label: "Total paid", value: formatFeeAmount(payload.chargedAmountCents) },
    { label: "Payment method", value: payload.paymentMethodLabel },
    { label: "Date paid", value: payload.paidAtLabel },
  );

  const lineItemsHtml =
    payload.lineItems && payload.lineItems.length > 0
      ? emailBulletList(
          payload.lineItems.map(
            (item) =>
              `${escapeHtml(item.studentName ? `${item.studentName} — ` : "")}${escapeHtml(item.label)} — ${formatFeeAmount(item.amountCents)}`,
          ),
        )
      : "";

  return composeEmail({
    preheader: `A family payment was received at ${payload.schoolName}.`,
    contentHtml: `
      ${emailBadge("Payment Received")}
      ${emailHeading("A payment was received")}
      ${emailParagraph(
        `A family completed a ${escapeHtml(payload.paymentTypeLabel.toLowerCase())} payment at ${escapeHtml(payload.schoolName)}.`,
      )}
      ${lineItemsHtml}
      ${emailDetailCard(detailRows)}
      ${emailCta({ label: "View payments", href: payload.paymentsAdminUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendPaymentReceivedAdminNotification(payload: {
  email: string;
  schoolName: string;
  paymentTypeLabel: string;
  payerLabel: string;
  amountCents: number;
  chargedAmountCents: number;
  processingFeeCents?: number | null;
  paymentMethodLabel: string;
  paidAt: string;
  studentName?: string | null;
  chargeLabel?: string | null;
  lineItems?: PaymentReceivedAdminLineItem[];
  paymentsAdminUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const paidAtLabel = new Date(payload.paidAt).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const content = buildPaymentReceivedAdminNotificationHtml({
    ...payload,
    paidAtLabel,
  });

  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Payment received — ${payload.schoolName}`,
    content,
    discord: schoolOutboundDiscord(
      "payment_received_admin_notification",
      "school_admin",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Payment received admin notification email failed:", result.error);
  }
}

export function buildAchBankVerificationAdminNotificationHtml(payload: {
  schoolName: string;
  paymentTypeLabel: string;
  payerLabel: string;
  familyEmailSent: boolean;
  lineItems?: PaymentReceivedAdminLineItem[];
  financesAdminUrl: string;
}): string {
  const familyStatus = payload.familyEmailSent
    ? "We sent the family an email from MudKitchen with a Stripe link to complete verification. No action is needed on your side unless you want to follow up."
    : "We couldn’t confirm the family verification email was delivered. You may want to check in with the family if they haven’t verified yet.";

  const lineItemsHtml =
    payload.lineItems && payload.lineItems.length > 0
      ? emailBulletList(
          payload.lineItems.map(
            (item) =>
              `${escapeHtml(item.studentName ? `${item.studentName} — ` : "")}${escapeHtml(item.label)} — ${formatFeeAmount(item.amountCents)}`,
          ),
        )
      : "";

  return composeEmail({
    preheader: `A family’s ACH payment is waiting on bank verification at ${payload.schoolName}.`,
    contentHtml: `
      ${emailBadge("Payment update")}
      ${emailHeading("ACH payment pending bank verification")}
      ${emailParagraph(
        `${escapeHtml(payload.payerLabel)} started an ACH ${escapeHtml(payload.paymentTypeLabel.toLowerCase())} payment at ${escapeHtml(payload.schoolName)}. The charge isn’t settled yet—the family must verify their bank with Stripe.`,
      )}
      ${emailDetailCard([
        { label: "Family / payer", value: payload.payerLabel },
        { label: "Payment type", value: payload.paymentTypeLabel },
      ])}
      ${lineItemsHtml ? emailParagraph("Affected payment(s):") : ""}
      ${lineItemsHtml}
      ${emailParagraph(familyStatus)}
      ${emailCta({ label: "View transactions", href: payload.financesAdminUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendAchBankVerificationAdminNotification(payload: {
  email: string;
  schoolName: string;
  paymentTypeLabel: string;
  payerLabel: string;
  familyEmailSent: boolean;
  lineItems?: PaymentReceivedAdminLineItem[];
  financesAdminUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ success: boolean; error?: string }> {
  if (!(await isZohoConfigured())) {
    return { success: false, error: "Zoho not configured" };
  }

  const content = buildAchBankVerificationAdminNotificationHtml(payload);

  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `ACH payment pending verification — ${payload.schoolName}`,
    content,
    discord: schoolOutboundDiscord(
      "ach_bank_verification_admin_notification",
      "school_admin",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error(
      "ACH bank verification admin notification email failed:",
      result.error,
    );
  }

  return result;
}

export function buildCommitteeJoinRequestAdminNotificationHtml(payload: {
  schoolName: string;
  committeeName: string;
  guardianName: string;
  guardianEmail: string;
  preferredDutyRoleTitle?: string | null;
  grade?: string | null;
  note?: string | null;
  submittedAtLabel: string;
  committeesAdminUrl: string;
}): string {
  const details = [
    { label: "School", value: payload.schoolName },
    { label: "Committee", value: payload.committeeName },
    { label: "Applicant", value: payload.guardianName },
    { label: "Email", value: payload.guardianEmail },
  ];

  if (payload.preferredDutyRoleTitle?.trim()) {
    details.push({
      label: "Preferred role",
      value: payload.preferredDutyRoleTitle.trim(),
    });
  }
  if (payload.grade?.trim()) {
    details.push({ label: "Grade", value: payload.grade.trim() });
  }
  if (payload.note?.trim()) {
    details.push({ label: "Note", value: payload.note.trim() });
  }
  details.push({ label: "Submitted", value: payload.submittedAtLabel });

  return composeEmail({
    preheader: `${payload.guardianName} requested to join ${payload.committeeName}.`,
    contentHtml: `
      ${emailBadge("Committee Join Request")}
      ${emailHeading("A member requested to join a committee")}
      ${emailParagraph(
        `${escapeHtml(payload.guardianName)} requested to join ${escapeHtml(payload.committeeName)} at ${escapeHtml(payload.schoolName)}. Review the request in your committees dashboard.`,
      )}
      ${emailDetailCard(details)}
      ${emailCta({ label: "Review request", href: payload.committeesAdminUrl })}
      ${emailSignOff()}
    `,
  });
}

export function buildFridayBranchEnrollmentAdminNotificationHtml(payload: {
  schoolName: string;
  className: string;
  slotTime: string;
  blockLabel: string;
  blockDateRange?: string;
  studentName: string;
  familyName: string;
  guardianName: string;
  guardianEmail: string;
  statusLabel: string;
  submittedAtLabel: string;
  fridayBranchAdminUrl: string;
}): string {
  const scheduleLabel = payload.blockDateRange
    ? `${payload.blockLabel} (${payload.blockDateRange})`
    : payload.blockLabel;

  const details = [
    { label: "School", value: payload.schoolName },
    { label: "Class", value: payload.className },
    { label: "Time", value: payload.slotTime },
    { label: "Block", value: scheduleLabel },
    { label: "Student", value: payload.studentName },
    { label: "Family", value: payload.familyName },
    { label: "Parent", value: payload.guardianName },
    { label: "Email", value: payload.guardianEmail },
    { label: "Status", value: payload.statusLabel },
    { label: "Submitted", value: payload.submittedAtLabel },
  ];

  return composeEmail({
    preheader: `${payload.studentName} signed up for ${payload.className}.`,
    contentHtml: `
      ${emailBadge("Program Sign-up")}
      ${emailHeading("A parent signed up for a program class")}
      ${emailParagraph(
        `${escapeHtml(payload.guardianName)} signed up ${escapeHtml(payload.studentName)} for ${escapeHtml(payload.className)} at ${escapeHtml(payload.schoolName)}.`,
      )}
      ${emailDetailCard(details)}
      ${emailCta({ label: "View Friday Branch", href: payload.fridayBranchAdminUrl })}
      ${emailSignOff()}
    `,
  });
}

const ROSTER_EMAIL_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

function buildFridayBranchRosterTableHtml(
  rows: {
    studentName: string;
    familyName: string;
    grade: string;
    statusLabel: string;
    familyEmail: string;
    familyPhone: string;
  }[],
): string {
  if (rows.length === 0) {
    return emailMutedParagraph("No students are signed up for this class yet.");
  }

  const header = `<tr>
    <th align="left" style="padding:8px 10px;font-family:${ROSTER_EMAIL_FONT};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.65;border-bottom:1px solid #E0E7E0;">Student</th>
    <th align="left" style="padding:8px 10px;font-family:${ROSTER_EMAIL_FONT};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.65;border-bottom:1px solid #E0E7E0;">Family</th>
    <th align="left" style="padding:8px 10px;font-family:${ROSTER_EMAIL_FONT};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.65;border-bottom:1px solid #E0E7E0;">Grade</th>
    <th align="left" style="padding:8px 10px;font-family:${ROSTER_EMAIL_FONT};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.65;border-bottom:1px solid #E0E7E0;">Status</th>
    <th align="left" style="padding:8px 10px;font-family:${ROSTER_EMAIL_FONT};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.65;border-bottom:1px solid #E0E7E0;">Email</th>
    <th align="left" style="padding:8px 10px;font-family:${ROSTER_EMAIL_FONT};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.65;border-bottom:1px solid #E0E7E0;">Phone</th>
  </tr>`;

  const body = rows
    .map(
      (row) => `<tr>
    <td style="padding:10px;font-family:${ROSTER_EMAIL_FONT};font-size:13px;line-height:1.5;border-bottom:1px solid #EEF2EE;">${escapeHtml(row.studentName)}</td>
    <td style="padding:10px;font-family:${ROSTER_EMAIL_FONT};font-size:13px;line-height:1.5;border-bottom:1px solid #EEF2EE;">${escapeHtml(row.familyName)}</td>
    <td style="padding:10px;font-family:${ROSTER_EMAIL_FONT};font-size:13px;line-height:1.5;border-bottom:1px solid #EEF2EE;">${escapeHtml(row.grade)}</td>
    <td style="padding:10px;font-family:${ROSTER_EMAIL_FONT};font-size:13px;line-height:1.5;border-bottom:1px solid #EEF2EE;">${escapeHtml(row.statusLabel)}</td>
    <td style="padding:10px;font-family:${ROSTER_EMAIL_FONT};font-size:13px;line-height:1.5;border-bottom:1px solid #EEF2EE;">${escapeHtml(row.familyEmail)}</td>
    <td style="padding:10px;font-family:${ROSTER_EMAIL_FONT};font-size:13px;line-height:1.5;border-bottom:1px solid #EEF2EE;">${escapeHtml(row.familyPhone)}</td>
  </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;border-collapse:collapse;">
  ${header}
  ${body}
</table>`;
}

export function buildFridayBranchClassRosterEmailHtml(payload: {
  schoolName: string;
  className: string;
  slotTime: string;
  location: string;
  ageGroup: string;
  teacher: string;
  blockLabel: string;
  blockDateRange: string;
  sentAtLabel: string;
  rows: {
    studentName: string;
    familyName: string;
    grade: string;
    statusLabel: string;
    familyEmail: string;
    familyPhone: string;
  }[];
}): string {
  const scheduleLabel = payload.blockDateRange
    ? `${payload.blockLabel} (${payload.blockDateRange})`
    : payload.blockLabel;

  const details = [
    { label: "School", value: payload.schoolName },
    { label: "Class", value: payload.className },
    { label: "Time", value: payload.slotTime },
    { label: "Location", value: payload.location },
    { label: "Age group", value: payload.ageGroup },
    { label: "Class leader", value: payload.teacher },
    { label: "Block", value: scheduleLabel },
    { label: "Sent", value: payload.sentAtLabel },
  ];

  return composeEmail({
    preheader: `${payload.className} roster for ${payload.slotTime}.`,
    contentHtml: `
      ${emailBadge("Class Roster")}
      ${emailHeading("Friday Branch class roster")}
      ${emailParagraph(
        `Here is the current sign-up roster for ${escapeHtml(payload.className)} at ${escapeHtml(payload.schoolName)}.`,
      )}
      ${emailDetailCard(details)}
      ${buildFridayBranchRosterTableHtml(payload.rows)}
      ${emailSignOff()}
    `,
  });
}

export async function sendFridayBranchClassRosterEmail(payload: {
  email: string;
  schoolName: string;
  className: string;
  slotTime: string;
  location: string;
  ageGroup: string;
  teacher: string;
  blockLabel: string;
  blockDateRange: string;
  sentAtLabel: string;
  rows: {
    studentName: string;
    familyName: string;
    grade: string;
    statusLabel: string;
    familyEmail: string;
    familyPhone: string;
  }[];
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ success: boolean; error?: string }> {
  if (!(await isZohoConfigured())) {
    return { success: false, error: "Email is not configured." };
  }

  const content = buildFridayBranchClassRosterEmailHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Friday Branch roster — ${payload.className} (${payload.slotTime})`,
    content,
    discord: schoolOutboundDiscord(
      "friday_branch_class_roster",
      "teacher",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true };
}

export async function sendFridayBranchEnrollmentAdminNotification(payload: {
  email: string;
  schoolName: string;
  className: string;
  slotTime: string;
  blockLabel: string;
  blockDateRange?: string;
  studentName: string;
  familyName: string;
  guardianName: string;
  guardianEmail: string;
  statusLabel: string;
  submittedAtLabel: string;
  fridayBranchAdminUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildFridayBranchEnrollmentAdminNotificationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Program sign-up — ${payload.schoolName}`,
    content,
    discord: schoolOutboundDiscord(
      "friday_branch_enrollment_admin",
      "school_admin",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error(
      "Friday Branch enrollment admin notification email failed:",
      result.error,
    );
  }
}

export async function sendCommitteeJoinRequestAdminNotification(payload: {
  email: string;
  schoolName: string;
  committeeName: string;
  guardianName: string;
  guardianEmail: string;
  preferredDutyRoleTitle?: string | null;
  grade?: string | null;
  note?: string | null;
  submittedAtLabel: string;
  committeesAdminUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildCommitteeJoinRequestAdminNotificationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Committee join request — ${payload.schoolName}`,
    content,
    discord: schoolOutboundDiscord(
      "committee_join_request_admin",
      "school_admin",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error(
      "Committee join request admin notification email failed:",
      result.error,
    );
  }
}

export function buildCommitteeTaskAssignedNotificationHtml(payload: {
  schoolName: string;
  committeeName: string;
  taskTitle: string;
  dueDateLabel?: string | null;
  assignerName: string;
  tasksUrl: string;
}): string {
  const details = [
    { label: "School", value: payload.schoolName },
    { label: "Committee", value: payload.committeeName },
    { label: "Task", value: payload.taskTitle },
    { label: "Assigned by", value: payload.assignerName },
  ];

  if (payload.dueDateLabel?.trim()) {
    details.push({ label: "Due date", value: payload.dueDateLabel.trim() });
  }

  return composeEmail({
    preheader: `${payload.assignerName} assigned "${payload.taskTitle}" to you.`,
    contentHtml: `
      ${emailBadge("Committee Task")}
      ${emailHeading("A committee task was assigned to you")}
      ${emailParagraph(
        `${escapeHtml(payload.assignerName)} assigned ${escapeHtml(payload.taskTitle)} on ${escapeHtml(payload.committeeName)} at ${escapeHtml(payload.schoolName)}.`,
      )}
      ${emailDetailCard(details)}
      ${emailCta({ label: "View task", href: payload.tasksUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendCommitteeTaskAssignedNotification(payload: {
  email: string;
  schoolName: string;
  committeeName: string;
  taskTitle: string;
  dueDateLabel?: string | null;
  assignerName: string;
  tasksUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildCommitteeTaskAssignedNotificationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Task assigned — ${payload.committeeName}`,
    content,
    discord: schoolOutboundDiscord(
      "committee_task_assigned",
      "staff",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error(
      "Committee task assigned notification email failed:",
      result.error,
    );
  }
}

export function buildCommitteeMessagePostedNotificationHtml(payload: {
  schoolName: string;
  committeeName: string;
  senderName: string;
  messagePreview: string;
  messagesUrl: string;
}): string {
  const details = [
    { label: "School", value: payload.schoolName },
    { label: "Committee", value: payload.committeeName },
    { label: "From", value: payload.senderName },
    { label: "Message", value: payload.messagePreview },
  ];

  return composeEmail({
    preheader: `New message on ${payload.committeeName}.`,
    contentHtml: `
      ${emailBadge("Committee Message")}
      ${emailHeading("New committee message")}
      ${emailParagraph(
        `${escapeHtml(payload.senderName)} posted in ${escapeHtml(payload.committeeName)} at ${escapeHtml(payload.schoolName)}.`,
      )}
      ${emailDetailCard(details)}
      ${emailCta({ label: "View messages", href: payload.messagesUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendCommitteeMessagePostedNotification(payload: {
  email: string;
  schoolName: string;
  committeeName: string;
  senderName: string;
  messagePreview: string;
  messagesUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  const content = buildCommitteeMessagePostedNotificationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `New message — ${payload.committeeName}`,
    content,
    discord: schoolOutboundDiscord(
      "committee_message_posted",
      "staff",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Committee message posted notification email failed:", result.error);
  }
}

export function buildCommitteeUnreadCatchUpEmailHtml(payload: {
  schoolName: string;
  recipientPortal: "parent" | "teacher";
  committees: Array<{
    committeeName: string;
    unreadCount: number;
    preview: string;
    senderName: string;
    messagesUrl: string;
  }>;
  totalUnread: number;
}): string {
  const portalLabel = payload.recipientPortal === "teacher" ? "staff" : "family";

  const committeeSections = payload.committees
    .map((committee) => {
      const messagesUrl = committee.messagesUrl.startsWith("http")
        ? committee.messagesUrl
        : `${SITE_URL}${committee.messagesUrl}`;
      const unreadLabel =
        committee.unreadCount === 1
          ? "1 unread message"
          : `${committee.unreadCount} unread messages`;

      return `
        ${emailDetailCard([
          { label: "Committee", value: escapeHtml(committee.committeeName) },
          { label: "From", value: escapeHtml(committee.senderName) },
          { label: "Unread", value: escapeHtml(unreadLabel) },
          {
            label: "Preview",
            value: escapeHtml(committee.preview.slice(0, 200)),
          },
        ])}
        ${emailCta({ label: "View messages", href: messagesUrl })}
      `;
    })
    .join("");

  const totalLabel =
    payload.totalUnread === 1
      ? "1 unread committee message"
      : `${payload.totalUnread} unread committee messages`;

  return composeEmail({
    preheader: `You have ${totalLabel} at ${payload.schoolName}.`,
    contentHtml: `
      ${emailBadge("Committee Messages")}
      ${emailHeading(`Unread committee messages`)}
      ${emailParagraph(
        `You have <strong>${escapeHtml(totalLabel)}</strong> waiting in your ${portalLabel} portal committees. Here is what you may have missed:`,
      )}
      ${committeeSections}
      ${emailSignOff()}
    `,
  });
}

function buildCommitteeUnreadCatchUpSubject(
  schoolName: string,
  committees: Array<{ committeeName: string }>,
): string {
  if (committees.length === 1) {
    return `Unread committee messages — ${committees[0].committeeName}`;
  }
  return `Unread committee messages — ${schoolName}`;
}

export async function sendCommitteeUnreadCatchUpEmail(payload: {
  email: string;
  schoolName: string;
  recipientPortal: "parent" | "teacher";
  committees: Array<{
    committeeName: string;
    unreadCount: number;
    preview: string;
    senderName: string;
    messagesUrl: string;
  }>;
  totalUnread: number;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<boolean> {
  if (payload.committees.length === 0) {
    return false;
  }

  if (!(await isZohoConfigured())) {
    return false;
  }

  const content = buildCommitteeUnreadCatchUpEmailHtml(payload);
  const audience: OutboundEmailAudience =
    payload.recipientPortal === "teacher" ? "teacher" : "parent";
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: buildCommitteeUnreadCatchUpSubject(payload.schoolName, payload.committees),
    content,
    discord: schoolOutboundDiscord(
      "committee_unread_catchup",
      audience,
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Committee unread catch-up email failed:", result.error);
    throw new Error(result.error ?? "Committee unread catch-up email failed");
  }

  return true;
}

export function buildCommitteeUnreadWorkspaceDigestEmailHtml(payload: {
  schoolName: string;
  recipientPortal: "parent" | "teacher";
  committees: Array<{
    committeeName: string;
    sectionLabels: string[];
    sectionPreviews?: Array<{ section: string; label: string; preview: string }>;
    workspaceUrl: string;
    unreadCount: number;
  }>;
  totalUnread: number;
}): string {
  const portalLabel = payload.recipientPortal === "teacher" ? "staff" : "family";

  const committeeSections = payload.committees
    .map((committee) => {
      const workspaceUrl = committee.workspaceUrl.startsWith("http")
        ? committee.workspaceUrl
        : `${SITE_URL}${committee.workspaceUrl}`;
      const sectionsLabel = committee.sectionLabels.join(" · ");
      const unreadLabel =
        committee.unreadCount === 1
          ? "1 unread update"
          : `${committee.unreadCount} unread updates`;

      const previewRows =
        committee.sectionPreviews?.map((row) => ({
          label: row.label,
          value: escapeHtml(row.preview),
        })) ?? [];

      const detailRows = [
        { label: "Committee", value: escapeHtml(committee.committeeName) },
        { label: "Unread", value: escapeHtml(unreadLabel) },
        ...(previewRows.length > 0
          ? previewRows
          : [{ label: "Sections", value: escapeHtml(sectionsLabel) }]),
      ];

      return `
        ${emailDetailCard(detailRows)}
        ${emailCta({ label: "Open committee", href: workspaceUrl })}
      `;
    })
    .join("");

  const totalLabel =
    payload.totalUnread === 1
      ? "1 unread committee update"
      : `${payload.totalUnread} unread committee updates`;

  return composeEmail({
    preheader: `You have ${totalLabel} at ${payload.schoolName}.`,
    contentHtml: `
      ${emailBadge("Committee Updates")}
      ${emailHeading(`Unread committee updates`)}
      ${emailParagraph(
        `You have <strong>${escapeHtml(totalLabel)}</strong> waiting in your ${portalLabel} portal committees:`,
      )}
      ${committeeSections}
      ${emailSignOff()}
    `,
  });
}

function buildCommitteeUnreadWorkspaceDigestSubject(
  schoolName: string,
  committees: Array<{ committeeName: string }>,
): string {
  if (committees.length === 1) {
    return `Unread committee updates — ${committees[0].committeeName}`;
  }
  return `Unread committee updates — ${schoolName}`;
}

export async function sendCommitteeUnreadWorkspaceDigestEmail(payload: {
  email: string;
  schoolName: string;
  recipientPortal: "parent" | "teacher";
  committees: Array<{
    committeeName: string;
    sectionLabels: string[];
    sectionPreviews?: Array<{ section: string; label: string; preview: string }>;
    workspaceUrl: string;
    unreadCount: number;
  }>;
  totalUnread: number;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<boolean> {
  if (payload.committees.length === 0) {
    return false;
  }

  if (!(await isZohoConfigured())) {
    return false;
  }

  const content = buildCommitteeUnreadWorkspaceDigestEmailHtml(payload);
  const audience: OutboundEmailAudience =
    payload.recipientPortal === "teacher" ? "teacher" : "parent";
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: buildCommitteeUnreadWorkspaceDigestSubject(
      payload.schoolName,
      payload.committees,
    ),
    content,
    discord: schoolOutboundDiscord(
      "committee_unread_workspace_digest",
      audience,
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Committee unread workspace digest email failed:", result.error);
    throw new Error(result.error ?? "Committee unread workspace digest email failed");
  }

  return true;
}

export function buildCommitteeWorkspaceUpdateNotificationHtml(payload: {
  schoolName: string;
  committeeName: string;
  updateTitle: string;
  updateSummary: string;
  workspaceUrl: string;
}): string {
  const details = [
    { label: "School", value: payload.schoolName },
    { label: "Committee", value: payload.committeeName },
    { label: "Update", value: payload.updateTitle },
    { label: "Details", value: payload.updateSummary },
  ];

  return composeEmail({
    preheader: `${payload.updateTitle} on ${payload.committeeName}.`,
    contentHtml: `
      ${emailBadge("Committee Update")}
      ${emailHeading(payload.updateTitle)}
      ${emailParagraph(
        `There is a new update in ${escapeHtml(payload.committeeName)} at ${escapeHtml(payload.schoolName)}.`,
      )}
      ${emailDetailCard(details)}
      ${emailCta({ label: "Open committee", href: payload.workspaceUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendCommitteeWorkspaceUpdateNotification(payload: {
  email: string;
  schoolName: string;
  committeeName: string;
  updateTitle: string;
  updateSummary: string;
  workspaceUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  const content = buildCommitteeWorkspaceUpdateNotificationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `${payload.updateTitle} — ${payload.committeeName}`,
    content,
    discord: schoolOutboundDiscord(
      "committee_workspace_update",
      "staff",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Committee workspace update notification email failed:", result.error);
  }
}

export function buildCommitteeJoinApprovedNotificationHtml(payload: {
  schoolName: string;
  committeeName: string;
  memberName: string;
  committeesUrl: string;
}): string {
  const details = [
    { label: "School", value: payload.schoolName },
    { label: "Committee", value: payload.committeeName },
    { label: "Member", value: payload.memberName },
  ];

  return composeEmail({
    preheader: `You're approved to join ${payload.committeeName}.`,
    contentHtml: `
      ${emailBadge("Committee Approved")}
      ${emailHeading("Your committee request was approved")}
      ${emailParagraph(
        `${escapeHtml(payload.schoolName)} approved your request to join ${escapeHtml(payload.committeeName)}. You can open your committee workspace in the portal anytime.`,
      )}
      ${emailDetailCard(details)}
      ${emailCta({ label: "Open committee", href: payload.committeesUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendCommitteeJoinApprovedNotification(payload: {
  email: string;
  schoolName: string;
  committeeName: string;
  memberName: string;
  committeesUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildCommitteeJoinApprovedNotificationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Committee approved — ${payload.committeeName}`,
    content,
    discord: schoolOutboundDiscord(
      "committee_join_approved",
      "staff",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error(
      "Committee join approved notification email failed:",
      result.error,
    );
  }
}

export function buildCommitteeDailyDigestHtml(payload: {
  schoolName: string;
  recipientName?: string | null;
  recipientKind: "member" | "admin";
  committees: Array<{
    committeeName: string;
    categories: Array<{
      category: string;
      items: Array<{
        title: string;
        actionLabel: string;
        details: string[];
        actorName?: string | null;
        occurredAtLabel: string;
      }>;
      truncatedCount: number;
    }>;
  }>;
  committeesUrl: string;
}): string {
  const greetingName = payload.recipientName?.trim();
  const intro = payload.recipientKind === "admin"
    ? `${escapeHtml(payload.schoolName)} had committee activity in the last day.`
    : greetingName
      ? `Hi ${escapeHtml(greetingName)}, here is what happened in your committees at ${escapeHtml(payload.schoolName)}.`
      : `Here is what happened in your committees at ${escapeHtml(payload.schoolName)}.`;

  const committeeSections = payload.committees
    .map((committee) => {
      const categorySections = committee.categories
        .map((category) => {
          const cards = category.items
            .map((item) => emailDigestActivityCard(item))
            .join("");
          const truncatedNote =
            category.truncatedCount > 0
              ? emailMutedParagraph(
                  `and ${category.truncatedCount} more ${category.category.toLowerCase()} update${category.truncatedCount === 1 ? "" : "s"}`,
                )
              : "";

          return `
            ${emailDigestSectionHeader(category.category)}
            ${cards}
            ${truncatedNote}
          `;
        })
        .join("");

      return `
        ${emailHeading(committee.committeeName)}
        ${categorySections}
      `;
    })
    .join("");

  return composeEmail({
    preheader: `Committee activity update for ${payload.schoolName}.`,
    contentHtml: `
      ${emailBadge("Committee Update")}
      ${emailHeading("Today's committee activity")}
      ${emailParagraph(intro)}
      ${committeeSections}
      ${emailCta({ label: "Open committees", href: payload.committeesUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendCommitteeDailyDigestEmail(payload: {
  email: string;
  schoolName: string;
  recipientName?: string | null;
  recipientKind: "member" | "admin";
  committees: Array<{
    committeeName: string;
    categories: Array<{
      category: string;
      items: Array<{
        title: string;
        actionLabel: string;
        details: string[];
        actorName?: string | null;
        occurredAtLabel: string;
      }>;
      truncatedCount: number;
    }>;
  }>;
  committeesUrl: string;
  subject: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildCommitteeDailyDigestHtml(payload);
  const audience: OutboundEmailAudience =
    payload.recipientKind === "admin" ? "school_admin" : "staff";
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: payload.subject,
    content,
    discord: schoolOutboundDiscord(
      "committee_daily_digest",
      audience,
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Committee daily digest email failed:", result.error);
    throw new Error(result.error ?? "Committee daily digest email failed");
  }
}

export function buildTuitionDueReminderHtml(payload: {
  familyName: string;
  schoolName: string;
  dueDate: string;
  totalDue: string;
  chargeLines: string[];
  billingUrl?: string;
}): string {
  const dueDateLabel = formatDateOnlyLongLabel(payload.dueDate);
  return composeEmail({
    preheader: `Tuition payment of ${payload.totalDue} is due ${dueDateLabel}.`,
    contentHtml: `
      ${emailBadge("Tuition Reminder")}
      ${emailHeading(`Upcoming tuition due for ${escapeHtml(payload.familyName)}`)}
      ${emailParagraph(
        `${escapeHtml(payload.schoolName)} has tuition charges coming due on ${escapeHtml(dueDateLabel)}.`,
      )}
      ${emailDetailCard([
        { label: "Total due", value: payload.totalDue },
        { label: "Due date", value: dueDateLabel },
      ])}
      ${emailParagraph("Charges:")}
      ${emailBulletList(payload.chargeLines)}
      ${payload.billingUrl ? emailCta({ label: "View billing", href: payload.billingUrl }) : ""}
      ${emailSignOff()}
    `,
  });
}

export async function sendTuitionDueReminderEmail(payload: {
  to: string;
  schoolName: string;
  html: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `Tuition reminder — ${payload.schoolName}`,
    content: payload.html,
    discord: schoolOutboundDiscord(
      "tuition_due_reminder",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Tuition due reminder email failed:", result.error);
    return { ok: false };
  }

  return { ok: true };
}

export function buildTuitionLateFeeHtml(payload: {
  familyName: string;
  schoolName: string;
  totalDue: string;
  chargeLines: string[];
  billingUrl?: string;
}): string {
  return composeEmail({
    preheader: `A late fee of ${payload.totalDue} has been added to your balance.`,
    contentHtml: `
      ${emailBadge("Late Fee")}
      ${emailHeading(`Late fee added for ${escapeHtml(payload.familyName)}`)}
      ${emailParagraph(
        `${escapeHtml(payload.schoolName)} has added a late fee to your tuition balance because payment was not received by the due date.`,
      )}
      ${emailDetailCard([
        { label: "Late fee total", value: payload.totalDue },
      ])}
      ${emailParagraph("Charges:")}
      ${emailBulletList(payload.chargeLines)}
      ${payload.billingUrl ? emailCta({ label: "View billing", href: payload.billingUrl }) : ""}
      ${emailSignOff()}
    `,
  });
}

export async function sendTuitionLateFeeEmail(payload: {
  to: string;
  schoolName: string;
  html: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `Late fee notice — ${payload.schoolName}`,
    content: payload.html,
    discord: schoolOutboundDiscord(
      "tuition_late_fee",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Tuition late fee email failed:", result.error);
    return { ok: false };
  }

  return { ok: true };
}

export function buildTuitionInvoiceHtml(payload: {
  familyName: string;
  schoolName: string;
  chargeLabel: string;
  amountDue: string;
  dueDate: string;
  billingUrl: string;
}): string {
  const dueDateLabel = formatDateOnlyLongLabel(payload.dueDate);
  return composeEmail({
    preheader: `${payload.chargeLabel} — ${payload.amountDue} due ${dueDateLabel}.`,
    contentHtml: `
      ${emailBadge("Tuition Invoice")}
      ${emailHeading(`Invoice for ${escapeHtml(payload.familyName)}`)}
      ${emailParagraph(
        `${escapeHtml(payload.schoolName)} sent you a tuition invoice. Sign in to your parent portal to review and pay online.`,
      )}
      ${emailDetailCard([
        { label: "Charge", value: payload.chargeLabel },
        { label: "Amount due", value: payload.amountDue },
        { label: "Due date", value: dueDateLabel },
      ])}
      ${emailCta({ label: "View and pay", href: payload.billingUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendTuitionInvoiceEmail(payload: {
  to: string;
  schoolName: string;
  html: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `Invoice from ${payload.schoolName}`,
    content: payload.html,
    discord: schoolOutboundDiscord(
      "tuition_invoice",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Tuition invoice email failed:", result.error);
    return { ok: false };
  }

  return { ok: true };
}

export function buildTuitionAutopayFailedHtml(payload: {
  familyName: string;
  schoolName: string;
  chargeLabel: string;
  amountDue: string;
  billingUrl: string;
  errorMessage?: string;
}): string {
  return composeEmail({
    preheader: `Autopay could not process ${payload.chargeLabel}.`,
    contentHtml: `
      ${emailBadge("Autopay Failed")}
      ${emailHeading(`We couldn't process autopay for ${escapeHtml(payload.familyName)}`)}
      ${emailParagraph(
        `${escapeHtml(payload.schoolName)} tried to charge your saved payment method for tuition, but the payment did not go through.`,
      )}
      ${emailDetailCard([
        { label: "Charge", value: payload.chargeLabel },
        { label: "Amount", value: payload.amountDue },
      ])}
      ${
        payload.errorMessage
          ? emailParagraph(
              `Reason: ${escapeHtml(payload.errorMessage)}. Please update your card or pay manually.`,
            )
          : emailParagraph("Please update your card or pay manually before the due date.")
      }
      ${emailCta({ label: "Manage billing", href: payload.billingUrl })}
      ${emailSignOff()}
    `,
  });
}

export function buildTuitionAutopayUpcomingHtml(payload: {
  familyName: string;
  schoolName: string;
  chargeDate: string;
  totalDue: string;
  chargeLines: string[];
  billingUrl?: string;
}): string {
  const chargeDateLabel = formatDateOnlyLongLabel(payload.chargeDate);
  return composeEmail({
    preheader: `Autopay will process ${payload.totalDue} tomorrow.`,
    contentHtml: `
      ${emailBadge("Autopay Reminder")}
      ${emailHeading(`Autopay scheduled for ${escapeHtml(payload.familyName)}`)}
      ${emailParagraph(
        `${escapeHtml(payload.schoolName)} will charge your saved payment method tomorrow (${escapeHtml(chargeDateLabel)}) for the tuition below.`,
      )}
      ${emailDetailCard([
        { label: "Total", value: payload.totalDue },
        { label: "Charge date", value: chargeDateLabel },
      ])}
      ${emailParagraph("Charges:")}
      ${emailBulletList(payload.chargeLines)}
      ${payload.billingUrl ? emailCta({ label: "View billing", href: payload.billingUrl }) : ""}
      ${emailParagraph(
        "To update your card or turn off autopay, visit billing before tomorrow.",
      )}
      ${emailSignOff()}
    `,
  });
}

export async function sendTuitionAutopayUpcomingEmail(payload: {
  to: string;
  schoolName: string;
  html: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `Autopay reminder — ${payload.schoolName}`,
    content: payload.html,
    discord: schoolOutboundDiscord(
      "tuition_autopay_upcoming",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Tuition autopay upcoming email failed:", result.error);
    return { ok: false };
  }

  return { ok: true };
}

export async function sendTuitionAutopayFailedEmail(payload: {
  to: string;
  schoolName: string;
  html: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `Autopay failed — ${payload.schoolName}`,
    content: payload.html,
    discord: schoolOutboundDiscord(
      "tuition_autopay_failed",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Tuition autopay failed email failed:", result.error);
    return { ok: false };
  }

  return { ok: true };
}

export function buildNewMessageEmailHtml(payload: {
  schoolName: string;
  senderName: string;
  preview: string;
  threadUrl: string;
}): string {
  const absoluteUrl = payload.threadUrl.startsWith("http")
    ? payload.threadUrl
    : `${SITE_URL}${payload.threadUrl}`;

  return composeEmail({
    preheader: `New message from ${payload.senderName}`,
    contentHtml: `
      ${emailBadge("New Message")}
      ${emailHeading(`You have a new message at ${escapeHtml(payload.schoolName)}`)}
      ${emailParagraph(
        `<strong>${escapeHtml(payload.senderName)}</strong> sent you a message:`,
      )}
      ${emailDetailCard([
        {
          label: "Preview",
          value: escapeHtml(payload.preview.slice(0, 200)),
        },
      ])}
      ${emailCta({ label: "View conversation", href: absoluteUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendNewMessageEmail(payload: {
  email: string;
  schoolName: string;
  senderName: string;
  preview: string;
  threadUrl: string;
  recipientAudience?: OutboundEmailAudience;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const html = buildNewMessageEmailHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `New message from ${payload.senderName} — ${payload.schoolName}`,
    content: html,
    discord: schoolOutboundDiscord(
      "new_message",
      payload.recipientAudience ?? "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("New message email failed:", result.error);
    return { ok: false };
  }

  return { ok: true };
}

export function buildUnreadMessagesDigestEmailHtml(payload: {
  schoolName: string;
  recipientPortal: "parent" | "teacher";
  threads: Array<{
    unreadCount: number;
    preview: string;
    senderName: string;
    threadUrl: string;
  }>;
  totalUnread: number;
  messagesUrl: string;
}): string {
  const portalLabel = payload.recipientPortal === "teacher" ? "staff" : "family";
  const absoluteInboxUrl = payload.messagesUrl.startsWith("http")
    ? payload.messagesUrl
    : `${SITE_URL}${payload.messagesUrl}`;

  const threadSections = payload.threads
    .map((thread) => {
      const threadUrl = thread.threadUrl.startsWith("http")
        ? thread.threadUrl
        : `${SITE_URL}${thread.threadUrl}`;
      const unreadLabel =
        thread.unreadCount === 1
          ? "1 unread message"
          : `${thread.unreadCount} unread messages`;

      return `
        ${emailDetailCard([
          { label: "From", value: escapeHtml(thread.senderName) },
          {
            label: "Unread",
            value: escapeHtml(unreadLabel),
          },
          {
            label: "Preview",
            value: escapeHtml(thread.preview.slice(0, 200)),
          },
        ])}
        ${emailCta({ label: "Open conversation", href: threadUrl })}
      `;
    })
    .join("");

  const totalLabel =
    payload.totalUnread === 1
      ? "1 unread message"
      : `${payload.totalUnread} unread messages`;

  return composeEmail({
    preheader: `You still have ${totalLabel} at ${payload.schoolName}.`,
    contentHtml: `
      ${emailBadge("Message Reminder")}
      ${emailHeading(`Unread messages at ${escapeHtml(payload.schoolName)}`)}
      ${emailParagraph(
        `You still have <strong>${escapeHtml(totalLabel)}</strong> waiting in your ${portalLabel} portal. Here is what you may have missed:`,
      )}
      ${threadSections}
      ${emailCta({ label: "Open messages", href: absoluteInboxUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendUnreadMessagesDigestEmail(payload: {
  email: string;
  schoolName: string;
  recipientPortal: "parent" | "teacher";
  threads: Array<{
    threadId: string;
    unreadCount: number;
    preview: string;
    senderName: string;
    threadUrl: string;
  }>;
  totalUnread: number;
  messagesUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<boolean> {
  if (payload.threads.length === 0) {
    return false;
  }

  if (!(await isZohoConfigured())) {
    return false;
  }

  const html = buildUnreadMessagesDigestEmailHtml(payload);
  const audience: OutboundEmailAudience =
    payload.recipientPortal === "teacher" ? "teacher" : "parent";
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `You still have unread messages — ${payload.schoolName}`,
    content: html,
    discord: schoolOutboundDiscord(
      "unread_messages_digest",
      audience,
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Unread messages digest email failed:", result.error);
    return false;
  }

  return true;
}

export function buildTeacherParentFormPublishedEmailHtml(payload: {
  schoolName: string;
  publisherName: string;
  formTitle: string;
  dueDate?: string | null;
  studentNames?: string[];
  formUrl: string;
}): string {
  const absoluteUrl = payload.formUrl.startsWith("http")
    ? payload.formUrl
    : `${SITE_URL}${payload.formUrl}`;

  const details: { label: string; value: string }[] = [
    { label: "School", value: payload.schoolName },
    { label: "Form", value: payload.formTitle },
    { label: "From", value: payload.publisherName },
  ];

  if (payload.dueDate) {
    details.push({ label: "Due", value: formatDateOnlyLongLabel(payload.dueDate) });
  }

  if (payload.studentNames && payload.studentNames.length > 0) {
    details.push({
      label: "Students",
      value: payload.studentNames.join(", "),
    });
  }

  return composeEmail({
    preheader: `${payload.publisherName} posted a form for you to sign`,
    contentHtml: `
      ${emailBadge("Form to Sign")}
      ${emailHeading(`A form is ready to sign at ${escapeHtml(payload.schoolName)}`)}
      ${emailParagraph(
        `<strong>${escapeHtml(payload.publisherName)}</strong> posted <strong>${escapeHtml(payload.formTitle)}</strong> for your family to review and sign.`,
      )}
      ${emailDetailCard(details)}
      ${emailCta({ label: "Sign form", href: absoluteUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendTeacherParentFormPublishedEmail(payload: {
  to: string;
  schoolName: string;
  publisherName: string;
  formTitle: string;
  dueDate?: string | null;
  studentNames?: string[];
  formUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const html = buildTeacherParentFormPublishedEmailHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `Form to sign — ${payload.schoolName}`,
    content: html,
    discord: schoolOutboundDiscord(
      "teacher_parent_form_published",
      "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Teacher parent form published email failed:", result.error);
    return { ok: false };
  }

  return { ok: true };
}

export function buildTeacherParentFormResponseSignedEmailHtml(payload: {
  schoolName: string;
  familyName: string;
  formTitle: string;
  formUrl: string;
}): string {
  const absoluteUrl = payload.formUrl.startsWith("http")
    ? payload.formUrl
    : `${SITE_URL}${payload.formUrl}`;

  return composeEmail({
    preheader: `${payload.familyName} signed ${payload.formTitle}`,
    contentHtml: `
      ${emailBadge("Form Signed")}
      ${emailHeading(`A family signed your form at ${escapeHtml(payload.schoolName)}`)}
      ${emailParagraph(
        `<strong>${escapeHtml(payload.familyName)}</strong> signed <strong>${escapeHtml(payload.formTitle)}</strong>.`,
      )}
      ${emailDetailCard([
        { label: "School", value: payload.schoolName },
        { label: "Family", value: payload.familyName },
        { label: "Form", value: payload.formTitle },
      ])}
      ${emailCta({ label: "View form", href: absoluteUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendTeacherParentFormResponseSignedEmail(payload: {
  to: string;
  schoolName: string;
  familyName: string;
  formTitle: string;
  formUrl: string;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const html = buildTeacherParentFormResponseSignedEmailHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `Form signed — ${payload.schoolName}`,
    content: html,
    discord: schoolOutboundDiscord(
      "teacher_parent_form_response_signed",
      "teacher",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    console.error("Teacher parent form response signed email failed:", result.error);
    return { ok: false };
  }

  return { ok: true };
}

const BULLETIN_EMAIL_EXCERPT_MAX = 280;

export function truncateBulletinBodyExcerpt(body: string, maxLen = BULLETIN_EMAIL_EXCERPT_MAX): string {
  const trimmed = body.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen - 1)}…`;
}

export function buildBulletinPublishedEmailHtml(payload: {
  schoolName: string;
  postTitle: string;
  audienceLabel: string;
  excerpt: string;
  attachmentCount: number;
  portalUrl: string;
  publisherName?: string | null;
}): string {
  const absoluteUrl = payload.portalUrl.startsWith("http")
    ? payload.portalUrl
    : `${SITE_URL}${payload.portalUrl}`;

  const details: { label: string; value: string }[] = [
    { label: "School", value: payload.schoolName },
    { label: "Announcement", value: payload.postTitle },
    { label: "Audience", value: payload.audienceLabel },
  ];

  if (payload.publisherName?.trim()) {
    details.push({ label: "Posted by", value: payload.publisherName.trim() });
  }

  if (payload.attachmentCount > 0) {
    details.push({
      label: "Attachments",
      value: `${payload.attachmentCount} file${payload.attachmentCount === 1 ? "" : "s"}`,
    });
  }

  const excerptBlock = payload.excerpt
    ? emailParagraph(escapeHtml(payload.excerpt))
    : "";

  return composeEmail({
    preheader: `New announcement at ${payload.schoolName}: ${payload.postTitle}`,
    contentHtml: `
      ${emailBadge("New Announcement")}
      ${emailHeading(`New bulletin post at ${escapeHtml(payload.schoolName)}`)}
      ${emailParagraph(
        `<strong>${escapeHtml(payload.postTitle)}</strong> was just posted on the school bulletin.`,
      )}
      ${emailDetailCard(details)}
      ${excerptBlock}
      ${emailCta({ label: "View bulletin", href: absoluteUrl })}
      ${emailSignOff()}
    `,
  });
}

export async function sendBulletinPublishedEmail(payload: {
  to: string;
  schoolName: string;
  postTitle: string;
  audienceLabel: string;
  excerpt: string;
  attachmentCount: number;
  portalUrl: string;
  publisherName?: string | null;
  recipientAudience?: OutboundEmailAudience;
  notificationContext?: OutboundEmailNotificationContext;
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const html = buildBulletinPublishedEmailHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `New announcement — ${payload.schoolName}`,
    content: html,
    discord: schoolOutboundDiscord(
      "bulletin_published",
      payload.recipientAudience ?? "parent",
      payload.schoolName,
      payload.notificationContext,
    ),
  });

  if (!result.success) {
    return { ok: false };
  }

  return { ok: true };
}
