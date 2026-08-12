import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import {
  DEFAULT_PLATFORM_MESSAGE_THREAD_PAGE_SIZE,
  listPlatformMessageThreads,
  MAX_PLATFORM_MESSAGE_THREAD_PAGE_SIZE,
} from "@/lib/admin/platform-messages";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/messages/threads";

function parseLimit(value: string | null): number {
  if (!value) return DEFAULT_PLATFORM_MESSAGE_THREAD_PAGE_SIZE;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_PLATFORM_MESSAGE_THREAD_PAGE_SIZE;
  }
  return Math.min(parsed, MAX_PLATFORM_MESSAGE_THREAD_PAGE_SIZE);
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const cursor = searchParams.get("cursor")?.trim() || null;
  const limit = parseLimit(searchParams.get("limit"));

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_organization_id",
    });
  }

  try {
    const user = await requirePlatformAdminUser(supabase);
    const admin = createAdminClient();

    const { data: organization, error: organizationError } = await admin
      .from("organizations")
      .select("id, name")
      .eq("id", organizationId)
      .maybeSingle();

    if (organizationError) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: organizationError.message,
        cause: organizationError,
      });
    }

    if (!organization?.name) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Organization not found.",
        code: "organization_not_found",
      });
    }

    const page = await listPlatformMessageThreads(
      admin,
      organizationId,
      user.id,
      String(organization.name),
      { cursor, limit },
    );

    return NextResponse.json(page);
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load message threads.",
      code: "internal_error",
      cause: error,
    });
  }
}
