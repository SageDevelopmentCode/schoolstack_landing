import { SITE_URL } from "@/lib/site";
import {
  formatAutopayLineItems,
  type AutopayLineItem,
} from "@/lib/tuition/autopay-cron-report";

const BRAND_COLOR = 0x2e4a3c;

const DISCORD_EMBED_COLORS = {
  brand: BRAND_COLOR,
  error: 0xed4245,
  success: 0x22c55e,
  payment: 0xf59e0b,
  admissions: 0x3b82f6,
  schedule: 0x8b5cf6,
  sales: 0x5865f2,
  feedback: 0xf97316,
  support: 0x06b6d4,
  ops: 0x64748b,
} as const;

const FIELD_LABELS: Record<string, string> = {
  School: "🏫 School",
  Contact: "👤 Contact",
  Email: "✉️ Email",
  Name: "👤 Name",
  Flow: "🔀 Flow",
  "Application ID": "🆔 Application ID",
  Form: "📄 Form",
  Submitted: "📅 Submitted",
  Type: "🏷️ Type",
  "School amount": "💵 School amount",
  "Charged total": "💵 Charged total",
  Method: "💳 Method",
  "Payment ID": "🆔 Payment ID",
  Paid: "📅 Paid",
  Step: "📌 Step",
  When: "📅 When",
  Student: "🎒 Student",
  Route: "🛣️ Route",
  "HTTP method": "🔧 Method",
  Status: "📊 Status",
  Error: "❌ Error",
  Code: "🔢 Code",
  Digest: "🔑 Digest",
  Stack: "📜 Stack",
  Operation: "⚙️ Operation",
  Actor: "👤 Actor",
  Details: "📋 Details",
  Entity: "📎 Entity",
  Organizations: "🏫 Organizations",
  "Overdue marked": "⚠️ Overdue marked",
  "Reminders sent": "📨 Reminders sent",
  "Rules evaluated": "📏 Rules evaluated",
  "Autopay charged": "✅ Autopay charged",
  "Autopay failed": "❌ Autopay failed",
  "Autopay due today": "📅 Autopay due today",
  "Autopay skipped": "⏭️ Autopay skipped",
  "Autopay charged detail": "✅ Charged",
  "Autopay failed detail": "❌ Failed",
  "Autopay skipped detail": "⏭️ Skipped",
  "Prospect school": "🏫 Prospect school",
  "Concept demo": "🎯 Concept demo",
  Role: "👔 Role",
  Priorities: "🎯 Priorities",
  "Launch timeline": "🚀 Launch timeline",
  "Student count": "👥 Student count",
  "Current systems": "🖥️ Current systems",
  Website: "🌐 Website",
  "Current tools": "🧰 Current tools",
  "Prep notes": "📝 Prep notes",
  Source: "📍 Source",
  Message: "💬 Message",
  Feature: "✨ Feature",
  Page: "📄 Page",
  Submitter: "👤 Submitter",
  "Request ID": "🆔 Request ID",
  Topic: "🏷️ Topic",
  Description: "💬 Description",
  Attachments: "📎 Attachments",
  "Billing period": "📆 Billing period",
  Amount: "💵 Amount",
  "Marked paid by": "👤 Marked paid by",
  "Paid at": "📅 Paid at",
  "Invoice ID": "🆔 Invoice ID",
  "Stripe invoice": "🔗 Stripe invoice",
};

