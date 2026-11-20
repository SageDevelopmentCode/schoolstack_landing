import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { schoolDemoRegistry } from "@/data/school-demos";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

type AdminClient = ReturnType<typeof createAdminClient>;

/** The demo (by registry slug) a route acts on, or null when the slug is unknown. */
export function findDemo(slug: string): { slug: string; schoolName: string } | null {
  const config = Object.prototype.hasOwnProperty.call(schoolDemoRegistry, slug) ? schoolDemoRegistry[slug] : undefined;
  return config ? { slug, schoolName: config.schoolName } : null;
}

/** An ISO date-time string, `null`, or `undefined` (field absent). Anything else is invalid. */
export function parseOptionalDate(value: unknown): { ok: true; value: string | null | undefined } | { ok: false } {
  if (value === undefined) return { ok: true, value: undefined };
  if (value === null || value === "") return { ok: true, value: null };
  if (typeof value !== "string") return { ok: false };
  const time = Date.parse(value);
  return Number.isNaN(time) ? { ok: false } : { ok: true, value: new Date(time).toISOString() };
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown;
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Runs a platform-admin demo-outreach handler: checks the caller, hands it the service-role client,
 * and turns auth and unexpected errors into the standard API error responses.
 */
export async function withDemoOutreachAdmin(
  route: string,
  request: Request,
  failureMessage: string,
  handler: (ctx: { admin: AdminClient; user: User }) => Promise<NextResponse>,
): Promise<NextResponse> {
  const supabase = createClient(await cookies());
  try {
    const user = await requirePlatformAdminUser(supabase, request);
    return await handler({ admin: createAdminClient(), user });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(route, { request, status: error.status, error: error.message, code: error.code, cause: error });
    }
    return apiError(route, { request, status: 500, error: failureMessage, code: "internal_error", cause: error });
  }
}

/** Turns a send-flow refusal into a JSON response the compose modal can show (with any content warnings). */
export function outreachErrorResponse(
  route: string,
  request: Request,
  error: { message: string; code: string; status: number; warnings?: unknown[] },
): NextResponse {
  if (error.status >= 500) {
    return apiError(route, { request, status: error.status, error: error.message, code: error.code, cause: error });
  }
  return NextResponse.json({ error: error.message, code: error.code, warnings: error.warnings ?? [] }, { status: error.status });
}
