import { SITE_NAME, SITE_URL } from "@/lib/site";
import { isZohoConfigured, sendZohoEmail } from "@/lib/zoho";

const BRAND_COLOR = "#2e4a3c";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailLayout(body: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <div style="border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 16px; margin-bottom: 24px;">
    <strong style="font-size: 18px; color: ${BRAND_COLOR};">${SITE_NAME}</strong>
  </div>
  ${body}
  <p style="margin-top: 32px; font-size: 13px; color: #666;">
    <a href="${SITE_URL}" style="color: ${BRAND_COLOR};">${SITE_URL.replace(/^https?:\/\//, "")}</a>
  </p>
</body>
</html>`;
}

function formatSelectedDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
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

  const when = `${formatSelectedDate(payload.scheduledDate)} at ${payload.scheduledTime} CT`;
  const firstName = escapeHtml(payload.name.split(" ")[0] || payload.name);

  const content = emailLayout(`
  <p>Hi ${firstName},</p>
  <p>Thanks for booking a demo with ${SITE_NAME}. We received your request and look forward to showing you how we help microschool founders run enrollment, billing, and daily operations in one place.</p>
  <p><strong>Your demo</strong><br>
  ${escapeHtml(when)}<br>
  ${escapeHtml(payload.schoolName)}</p>
  <p>We'll send a calendar invite or follow up shortly if we need anything else before your session.</p>
  <p>— The ${SITE_NAME} team</p>
`);

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

  const firstName = escapeHtml(payload.name.split(" ")[0] || payload.name);

  const content = emailLayout(`
  <p>Hi ${firstName},</p>
  <p>Thanks for reaching out. We received your message and will get back to you as soon as we can.</p>
  <p>— The ${SITE_NAME} team</p>
`);

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

  const firstName = escapeHtml(payload.name.split(" ")[0] || payload.name);

  const content = emailLayout(`
  <p>Hi ${firstName},</p>
  <p>Thanks for sharing feedback on the ${escapeHtml(payload.schoolName)} demo. We appreciate you taking the time — your input helps us build better tools for microschool founders.</p>
  <p>— The ${SITE_NAME} team</p>
`);

  const result = await sendZohoEmail({
    toAddress: payload.email,
    subject: `Thanks for your feedback — ${SITE_NAME}`,
    content,
  });

  if (!result.success) {
    console.error("Demo feedback confirmation email failed:", result.error);
  }
}