export function truncate(value: string, max = 1024) {
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

function fieldLabel(name: string): string {
  return FIELD_LABELS[name] ?? name;
}

function formatId(id: string): string {
  return `\`${id}\``;
}

function formatMoneyCents(cents: number): string {
  return `**$${(cents / 100).toFixed(2)}**`;
}

function formatMoney(amount: string): string {
  return `**${amount}**`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function embedField(
  name: string,
  value: string,
  inline?: boolean,
): DiscordEmbedField {
  return { name: fieldLabel(name), value, inline };
}

function schoolField(
  name: string,
  slug?: string,
  id?: string,
  inline = true,
): DiscordEmbedField {
  const parts = [name];
  if (slug) parts.push(`(${slug})`);
  if (id) parts.push(formatId(id));
  return embedField("School", truncate(parts.join("\n")), inline);
}

function contactField(
  email: string,
  name?: string | null,
  inline = true,
): DiscordEmbedField {
  const value =
    name?.trim()
      ? truncate(`${name.trim()}\n${email}`)
      : truncate(email);
  return embedField("Contact", value, inline);
}

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  title: string;
  description?: string;
  color?: number;
  fields: DiscordEmbedField[];
  timestamp?: string;
}

export type ApplyAuthMode = "create" | "login";

async function sendDiscordEmbedToWebhook(
  webhookUrl: string,
  embed: DiscordEmbed,
  options?: { content?: string },
) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(options?.content ? { content: options.content } : {}),
      embeds: [
        {
          ...embed,
          color: embed.color ?? BRAND_COLOR,
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error("Discord webhook failed:", response.status, await response.text());
  }
}

export async function sendDiscordEmbed(embed: DiscordEmbed) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("DISCORD_WEBHOOK_URL is not set; skipping Discord notification.");
    return;
  }

  await sendDiscordEmbedToWebhook(webhookUrl, embed);
}

async function sendRootedMeadowsDiscordEmbed(embed: DiscordEmbed) {
  const webhookUrl = process.env.ROOTED_MEADOWS_VERIFICATION_CODE_DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn(
      "ROOTED_MEADOWS_VERIFICATION_CODE_DISCORD_WEBHOOK_URL is not set; skipping Discord notification.",
    );
    return;
  }

  await sendDiscordEmbedToWebhook(webhookUrl, embed);
}

async function sendWebsiteNotificationDiscordEmbed(
  embed: DiscordEmbed,
  options?: { content?: string },
) {
  const webhookUrl = process.env.ROOTED_MEADOWS_WEBSITE_NOTIFICATION_DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn(
      "ROOTED_MEADOWS_WEBSITE_NOTIFICATION_DISCORD_WEBHOOK_URL is not set; skipping Discord notification.",
    );
    return;
  }

  await sendDiscordEmbedToWebhook(webhookUrl, embed, options);
}

export function resolveAdmissionsDiscordWebhookUrl(): string | null {
  return (
    process.env.DISCORD_E2E_ALERTS_WEBHOOK_URL?.trim() ||
    process.env.ROOTED_MEADOWS_WEBSITE_NOTIFICATION_DISCORD_WEBHOOK_URL?.trim() ||
    null
  );
}

async function sendAdmissionsDiscordEmbed(
  embed: DiscordEmbed,
  options?: { content?: string },
) {
  const webhookUrl = resolveAdmissionsDiscordWebhookUrl();
  if (!webhookUrl) {
    console.warn(
      "No admissions Discord webhook configured (DISCORD_E2E_ALERTS_WEBHOOK_URL or ROOTED_MEADOWS_WEBSITE_NOTIFICATION_DISCORD_WEBHOOK_URL); skipping Discord notification.",
    );
    return;
  }

  await sendDiscordEmbedToWebhook(webhookUrl, embed, options);
}

async function sendCustomerBillingDiscordEmbed(
  embed: DiscordEmbed,
  options?: { content?: string },
) {
  const webhookUrl = process.env.DISCORD_CUSTOMER_BILLING_WEBHOOKS_URL?.trim();
  if (!webhookUrl) {
    console.warn(
      "DISCORD_CUSTOMER_BILLING_WEBHOOKS_URL is not set; skipping Discord notification.",
    );
    return;
  }

  await sendDiscordEmbedToWebhook(webhookUrl, embed, options);
}

