import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  getSentryAdminConfig,
  isSentryAdminConfigured,
} from "@/lib/sentry/admin-config";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/sentry/status";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await requirePlatformAdminUser(supabase, request);

    if (!isSentryAdminConfigured()) {
      return NextResponse.json({
        configured: false,
        orgSlug: null,
        projectSlug: null,
        webBaseUrl: null,
      });
    }

    const config = getSentryAdminConfig();
    return NextResponse.json({
      configured: true,
      orgSlug: config.orgSlug,
      projectSlug: config.projectSlug,
      webBaseUrl: config.webBaseUrl,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return apiError(ROUTE, { request, status: 500, error: "Failed to load Sentry status.", cause: err });
  }
}
