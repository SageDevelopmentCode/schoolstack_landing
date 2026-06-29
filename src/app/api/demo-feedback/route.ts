import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { schoolDemoRegistry } from "@/data/school-demos";
import { notifyDemoFeedback } from "@/lib/discord";
import { sendDemoFeedbackConfirmation } from "@/lib/emails";
import { createClient } from "@/utils/supabase/server";

const MAX_MESSAGE_LENGTH = 5000;

interface DemoFeedbackBody {
  schoolSlug?: string;
  schoolName?: string;
  name?: string;
  email?: string;
  message?: string;
  source?: string;
}

export async function POST(request: Request) {
  let body: DemoFeedbackBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const schoolSlug = body.schoolSlug?.trim() ?? "";
  const schoolName = body.schoolName?.trim() ?? "";
  const name = body.name?.trim() || null;
  const email = body.email?.trim() || null;
  const message = body.message?.trim() ?? "";

  if (!schoolSlug || !schoolName || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!schoolDemoRegistry[schoolSlug]) {
    return NextResponse.json({ error: "Invalid school." }, { status: 400 });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const isPrototypeWalkthrough = !name && !email;
  const source =
    body.source?.trim() ||
    (isPrototypeWalkthrough ? "prototype-walkthrough" : "demo-walkthrough");

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from("demo_feedback").insert({
    school_slug: schoolSlug,
    school_name: schoolName,
    name,
    email,
    message,
    source,
  });

  if (error) {
    console.error("Supabase insert failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    await notifyDemoFeedback({
      schoolSlug,
      schoolName,
      name,
      email,
      message,
      source,
    });
  } catch (err) {
    console.error("Discord notification error:", err);
  }

  if (name && email) {
    try {
      await sendDemoFeedbackConfirmation({ name, email, schoolName });
    } catch (err) {
      console.error("Confirmation email error:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
