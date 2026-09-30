import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { notifyOutboundEmailUnsubscribed } from "@/lib/discord";
import {
  listOutboundEmailSuppressions,
  normalizeOutboundEmail,
  recordOutboundEmailUnsubscribe,
  whitelistOutboundEmail,
} from "@/lib/outbound-email-unsubscribe";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/email-suppressions";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    await requirePlatformAdminUser(supabase, request);
    const rows = await listOutboundEmailSuppressions();
    return NextResponse.json({ suppressions: rows });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load email suppressions.",
      code: "internal_error",
      cause: error,
    });
  }
}

type PostBody = {
  action?: "whitelist" | "unsubscribe";
  email?: string;
  notes?: string;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const adminUser = await requirePlatformAdminUser(supabase, request);

    let body: PostBody;
    try {
      body = (await request.json()) as PostBody;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    const email = normalizeOutboundEmail(body.email ?? "");
    if (!email) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "A valid email address is required.",
        code: "invalid_email",
      });
    }

    const notes = body.notes?.trim() || null;

    if (body.action === "whitelist") {
      await whitelistOutboundEmail({
        email,
        notes,
        updatedBy: adminUser.id,
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "unsubscribe") {
      await recordOutboundEmailUnsubscribe({
        email,
        source: "admin",
        notes,
        updatedBy: adminUser.id,
      });
      void notifyOutboundEmailUnsubscribed({ email, source: "admin" });
      return NextResponse.json({ ok: true });
    }

    return apiError(ROUTE, {
      request,
      status: 400,
      error: "action must be whitelist or unsubscribe.",
      code: "invalid_action",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to update email suppression.",
      code: "internal_error",
      cause: error,
    });
  }
}
