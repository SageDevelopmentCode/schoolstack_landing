import { SITE_URL } from "@/lib/site";

const BRAND_COLOR = 0x2e4a3c;

export function truncate(value: string, max = 1024) {
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  title: string;
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
          color: BRAND_COLOR,
          timestamp: new Date().toISOString(),
          ...embed,
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
    { name: "Route", value: truncate(payload.route), inline: true },
    { name: "Method", value: payload.method, inline: true },
    { name: "Status", value: String(payload.status), inline: true },
    { name: "Error", value: truncate(payload.error) },
  ];

  if (payload.code) {
    fields.push({ name: "Code", value: truncate(payload.code), inline: true });
  }

  if (payload.digest) {
    fields.push({ name: "Digest", value: truncate(payload.digest), inline: true });
  }

  if (payload.stack) {
    fields.push({ name: "Stack", value: truncate(payload.stack, 900) });
  }

  await sendWebsiteNotificationDiscordEmbed(
    {
      title: `API error · ${payload.status}`,
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
    { name: "Operation", value: truncate(payload.operation), inline: true },
    { name: "Error", value: truncate(payload.error) },
  ];

  if (payload.organizationId) {
    const schoolParts = [
      payload.organizationName,
      payload.organizationSlug ? `(${payload.organizationSlug})` : null,
      payload.organizationId,
    ].filter(Boolean);
    fields.push({
      name: "School",
      value: truncate(schoolParts.join("\n")),
      inline: true,
    });
  }

  if (payload.actorEmail) {
    fields.push({
      name: "Actor",
      value: truncate(payload.actorEmail),
      inline: true,
    });
  }

  if (payload.code) {
    fields.push({ name: "Code", value: truncate(payload.code), inline: true });
  }

  if (payload.details) {
    fields.push({ name: "Details", value: truncate(payload.details) });
  }

  if (payload.entityType || payload.entityId) {
    const entityParts = [payload.entityType, payload.entityId].filter(Boolean);
    fields.push({
      name: "Entity",
      value: truncate(entityParts.join(" · ")),
      inline: true,
    });
  }

  await sendWebsiteNotificationDiscordEmbed(
    {
      title: `School admin error · ${payload.operation}`,
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
  const title = payload.resent ? "Verification code sent · resent" : "Verification code sent";

  const fields: DiscordEmbedField[] = [
    { name: "School", value: truncate(payload.schoolName), inline: true },
    { name: "Email", value: truncate(payload.email), inline: true },
    { name: "Flow", value: flowLabel, inline: true },
  ];

  const firstName = payload.firstName?.trim();
  const lastName = payload.lastName?.trim();
  if (firstName || lastName) {
    fields.push({
      name: "Name",
      value: truncate([firstName, lastName].filter(Boolean).join(" ")),
      inline: true,
    });
  }

  await sendRootedMeadowsDiscordEmbed({ title, fields });
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
    payload.mode === "create" ? "Parent account created" : "Parent signed in";

  const firstName = payload.firstName?.trim();
  const lastName = payload.lastName?.trim();
  const nameLine =
    firstName || lastName ? [firstName, lastName].filter(Boolean).join(" ") : null;

  const contactValue = nameLine
    ? truncate(`${nameLine}\n${payload.email}`)
    : truncate(payload.email);

  const fields: DiscordEmbedField[] = [
    { name: "School", value: truncate(payload.schoolName), inline: true },
    { name: "Contact", value: contactValue, inline: true },
    { name: "Application ID", value: payload.applicationId, inline: true },
  ];

  if (payload.formTitle?.trim()) {
    fields.push({ name: "Form", value: truncate(payload.formTitle.trim()) });
  }

  await sendRootedMeadowsDiscordEmbed({ title, fields });
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
  const title = "Application submitted";

  const firstName = payload.firstName?.trim();
  const lastName = payload.lastName?.trim();
  const nameLine =
    firstName || lastName ? [firstName, lastName].filter(Boolean).join(" ") : null;

  const contactValue = nameLine
    ? truncate(`${nameLine}\n${payload.email}`)
    : truncate(payload.email);

  const fields: DiscordEmbedField[] = [
    { name: "School", value: truncate(payload.schoolName), inline: true },
    { name: "Contact", value: contactValue, inline: true },
    { name: "Application ID", value: payload.applicationId, inline: true },
  ];

  if (payload.formTitle?.trim()) {
    fields.push({ name: "Form", value: truncate(payload.formTitle.trim()) });
  }

  if (payload.submittedAt) {
    fields.push({
      name: "Submitted",
      value: new Date(payload.submittedAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      inline: true,
    });
  }

  await sendAdmissionsDiscordEmbed({ title, fields });
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
  const title = `Payment received · ${payload.label}`;

  const firstName = payload.firstName?.trim();
  const lastName = payload.lastName?.trim();
  const nameLine =
    firstName || lastName ? [firstName, lastName].filter(Boolean).join(" ") : null;

  const contactValue = nameLine
    ? truncate(`${nameLine}\n${payload.email}`)
    : truncate(payload.email);

  const formatCents = (cents: number) =>
    `$${(cents / 100).toFixed(2)}`;

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
    { name: "School", value: truncate(payload.schoolName), inline: true },
    { name: "Contact", value: contactValue, inline: true },
    { name: "Type", value: typeLabel, inline: true },
    { name: "School amount", value: formatCents(payload.amountCents), inline: true },
    { name: "Charged total", value: formatCents(payload.chargedAmountCents), inline: true },
    { name: "Method", value: methodLabel, inline: true },
    { name: "Payment ID", value: payload.paymentId, inline: true },
  ];

  if (payload.paidAt) {
    fields.push({
      name: "Paid",
      value: new Date(payload.paidAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      inline: true,
    });
  }

  await sendAdmissionsDiscordEmbed({ title, fields });
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
  const title =
    POST_SUBMIT_VISIT_DISCORD_TITLES[payload.actionType] ?? "Post-submit visit scheduled";

  const firstName = payload.firstName?.trim();
  const lastName = payload.lastName?.trim();
  const nameLine =
    firstName || lastName ? [firstName, lastName].filter(Boolean).join(" ") : null;

  const contactValue = nameLine
    ? truncate(`${nameLine}\n${payload.email}`)
    : truncate(payload.email);

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
    { name: "School", value: truncate(payload.schoolName), inline: true },
    { name: "Contact", value: contactValue, inline: true },
    { name: "Application ID", value: payload.applicationId, inline: true },
    { name: "Step", value: truncate(payload.stepTitle) },
    { name: "When", value: when },
  ];

  if (payload.studentName?.trim()) {
    fields.push({
      name: "Student",
      value: truncate(payload.studentName.trim()),
      inline: true,
    });
  }

  await sendAdmissionsDiscordEmbed({ title, fields });
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
    branchFields.push({
      name: "Launch timeline",
      value: LAUNCH_TIMELINES[payload.launchTimeline] ?? payload.launchTimeline,
      inline: true,
    });
  }
  if (payload.studentCount) {
    branchFields.push({
      name: "Student count",
      value: STUDENT_COUNTS[payload.studentCount] ?? payload.studentCount,
      inline: true,
    });
  }
  if (payload.currentSystems.trim()) {
    branchFields.push({
      name: "Current systems",
      value: truncate(payload.currentSystems.trim()),
    });
  }

  const optionalFields: DiscordEmbedField[] = [];
  if (payload.websiteUrl.trim()) {
    optionalFields.push({ name: "Website", value: truncate(payload.websiteUrl.trim()) });
  }
  if (payload.currentTools.trim()) {
    optionalFields.push({ name: "Current tools", value: truncate(payload.currentTools.trim()) });
  }
  if (payload.prepNotes.trim()) {
    optionalFields.push({ name: "Prep notes", value: truncate(payload.prepNotes.trim()) });
  }

  const when = `${formatSelectedDate(payload.scheduledDate)} at ${payload.scheduledTime} CT`;

  const conceptDemoField: DiscordEmbedField[] = isWalkthrough
    ? [
        {
          name: "Concept demo",
          value: truncate(
            `${payload.schoolName}\n(${payload.conceptDemoSlug})\n${SITE_URL}/demo/${payload.conceptDemoSlug}`,
          ),
          inline: true,
        },
      ]
    : [];

  await sendDiscordEmbed({
    title: isWalkthrough ? "New demo booking · walkthrough" : "New demo booking",
    fields: [
      {
        name: "Contact",
        value: truncate(`${payload.name}\n${payload.email}`),
        inline: true,
      },
      {
        name: "Prospect school",
        value: truncate(isWalkthrough ? "—" : payload.schoolName),
        inline: true,
      },
      ...conceptDemoField,
      { name: "When", value: when, inline: true },
      { name: "Role", value: roleLabel, inline: true },
      { name: "Priorities", value: truncate(priorityLabels || "—") },
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
    title: "New demo feedback",
    fields: [
      {
        name: "School",
        value: truncate(`${payload.schoolName}\n(${payload.schoolSlug})`),
        inline: true,
      },
      {
        name: "Contact",
        value: contactValue,
        inline: true,
      },
      ...(payload.source
        ? [
            {
              name: "Source",
              value: payload.source,
              inline: true,
            },
          ]
        : []),
      {
        name: "Message",
        value: truncate(payload.message.trim()),
      },
    ],
  });
}

export async function notifyHomepageQuestion(payload: {
  name: string;
  email: string;
  message: string;
}) {
  await sendDiscordEmbed({
    title: "New homepage question",
    fields: [
      {
        name: "Contact",
        value: truncate(`${payload.name}\n${payload.email}`),
        inline: true,
      },
      {
        name: "Message",
        value: truncate(payload.message.trim()),
      },
    ],
  });
}

const PARENT_PORTAL_FEEDBACK_TYPE_LABELS: Record<string, string> = {
  feature_request: "Feature request",
  feedback: "General feedback",
  bug: "Something isn't working",
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

  const fields: DiscordEmbedField[] = [
    {
      name: "School",
      value: truncate(
        `${payload.schoolName}\n(${payload.schoolSlug})\n${payload.organizationId}`,
      ),
      inline: true,
    },
    {
      name: "Feature",
      value: truncate(`${payload.featureLabel}\n(${payload.featureKey})`),
      inline: true,
    },
    {
      name: "Type",
      value: truncate(
        PARENT_PORTAL_FEEDBACK_TYPE_LABELS[payload.feedbackType] ??
          payload.feedbackType,
      ),
      inline: true,
    },
    {
      name: "Contact",
      value: contactValue,
      inline: true,
    },
  ];

  if (payload.pagePath?.trim()) {
    fields.push({
      name: "Page",
      value: truncate(payload.pagePath.trim()),
    });
  }

  fields.push({
    name: "Message",
    value: truncate(payload.message.trim()),
  });

  await sendWebsiteNotificationDiscordEmbed({
    title: "Parent portal feedback",
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
    {
      name: "School",
      value: truncate(
        `${payload.organizationName}\n(${payload.organizationSlug})\n${payload.organizationId}`,
      ),
      inline: true,
    },
    {
      name: "Submitter",
      value: truncate(payload.submitterEmail),
      inline: true,
    },
    {
      name: "Request ID",
      value: payload.requestId,
      inline: true,
    },
    { name: "Topic", value: truncate(topicLabel), inline: true },
  ];

  if (payload.sourcePagePath?.trim()) {
    fields.push({
      name: "Page",
      value: truncate(payload.sourcePagePath.trim()),
    });
  }

  fields.push({
    name: "Description",
    value: truncate(payload.description.trim()),
  });

  const attachmentCount = payload.attachments?.length ?? 0;
  if (attachmentCount > 0) {
    const fileNames = payload.attachments!
      .map((file) => file.fileName)
      .join(", ");
    fields.push({
      name: "Attachments",
      value: truncate(`${attachmentCount} file${attachmentCount === 1 ? "" : "s"}: ${fileNames}`),
    });
  }

  await sendWebsiteNotificationDiscordEmbed({
    title: "Admin support request",
    fields,
  });
}