async function sendTuitionBillingDiscordEmbed(
  embed: DiscordEmbed,
  options?: { content?: string },
) {
  const webhookUrl = process.env.DISCORD_TUITION_BILLING_WEBHOOKS_URL?.trim();
  if (!webhookUrl) {
    console.warn(
      "DISCORD_TUITION_BILLING_WEBHOOKS_URL is not set; skipping Discord notification.",
    );
    return;
  }

  await sendDiscordEmbedToWebhook(webhookUrl, embed, options);
}

export async function notifyTuitionBillingCronSummary(payload: {
  organizations: number;
  overdueCount: number;
  remindersSent: number;
  rulesEvaluated: number;
  autopayProcessed: number;
  autopayFailed: number;
  autopaySkipped: number;
  autopayDueCandidates: number;
  autopayLines: AutopayLineItem[];
  autopayLinesTruncated?: boolean;
}) {
  const fields: DiscordEmbedField[] = [
    embedField("Organizations", String(payload.organizations), true),
    embedField("Overdue marked", String(payload.overdueCount), true),
    embedField("Reminders sent", String(payload.remindersSent), true),
    embedField("Rules evaluated", String(payload.rulesEvaluated), true),
    embedField("Autopay due today", String(payload.autopayDueCandidates), true),
    embedField("Autopay charged", String(payload.autopayProcessed), true),
    embedField("Autopay failed", String(payload.autopayFailed), true),
    embedField("Autopay skipped", String(payload.autopaySkipped), true),
  ];

  const chargedDetail = formatAutopayLineItems(payload.autopayLines, "charged");
  if (chargedDetail) {
    fields.push(embedField("Autopay charged detail", truncate(chargedDetail)));
  }

  const failedDetail = formatAutopayLineItems(payload.autopayLines, "failed");
  if (failedDetail) {
    fields.push(embedField("Autopay failed detail", truncate(failedDetail)));
  }

  const skippedDetail = formatAutopayLineItems(payload.autopayLines, "skipped");
  if (skippedDetail) {
    fields.push(embedField("Autopay skipped detail", truncate(skippedDetail)));
  }

  if (payload.autopayLinesTruncated) {
    fields.push(
      embedField(
        "Details",
        "Autopay line items were truncated to fit Discord limits.",
      ),
    );
  }

  await sendTuitionBillingDiscordEmbed(
    {
      title: "📊 Tuition billing cron · daily summary",
      color:
        payload.autopayFailed > 0
          ? DISCORD_EMBED_COLORS.error
          : DISCORD_EMBED_COLORS.ops,
      fields,
    },
    payload.autopayFailed > 0 ? { content: "@everyone" } : undefined,
  );
}

export async function notifyWebsiteApiError(payload: {
  route: string;
  method: string;
  status: number;
  error: string;
  code?: string;
  stack?: string;
  digest?: string;
}) {
  const fields: DiscordEmbedField[] = [
    embedField("Route", truncate(`\`${payload.route}\``), true),
    embedField("HTTP method", payload.method, true),
    embedField("Status", String(payload.status), true),
    embedField("Error", truncate(payload.error)),
  ];

  if (payload.code) {
    fields.push(embedField("Code", truncate(payload.code), true));
  }

  if (payload.digest) {
    fields.push(embedField("Digest", truncate(formatId(payload.digest)), true));
  }

  if (payload.stack) {
    fields.push(embedField("Stack", truncate(payload.stack, 900)));
  }

  await sendWebsiteNotificationDiscordEmbed(
    {
      title: `🚨 API error · ${payload.status}`,
      description: `**${payload.method}** \`${payload.route}\` — ${truncate(payload.error, 200)}`,
      color: DISCORD_EMBED_COLORS.error,
      fields,
    },
    { content: "@everyone" },
  );
}

