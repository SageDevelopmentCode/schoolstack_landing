import { NextResponse } from "next/server";
import {
  notifyRootedMeadowsVerificationCodeSent,
  type ApplyAuthMode,
} from "@/lib/discord";

type NotifyRequestBody = {
  schoolName?: string;
  email?: string;
  mode?: ApplyAuthMode;
  firstName?: string;
  lastName?: string;
  resent?: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isApplyAuthMode(value: string): value is ApplyAuthMode {
  return value === "create" || value === "login";
}

export async function POST(request: Request) {
  let body: NotifyRequestBody;
  try {
    body = (await request.json()) as NotifyRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const schoolName = body.schoolName?.trim();
  const email = body.email?.trim().toLowerCase();
  const mode = body.mode;

  if (!schoolName) {
    return NextResponse.json({ error: "schoolName is required." }, { status: 400 });
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (!mode || !isApplyAuthMode(mode)) {
    return NextResponse.json(
      { error: "mode must be create or login." },
      { status: 400 },
    );
  }

  try {
    await notifyRootedMeadowsVerificationCodeSent({
      schoolName,
      email,
      mode,
      firstName: body.firstName,
      lastName: body.lastName,
      resent: body.resent === true,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("notify-verification-code-sent failed:", error);
    return NextResponse.json(
      { error: "Failed to send notification." },
      { status: 500 },
    );
  }
}
