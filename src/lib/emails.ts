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
import { formatDurationLabel } from "@/lib/admissions/admissions-availability";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { deliverZohoEmail } from "@/lib/notification-delivery";
import { isZohoConfigured, sendZohoEmail } from "@/lib/zoho";

function formatSelectedDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
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
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildAdminSupportRequestConfirmationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.submitterEmail,
    subject: `We received your support request — ${SITE_NAME}`,
    content,
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
}): Promise<void> {
  const content = buildApplicationSubmittedConfirmationHtml(payload);
  await deliverZohoEmail({
    channel: "Application submitted confirmation",
    toAddress: payload.email,
    subject: `Application received — ${payload.schoolName}`,
    content,
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
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildApplicationAcceptedEnrollmentHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Congratulations — continue enrollment at ${payload.schoolName}`,
    content,
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
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `Finish your application — ${payload.schoolName}`,
    content: payload.html,
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
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: payload.subject,
    content: payload.html,
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
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildEnrollmentCompletedConfirmationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Enrollment confirmed — ${payload.schoolName}`,
    content,
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
}): Promise<void> {
  const content = buildApplicationSubmittedOwnerNotificationHtml(payload);
  await deliverZohoEmail({
    channel: "Application submitted owner notification",
    toAddress: payload.email,
    subject: `New application submitted — ${payload.schoolName}`,
    content,
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
}): Promise<void> {
  const content = buildPostSubmitVisitOwnerNotificationHtml(payload);
  await deliverZohoEmail({
    channel: "Post-submit visit owner notification",
    toAddress: payload.email,
    subject: `Visit scheduled — ${payload.schoolName}`,
    content,
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
}): Promise<void> {
  const content = buildPostSubmitVisitConfirmationHtml(payload);
  await deliverZohoEmail({
    channel: "Post-submit visit confirmation",
    toAddress: payload.email,
    subject: `${payload.stepTitle} confirmed — ${payload.schoolName}`,
    content,
  });
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
  });

  if (!result.success) {
    console.error("Tuition payment receipt email failed:", result.error);
  }
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
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildStripePaymentsReadyHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Payments are live — ${payload.schoolName}`,
    content,
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
  });

  if (!result.success) {
    console.error("Payment received admin notification email failed:", result.error);
  }
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
}): Promise<{ success: boolean; error?: string }> {
  if (!(await isZohoConfigured())) {
    return { success: false, error: "Email is not configured." };
  }

  const content = buildFridayBranchClassRosterEmailHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Friday Branch roster — ${payload.className} (${payload.slotTime})`,
    content,
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
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildFridayBranchEnrollmentAdminNotificationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Program sign-up — ${payload.schoolName}`,
    content,
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
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildCommitteeJoinRequestAdminNotificationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Committee join request — ${payload.schoolName}`,
    content,
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
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildCommitteeTaskAssignedNotificationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Task assigned — ${payload.committeeName}`,
    content,
  });

  if (!result.success) {
    console.error(
      "Committee task assigned notification email failed:",
      result.error,
    );
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
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildCommitteeJoinApprovedNotificationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Committee approved — ${payload.committeeName}`,
    content,
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
}): Promise<void> {
  if (!(await isZohoConfigured())) return;

  const content = buildCommitteeDailyDigestHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: payload.subject,
    content,
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
  return composeEmail({
    preheader: `Tuition payment of ${payload.totalDue} is due ${payload.dueDate}.`,
    contentHtml: `
      ${emailBadge("Tuition Reminder")}
      ${emailHeading(`Upcoming tuition due for ${escapeHtml(payload.familyName)}`)}
      ${emailParagraph(
        `${escapeHtml(payload.schoolName)} has tuition charges coming due on ${escapeHtml(payload.dueDate)}.`,
      )}
      ${emailDetailCard([
        { label: "Total due", value: payload.totalDue },
        { label: "Due date", value: payload.dueDate },
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
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `Tuition reminder — ${payload.schoolName}`,
    content: payload.html,
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
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `Late fee notice — ${payload.schoolName}`,
    content: payload.html,
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
  return composeEmail({
    preheader: `${payload.chargeLabel} — ${payload.amountDue} due ${payload.dueDate}.`,
    contentHtml: `
      ${emailBadge("Tuition Invoice")}
      ${emailHeading(`Invoice for ${escapeHtml(payload.familyName)}`)}
      ${emailParagraph(
        `${escapeHtml(payload.schoolName)} sent you a tuition invoice. Sign in to your parent portal to review and pay online.`,
      )}
      ${emailDetailCard([
        { label: "Charge", value: payload.chargeLabel },
        { label: "Amount due", value: payload.amountDue },
        { label: "Due date", value: payload.dueDate },
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
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `Invoice from ${payload.schoolName}`,
    content: payload.html,
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

export async function sendTuitionAutopayFailedEmail(payload: {
  to: string;
  schoolName: string;
  html: string;
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `Autopay failed — ${payload.schoolName}`,
    content: payload.html,
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
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const html = buildNewMessageEmailHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `New message from ${payload.senderName} — ${payload.schoolName}`,
    content: html,
  });

  if (!result.success) {
    console.error("New message email failed:", result.error);
    return { ok: false };
  }

  return { ok: true };
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
    details.push({ label: "Due", value: formatSelectedDate(payload.dueDate) });
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
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const html = buildTeacherParentFormPublishedEmailHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `Form to sign — ${payload.schoolName}`,
    content: html,
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
}): Promise<{ ok: boolean }> {
  if (!(await isZohoConfigured())) {
    return { ok: false };
  }

  const html = buildTeacherParentFormResponseSignedEmailHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.to,
    subject: `Form signed — ${payload.schoolName}`,
    content: html,
  });

  if (!result.success) {
    console.error("Teacher parent form response signed email failed:", result.error);
    return { ok: false };
  }

  return { ok: true };
}
