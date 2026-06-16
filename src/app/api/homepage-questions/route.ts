import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { notifyHomepageQuestion } from "@/lib/discord";
import { sendHomepageQuestionConfirmation } from "@/lib/emails";
import { createClient } from "@/utils/supabase/server";

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
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
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
    console.error("Supabase insert failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
