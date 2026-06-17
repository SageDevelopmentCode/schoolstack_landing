import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { schoolDemoRegistry } from "@/data/school-demos";
import { isPastDate } from "@/lib/demo-scheduler";
import { notifyDemoBooking } from "@/lib/discord";
import { sendDemoBookingConfirmation } from "@/lib/emails";
import { createClient } from "@/utils/supabase/server";

const VALID_ROLES = new Set([
  "starting",
  "running",
  "private",
  "program",
  "other",
]);

const VALID_PRIORITIES = new Set([
  "enrollment",
  "communication",
  "billing",
  "admissions",
  "operations",
  "full",
]);

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
  conceptDemoSlug?: string;
  scheduledDate?: string;
  scheduledTime?: string;
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
  const conceptDemoSlug = body.conceptDemoSlug?.trim() || null;

  if (conceptDemoSlug && !schoolDemoRegistry[conceptDemoSlug]) {
    return NextResponse.json({ error: "Invalid concept demo." }, { status: 400 });
  }

  if (isPastDate(scheduledDate)) {
    return NextResponse.json(
      { error: "Cannot book a date in the past." },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: slotRow, error: slotError } = await supabase
    .from("demo_availability_slots")
    .select("id")
    .eq("date", scheduledDate)
    .eq("time_slot", scheduledTime)
    .maybeSingle();

  if (slotError) {
    console.error("Availability check failed:", slotError.message);
    return NextResponse.json({ error: slotError.message }, { status: 500 });
  }

  if (!slotRow) {
    return NextResponse.json(
      { error: "That time slot is no longer available." },
      { status: 409 }
    );
  }

  const { data: existingBooking, error: bookingCheckError } = await supabase
    .from("demo_requests")
    .select("id")
    .eq("scheduled_date", scheduledDate)
    .eq("scheduled_time", scheduledTime)
    .eq("status", "scheduled")
    .maybeSingle();

  if (bookingCheckError) {
    console.error("Booking check failed:", bookingCheckError.message);
    return NextResponse.json({ error: bookingCheckError.message }, { status: 500 });
  }

  if (existingBooking) {
    return NextResponse.json(
      { error: "That time slot has already been booked." },
      { status: 409 }
    );
  }

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
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "That time slot has already been booked." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    await notifyDemoBooking({
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
      conceptDemoSlug,
      scheduledDate,
      scheduledTime,
    });
  } catch (err) {
    console.error("Discord notification error:", err);
  }

  try {
    await sendDemoBookingConfirmation({
      name,
      email,
      schoolName,
      scheduledDate,
      scheduledTime,
    });
  } catch (err) {
    console.error("Confirmation email error:", err);
  }

  return NextResponse.json({ ok: true });
}
