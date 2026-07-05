import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiError } from "@/lib/api/route-errors";
import { notifyHomepageQuestion } from "@/lib/discord";
import { sendHomepageQuestionConfirmation } from "@/lib/emails";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/homepage-questions";
const MAX_MESSAGE_LENGTH = 5000;
const HOMEPAGE_SLUG = "homepage";
const HOMEPAGE_NAME = "MudKitchen Homepage";
const SOURCE = "floating-widget";

interface HomepageQuestionBody {
  name?: string;
  email?: string;
  message?: string;
}

export async function POST(request: Request) {
  let body: HomepageQuestionBody;

  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, { request, status: 400, error: "Invalid request body." });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !message) {
    return apiError(ROUTE, { request, status: 400, error: "Missing required fields." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return apiError(ROUTE, { request, status: 400, error: "Invalid email address." });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return apiError(ROUTE, { request, status: 400, error: "Message is too long." });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from("demo_feedback").insert({
    school_slug: HOMEPAGE_SLUG,
    school_name: HOMEPAGE_NAME,
    name,
    email,
    message,
    source: SOURCE,
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
    await notifyHomepageQuestion({ name, email, message });
  } catch (err) {
    console.error("Discord notification error:", err);
  }

  try {
    await sendHomepageQuestionConfirmation({ name, email });
  } catch (err) {
    console.error("Confirmation email error:", err);
  }

  return NextResponse.json({ ok: true });
}
