import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { schoolDemoRegistry } from "@/data/school-demos";
import { apiError } from "@/lib/api/route-errors";
import { notifyDemoFeedback } from "@/lib/discord";
import { sendDemoFeedbackConfirmation } from "@/lib/emails";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/demo-feedback";
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
    return apiError(ROUTE, { request, status: 400, error: "Invalid request body." });
  }

  const schoolSlug = body.schoolSlug?.trim() ?? "";
  const schoolName = body.schoolName?.trim() ?? "";
  const name = body.name?.trim() || null;
  const email = body.email?.trim() || null;
  const message = body.message?.trim() ?? "";

  if (!schoolSlug || !schoolName || !message) {
    return apiError(ROUTE, { request, status: 400, error: "Missing required fields." });
  }

  if (!schoolDemoRegistry[schoolSlug]) {
    return apiError(ROUTE, { request, status: 400, error: "Invalid school." });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return apiError(ROUTE, { request, status: 400, error: "Invalid email address." });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return apiError(ROUTE, { request, status: 400, error: "Message is too long." });
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
    return apiError(ROUTE, {
      request,
      status: 500,
      error: error.message,
      cause: error,
    });
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