export async function notifySchoolAdminOperationError(payload: {
  operation: string;
  error: string;
  organizationId?: string;
  organizationName?: string;
  organizationSlug?: string;
  actorEmail?: string;
  code?: string;
  details?: string;
  entityType?: string;
  entityId?: string;
}) {
  const fields: DiscordEmbedField[] = [
    embedField("Operation", truncate(payload.operation), true),
    embedField("Error", truncate(payload.error)),
  ];

  if (payload.organizationId) {
    fields.push(
      schoolField(
        payload.organizationName ?? "Unknown",
        payload.organizationSlug,
        payload.organizationId,
      ),
    );
  }

  if (payload.actorEmail) {
    fields.push(embedField("Actor", truncate(payload.actorEmail), true));
  }

  if (payload.code) {
    fields.push(embedField("Code", truncate(payload.code), true));
  }

  if (payload.details) {
    fields.push(embedField("Details", truncate(payload.details)));
  }

  if (payload.entityType || payload.entityId) {
    const entityParts = [payload.entityType, payload.entityId].filter(Boolean);
    fields.push(
      embedField("Entity", truncate(entityParts.join(" · ")), true),
    );
  }

  await sendWebsiteNotificationDiscordEmbed(
    {
      title: `🔧 School admin error · ${payload.operation}`,
      description: truncate(payload.error, 200),
      color: DISCORD_EMBED_COLORS.error,
      fields,
    },
    { content: "@everyone" },
  );
}

export async function notifyRootedMeadowsVerificationCodeSent(payload: {
  schoolName: string;
  email: string;
  mode: ApplyAuthMode;
  firstName?: string;
  lastName?: string;
  resent?: boolean;
}) {
  const flowLabel = payload.mode === "create" ? "Create account" : "Log in";
  const title = payload.resent
    ? "🔐 Verification code sent · resent"
    : "🔐 Verification code sent";

  const fields: DiscordEmbedField[] = [
    embedField("School", truncate(payload.schoolName), true),
    embedField("Email", truncate(payload.email), true),
    embedField("Flow", flowLabel, true),
  ];

  const firstName = payload.firstName?.trim();
  const lastName = payload.lastName?.trim();
  if (firstName || lastName) {
    fields.push(
      embedField(
        "Name",
        truncate([firstName, lastName].filter(Boolean).join(" ")),
        true,
      ),
    );
  }

  await sendRootedMeadowsDiscordEmbed({
    title,
    color: DISCORD_EMBED_COLORS.admissions,
    fields,
  });
}

export async function notifyRootedMeadowsParentApplicationStarted(payload: {
  schoolName: string;
  email: string;
  mode: ApplyAuthMode;
  applicationId: string;
  formTitle?: string;
  firstName?: string;
  lastName?: string;
}) {
  const title =
    payload.mode === "create"
      ? "👤 Parent account created"
      : "👤 Parent signed in";

  const firstName = payload.firstName?.trim();
  const lastName = payload.lastName?.trim();
  const nameLine =
    firstName || lastName ? [firstName, lastName].filter(Boolean).join(" ") : null;

  const fields: DiscordEmbedField[] = [
    embedField("School", truncate(payload.schoolName), true),
    contactField(payload.email, nameLine),
    embedField("Application ID", formatId(payload.applicationId), true),
  ];

  if (payload.formTitle?.trim()) {
    fields.push(embedField("Form", truncate(payload.formTitle.trim())));
  }

  await sendRootedMeadowsDiscordEmbed({
    title,
    color: DISCORD_EMBED_COLORS.admissions,
    fields,
  });
}

