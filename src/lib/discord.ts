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

export async function sendDiscordEmbed(embed: DiscordEmbed) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("DISCORD_WEBHOOK_URL is not set; skipping Discord notification.");
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
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
  scheduledDate: string;
  scheduledTime: string;
}) {
  const roleLabel = ROLES[payload.role] ?? payload.role;
  const priorityLabels = payload.priorities
    .map((id) => PRIORITIES[id] ?? id)
    .join(", ");

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

  await sendDiscordEmbed({
    title: "New demo booking",
    fields: [
      {
        name: "Contact",
        value: truncate(`${payload.name}\n${payload.email}`),
        inline: true,
      },
      { name: "School", value: truncate(payload.schoolName), inline: true },
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
  name: string;
  email: string;
  message: string;
}) {
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
