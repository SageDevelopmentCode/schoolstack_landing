import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

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

const VALID_ROLES = new Set(Object.keys(ROLES));
const VALID_PRIORITIES = new Set(Object.keys(PRIORITIES));

interface DemoRequestBody {
  name?: string;
  email?: string;
  schoolName?: string;
  role?: string;
  launchTimeline?: string | null;
  studentCount?: string | null;
  currentSystems?: string;
  priorities?: string[];
  websiteUrl?: string;
  currentTools?: string;
  prepNotes?: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

function formatSelectedDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
  });
}

function truncate(value: string, max = 1024) {
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

async function notifyDiscord(payload: {
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
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("DISCORD_WEBHOOK_URL is not set; skipping Discord notification.");
    return;
  }

  const roleLabel = ROLES[payload.role] ?? payload.role;
  const priorityLabels = payload.priorities
    .map((id) => PRIORITIES[id] ?? id)
    .join(", ");

  const branchFields: { name: string; value: string; inline?: boolean }[] = [];
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

  const optionalFields: { name: string; value: string }[] = [];
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

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: "New demo booking",
          color: 0x2e4a3c,
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
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error("Discord webhook failed:", response.status, await response.text());
  }
}

export async function POST(request: Request) {
  let body: DemoRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const schoolName = body.schoolName?.trim() ?? "";
  const role = body.role?.trim() ?? "";
  const priorities = Array.isArray(body.priorities) ? body.priorities : [];
  const scheduledDate = body.scheduledDate?.trim() ?? "";
  const scheduledTime = body.scheduledTime?.trim() ?? "";

  if (!name || !email || !schoolName || !role || !scheduledDate || !scheduledTime) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  if (!VALID_ROLES.has(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  if (priorities.length === 0 || !priorities.every((p) => VALID_PRIORITIES.has(p))) {
    return NextResponse.json({ error: "Invalid priorities." }, { status: 400 });
  }

  const launchTimeline = body.launchTimeline?.trim() || null;
  const studentCount = body.studentCount?.trim() || null;
  const currentSystems = body.currentSystems?.trim() ?? "";
  const websiteUrl = body.websiteUrl?.trim() ?? "";
  const currentTools = body.currentTools?.trim() ?? "";
  const prepNotes = body.prepNotes?.trim() ?? "";

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from("demo_requests").insert({
    name,
    email,
    school_name: schoolName,
    role,
    launch_timeline: launchTimeline,
    student_count: studentCount,
    current_systems: currentSystems,
    priorities,
    website_url: websiteUrl,
    current_tools: currentTools,
    prep_notes: prepNotes,
    scheduled_date: scheduledDate,
    scheduled_time: scheduledTime,
  });

  if (error) {
    console.error("Supabase insert failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    await notifyDiscord({
      name,
      email,
      schoolName,
      role,
      launchTimeline,
      studentCount,
      currentSystems,
      priorities,
      websiteUrl,
      currentTools,
      prepNotes,
      scheduledDate,
      scheduledTime,
    });
  } catch (err) {
    console.error("Discord notification error:", err);
  }

  return NextResponse.json({ ok: true });
}