export async function notifyApplicationSubmitted(payload: {
  schoolName: string;
  email: string;
  applicationId: string;
  formTitle?: string;
  firstName?: string;
  lastName?: string;
  submittedAt?: string;
}) {
  const firstName = payload.firstName?.trim();
  const lastName = payload.lastName?.trim();
  const nameLine =
    firstName || lastName ? [firstName, lastName].filter(Boolean).join(" ") : null;

  const contactLabel = nameLine ?? payload.email;

  const fields: DiscordEmbedField[] = [
    embedField("School", truncate(payload.schoolName), true),
    contactField(payload.email, nameLine),
    embedField("Application ID", formatId(payload.applicationId), true),
  ];

  if (payload.formTitle?.trim()) {
    fields.push(embedField("Form", truncate(payload.formTitle.trim())));
  }

  if (payload.submittedAt) {
    fields.push(
      embedField("Submitted", formatDateTime(payload.submittedAt), true),
    );
  }

  await sendAdmissionsDiscordEmbed({
    title: "✅ Application submitted",
    description: `**${payload.schoolName}** · ${contactLabel}`,
    color: DISCORD_EMBED_COLORS.success,
    fields,
  });
}

export async function notifyPaymentCompleted(payload: {
  schoolName: string;
  email: string;
  paymentId: string;
  paymentType: "application_fee" | "enrollment_checklist";
  label: string;
  amountCents: number;
  chargedAmountCents: number;
  processingFeeCents?: number | null;
  paymentMethodType?: "card" | "us_bank_account" | null;
  firstName?: string;
  lastName?: string;
  paidAt?: string;
}) {
  const firstName = payload.firstName?.trim();
  const lastName = payload.lastName?.trim();
  const nameLine =
    firstName || lastName ? [firstName, lastName].filter(Boolean).join(" ") : null;

  const typeLabel =
    payload.paymentType === "enrollment_checklist"
      ? "Enrollment"
      : "Application fee";

  const methodLabel =
    payload.paymentMethodType === "card"
      ? "Card"
      : payload.paymentMethodType === "us_bank_account"
        ? "ACH"
        : "—";

  const fields: DiscordEmbedField[] = [
    embedField("School", truncate(payload.schoolName), true),
    contactField(payload.email, nameLine),
    embedField("Type", typeLabel, true),
    embedField("School amount", formatMoneyCents(payload.amountCents), true),
    embedField(
      "Charged total",
      formatMoneyCents(payload.chargedAmountCents),
      true,
    ),
    embedField("Method", methodLabel, true),
    embedField("Payment ID", formatId(payload.paymentId), true),
  ];

  if (payload.paidAt) {
    fields.push(embedField("Paid", formatDateTime(payload.paidAt), true));
  }

  await sendAdmissionsDiscordEmbed({
    title: `💳 Payment received · ${payload.label}`,
    description: `**${payload.schoolName}** · ${typeLabel} · ${formatMoneyCents(payload.amountCents)}`,
    color: DISCORD_EMBED_COLORS.payment,
    fields,
  });
}

const POST_SUBMIT_VISIT_DISCORD_TITLES: Record<string, string> = {
  schedule_campus_tour: "Campus tour scheduled",
  schedule_family_interview: "Family interview scheduled",
  schedule_observation_day: "Observation day scheduled",
};

export async function notifyPostSubmitVisitScheduled(payload: {
  schoolName: string;
  email: string;
  applicationId: string;
  actionType: string;
  stepTitle: string;
  scheduledDate: string;
  endDate?: string;
  startTimeSlot: string;
  schedulingMode?: "time_slot" | "whole_day";
  visitDayCount?: number;
  visitDates?: string[];
  timezoneLabel: string;
  firstName?: string;
  lastName?: string;
  studentName?: string;
}) {
  const visitTitle =
    POST_SUBMIT_VISIT_DISCORD_TITLES[payload.actionType] ??
    "Post-submit visit scheduled";

  const firstName = payload.firstName?.trim();
  const lastName = payload.lastName?.trim();
  const nameLine =
    firstName || lastName ? [firstName, lastName].filter(Boolean).join(" ") : null;

  const when =
    payload.schedulingMode === "whole_day"
      ? formatObservationVisitWhen(
          payload.visitDates,
          payload.scheduledDate,
          payload.endDate,
          payload.visitDayCount,
          payload.timezoneLabel,
        )
      : `${formatSelectedDate(payload.scheduledDate)} at ${payload.startTimeSlot} (${payload.timezoneLabel})`;

  const fields: DiscordEmbedField[] = [
    embedField("School", truncate(payload.schoolName), true),
    contactField(payload.email, nameLine),
    embedField("Application ID", formatId(payload.applicationId), true),
    embedField("Step", truncate(payload.stepTitle)),
    embedField("When", when),
  ];

  if (payload.studentName?.trim()) {
    fields.push(
      embedField("Student", truncate(payload.studentName.trim()), true),
    );
  }

  await sendAdmissionsDiscordEmbed({
    title: `📅 ${visitTitle}`,
    description: `**${payload.schoolName}** · ${when}`,
    color: DISCORD_EMBED_COLORS.schedule,
    fields,
  });
}

