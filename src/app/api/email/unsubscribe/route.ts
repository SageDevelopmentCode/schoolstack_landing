import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { notifyOutboundEmailUnsubscribed } from "@/lib/discord";
import {
  normalizeOutboundEmail,
  recordOutboundEmailUnsubscribe,
  verifyUnsubscribeToken,
} from "@/lib/outbound-email-unsubscribe";
const ROUTE = "/api/email/unsubscribe";

type UnsubscribeBody = {
  email?: string;
  token?: string;
};

export async function POST(request: Request) {
  let body: UnsubscribeBody;
  try {
    body = (await request.json()) as UnsubscribeBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

  const email = normalizeOutboundEmail(body.email ?? "");
  const token = body.token?.trim() ?? "";

  if (!email || !token) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Email and token are required.",
      code: "missing_fields",
    });
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "This unsubscribe link is invalid or expired.",
      code: "invalid_token",
    });
  }

  try {
    await recordOutboundEmailUnsubscribe({ email, source: "link" });
    void notifyOutboundEmailUnsubscribed({ email, source: "link" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "We could not save your unsubscribe request. Please try again.",
      code: "internal_error",
      cause: error,
    });
  }
}
