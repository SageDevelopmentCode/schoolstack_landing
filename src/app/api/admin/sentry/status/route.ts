import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  getSentryMobileAdminConfig,
  getSentryWebAdminConfig,
  isSentryAdminConfigured,
  isSentryMobileAdminConfigured,
} from "@/lib/sentry/admin-config";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/sentry/status";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await requirePlatformAdminUser(supabase, request);

    const webConfigured = isSentryAdminConfigured();
    const mobileConfigured = isSentryMobileAdminConfigured();

    if (!webConfigured && !mobileConfigured) {
      return NextResponse.json({
        configured: false,
        orgSlug: null,
        projectSlug: null,
        webBaseUrl: null,
        web: { configured: false, projectSlug: null },
        mobile: { configured: false, projectSlug: null },
      });
    }

    const orgSlug = process.env.SENTRY_ORG?.trim() ?? null;
    const webBaseUrl = orgSlug ? `https://${orgSlug}.sentry.io` : null;

    let webProjectSlug: string | null = null;
    let mobileProjectSlug: string | null = null;

    if (webConfigured) {
      webProjectSlug = getSentryWebAdminConfig().projectSlug;
    }
    if (mobileConfigured) {
      mobileProjectSlug = getSentryMobileAdminConfig().projectSlug;
    }

    return NextResponse.json({
      configured: webConfigured,
      orgSlug,
      projectSlug: webProjectSlug,
      webBaseUrl,
      web: {
        configured: webConfigured,
        projectSlug: webProjectSlug,
      },
      mobile: {
        configured: mobileConfigured,
        projectSlug: mobileProjectSlug,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load Sentry status.",
      cause: err,
    });
  }
}