const ROLES: Record<string, string> = {
  starting: "Starting a microschool",
  running: "Already running one",
  private: "Private school operator",
  program: "Program / enrichment model",
  other: "Other",
};

const PRIORITIES: Record<string, string> = {
  enrollment: "Enrollment & inquiries",
  communication: "Family communication",
  billing: "Tuition & billing",
  admissions: "Admissions / onboarding",
  operations: "Daily operations",
  full: "I want the full system",
};

const LAUNCH_TIMELINES: Record<string, string> = {
  "within-3": "Within 3 months",
  "3-6": "3–6 months from now",
  "6-12": "6–12 months from now",
  exploring: "Just exploring for now",
};

const STUDENT_COUNTS: Record<string, string> = {
  "0-10": "0–10 students",
  "11-25": "11–25 students",
  "26-75": "26–75 students",
  "76+": "76+ students",
};

function formatSelectedDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
  });
}

function formatObservationVisitWhen(
  visitDates: string[] | undefined,
  scheduledDate: string,
  endDate: string | undefined,
  visitDayCount: number | undefined,
  timezoneLabel: string,
): string {
  const dates =
    visitDates && visitDates.length > 0
      ? visitDates
      : endDate && endDate !== scheduledDate
        ? [scheduledDate, endDate]
        : [scheduledDate];

  const dayCount = visitDayCount ?? dates.length;

  if (dates.length === 1) {
    return `${formatSelectedDate(dates[0]!)} (${timezoneLabel})`;
  }

  const labels = dates.map((date) => formatSelectedDate(date)).join("; ");
  return `${labels} (${dayCount} school days, ${timezoneLabel})`;
}

