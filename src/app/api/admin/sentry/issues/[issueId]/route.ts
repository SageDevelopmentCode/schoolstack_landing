import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { isSentryAdminConfigured } from "@/lib/sentry/admin-config";
import { getIssue } from "@/lib/sentry/admin-api";
import { sentryApiErrorResponse } from "@/lib/sentry/sentry-admin-route-response";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/sentry/issues/[issueId]";

type RouteContext = { params: Promise<{ issueId: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await requirePlatformAdminUser(supabase, request);

    if (!isSentryAdminConfigured()) {
      return NextResponse.json(
        { error: "Sentry is not configured on this deployment." },
        { status: 503 },
      );
    }

    const { issueId } = await context.params;
    const issue = await getIssue(issueId);
    return NextResponse.json({ issue });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const sentryResponse = sentryApiErrorResponse(err);
    if (sentryResponse) return sentryResponse;
    return apiError(ROUTE, { request, status: 500, error: "Failed to load Sentry issue.", cause: err });
  }
}
