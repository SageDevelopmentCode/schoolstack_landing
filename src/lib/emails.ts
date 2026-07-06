import {
  composeEmail,
  emailBadge,
  emailCta,
  emailDetailCard,
  emailHeading,
  emailParagraph,
  emailSignOff,
  escapeHtml,
} from "@/lib/email-layout";
import { SITE_NAME, SITE_URL } from "@/lib/site";
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
  scheduledDate: string;
  scheduledTime: string;
}): string {
  const when = `${formatSelectedDate(payload.scheduledDate)} at ${payload.scheduledTime} CT`;

  return composeEmail({
    preheader: "Your demo is confirmed — we'll be in touch soon.",
    contentHtml: `
      ${emailBadge("Demo Confirmed")}
      ${emailHeading(`You're all set, ${firstName(payload.name)}.`)}
      ${emailParagraph(
        `Thanks for booking a demo with ${escapeHtml(SITE_NAME)}. We received your request and look forward to walking you through how we help microschool founders run enrollment, billing, and daily operations in one place.`
      )}
      ${emailDetailCard([
        { label: "When", value: when },
        { label: "School", value: payload.schoolName },
      ])}
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
  if (!(await isZohoConfigured())) return;

  const content = buildApplicationSubmittedConfirmationHtml(payload);
  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Application received — ${payload.schoolName}`,
    content,
  });

  if (!result.success) {
    console.error("Application submitted confirmation email failed:", result.error);
  }
}
