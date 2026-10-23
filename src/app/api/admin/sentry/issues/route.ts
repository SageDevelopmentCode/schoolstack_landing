import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { isSentryAdminConfigured } from "@/lib/sentry/admin-config";
import { listProjectIssues } from "@/lib/sentry/admin-api";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/sentry/issues";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") ?? undefined;
    const cursor = searchParams.get("cursor") ?? undefined;
    const statsPeriod = searchParams.get("statsPeriod") ?? undefined;

    const result = await listProjectIssues({ query, cursor, statsPeriod });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return apiError(ROUTE, { request, status: 500, error: "Failed to load Sentry issues.", cause: err });
  }
}