export async function notifyDemoBooking(payload: {
  name: string;
  email: string;
  schoolName: string;
  role: string;
  launchTimeline: string | null;
  studentCount: string | null;
  currentSystems: string;
  priorities: string[];
  websiteUrl: string;
  currentTools: string;
  prepNotes: string;
  conceptDemoSlug?: string | null;
  scheduledDate: string;
  scheduledTime: string;
}) {
  const roleLabel = ROLES[payload.role] ?? payload.role;
  const priorityLabels = payload.priorities
    .map((id) => PRIORITIES[id] ?? id)
    .join(", ");
  const isWalkthrough = !!payload.conceptDemoSlug;

  const branchFields: DiscordEmbedField[] = [];
  if (payload.launchTimeline) {
    branchFields.push(
      embedField(
        "Launch timeline",
        LAUNCH_TIMELINES[payload.launchTimeline] ?? payload.launchTimeline,
        true,
      ),
    );
  }
  if (payload.studentCount) {
    branchFields.push(
      embedField(
        "Student count",
        STUDENT_COUNTS[payload.studentCount] ?? payload.studentCount,
        true,
      ),
    );
  }
  if (payload.currentSystems.trim()) {
    branchFields.push(
      embedField("Current systems", truncate(payload.currentSystems.trim())),
    );
  }

  const optionalFields: DiscordEmbedField[] = [];
  if (payload.websiteUrl.trim()) {
    optionalFields.push(
      embedField("Website", truncate(payload.websiteUrl.trim())),
    );
  }
  if (payload.currentTools.trim()) {
    optionalFields.push(
      embedField("Current tools", truncate(payload.currentTools.trim())),
    );
  }
  if (payload.prepNotes.trim()) {
    optionalFields.push(
      embedField("Prep notes", truncate(payload.prepNotes.trim())),
    );
  }

  const when = `${formatSelectedDate(payload.scheduledDate)} at ${payload.scheduledTime} CT`;

  const conceptDemoField: DiscordEmbedField[] = isWalkthrough
    ? [
        embedField(
          "Concept demo",
          truncate(
            `${payload.schoolName}\n(${payload.conceptDemoSlug})\n${SITE_URL}/demo/${payload.conceptDemoSlug}`,
          ),
          true,
        ),
      ]
    : [];

  const title = isWalkthrough
    ? "🗓️ New demo booking · walkthrough"
    : "🗓️ New demo booking";

  await sendDiscordEmbed({
    title,
    description: `**${payload.name}** · ${when}`,
    color: DISCORD_EMBED_COLORS.sales,
    fields: [
      contactField(payload.email, payload.name),
      embedField(
        "Prospect school",
        truncate(isWalkthrough ? "—" : payload.schoolName),
        true,
      ),
      ...conceptDemoField,
      embedField("When", when, true),
      embedField("Role", roleLabel, true),
      embedField("Priorities", truncate(priorityLabels || "—")),
      ...branchFields,
      ...optionalFields,
    ],
  });
}

export async function notifyDemoFeedback(payload: {
  schoolSlug: string;
  schoolName: string;
  name: string | null;
  email: string | null;
  message: string;
  source?: string;
}) {
  const contactValue =
    payload.name && payload.email
      ? truncate(`${payload.name}\n${payload.email}`)
      : "Anonymous";

  await sendDiscordEmbed({
    title: "💬 New demo feedback",
    description: `**${payload.schoolName}**`,
    color: DISCORD_EMBED_COLORS.feedback,
    fields: [
      embedField(
        "School",
        truncate(`${payload.schoolName}\n(${payload.schoolSlug})`),
        true,
      ),
      embedField("Contact", contactValue, true),
      ...(payload.source
        ? [embedField("Source", payload.source, true)]
        : []),
      embedField("Message", truncate(payload.message.trim())),
    ],
  });
}

export async function notifyHomepageQuestion(payload: {
  name: string;
  email: string;
  message: string;
}) {
  await sendDiscordEmbed({
    title: "❓ New homepage question",
    description: `**${payload.name}** · ${payload.email}`,
    color: DISCORD_EMBED_COLORS.feedback,
    fields: [
      contactField(payload.email, payload.name),
      embedField("Message", truncate(payload.message.trim())),
    ],
  });
}

const PARENT_PORTAL_FEEDBACK_TYPE_LABELS: Record<string, string> = {
  feature_request: "Feature request",
  feedback: "General feedback",
  bug: "Something isn't working",
};

const PARENT_PORTAL_FEEDBACK_TITLE_EMOJI: Record<string, string> = {
  feature_request: "💡",
  bug: "🐛",
  feedback: "📝",
};

export async function notifyParentPortalFeedback(payload: {
  schoolSlug: string;
  schoolName: string;
  organizationId: string;
  submitterName: string | null;
  submitterEmail: string | null;
  featureKey: string;
  featureLabel: string;
  feedbackType: string;
  message: string;
  pagePath?: string | null;
}) {
  const contactValue =
    payload.submitterName && payload.submitterEmail
      ? truncate(`${payload.submitterName}\n${payload.submitterEmail}`)
      : payload.submitterEmail
        ? truncate(payload.submitterEmail)
        : "Unknown";

  const typeLabel =
    PARENT_PORTAL_FEEDBACK_TYPE_LABELS[payload.feedbackType] ??
    payload.feedbackType;

  const titleEmoji =
    PARENT_PORTAL_FEEDBACK_TITLE_EMOJI[payload.feedbackType] ?? "📝";

  const fields: DiscordEmbedField[] = [
    schoolField(payload.schoolName, payload.schoolSlug, payload.organizationId),
    embedField(
      "Feature",
      truncate(`${payload.featureLabel}\n(${payload.featureKey})`),
      true,
    ),
    embedField("Type", truncate(typeLabel), true),
    embedField("Contact", contactValue, true),
  ];

  if (payload.pagePath?.trim()) {
    fields.push(embedField("Page", truncate(payload.pagePath.trim())));
  }

  fields.push(embedField("Message", truncate(payload.message.trim())));

  await sendWebsiteNotificationDiscordEmbed({
    title: `${titleEmoji} Parent portal feedback`,
    description: `**${payload.schoolName}** · ${typeLabel}`,
    color: DISCORD_EMBED_COLORS.feedback,
    fields,
  });
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

export async function notifyAdminSupportRequest(payload: {
  requestId: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  submitterEmail: string;
  topic: string;
  description: string;
  sourcePagePath?: string | null;
  attachments?: Array<{ fileName: string }>;
}) {
  const topicLabel =
    SUPPORT_REQUEST_TOPIC_LABELS[payload.topic] ?? payload.topic;

  const fields: DiscordEmbedField[] = [
    schoolField(
      payload.organizationName,
      payload.organizationSlug,
      payload.organizationId,
    ),
    embedField("Submitter", truncate(payload.submitterEmail), true),
    embedField("Request ID", formatId(payload.requestId), true),
    embedField("Topic", truncate(topicLabel), true),
  ];

  if (payload.sourcePagePath?.trim()) {
    fields.push(embedField("Page", truncate(payload.sourcePagePath.trim())));
  }

  fields.push(embedField("Description", truncate(payload.description.trim())));

  const attachmentCount = payload.attachments?.length ?? 0;
  if (attachmentCount > 0) {
    const fileNames = payload.attachments!
      .map((file) => file.fileName)
      .join(", ");
    fields.push(
      embedField(
        "Attachments",
        truncate(
          `${attachmentCount} file${attachmentCount === 1 ? "" : "s"}: ${fileNames}`,
        ),
      ),
    );
  }

  await sendWebsiteNotificationDiscordEmbed({
    title: "🆘 Admin support request",
    description: `**${payload.organizationName}** · ${topicLabel}`,
    color: DISCORD_EMBED_COLORS.support,
    fields,
  });
}

export async function notifyCustomerBillingInvoicePaid(payload: {
  invoiceId: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  billingPeriodLabel: string;
  amountCents: number;
  currency: string;
  stripeInvoiceUrl: string;
  paidByEmail: string;
  paidAt: string;
}) {
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: payload.currency.toUpperCase(),
  }).format(payload.amountCents / 100);

  const preview = `${payload.organizationName} paid ${amount} (${payload.billingPeriodLabel})`;

  await sendCustomerBillingDiscordEmbed(
    {
      title: "✅ Invoice marked paid",
      description: `**${payload.organizationName}** · ${formatMoney(amount)} · ${payload.billingPeriodLabel}`,
      color: DISCORD_EMBED_COLORS.success,
      fields: [
        schoolField(
          payload.organizationName,
          payload.organizationSlug,
          payload.organizationId,
        ),
        embedField("Billing period", truncate(payload.billingPeriodLabel), true),
        embedField("Amount", formatMoney(amount), true),
        embedField("Marked paid by", truncate(payload.paidByEmail), true),
        embedField("Paid at", formatDateTime(payload.paidAt), true),
        embedField("Invoice ID", formatId(payload.invoiceId), true),
        embedField("Stripe invoice", truncate(payload.stripeInvoiceUrl)),
      ],
    },
    { content: preview },
  );
}
