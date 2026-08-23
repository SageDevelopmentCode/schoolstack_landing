import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getParentMessagesUnreadCount } from "@/lib/messages/unread-count-api";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/messages/unread-count";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId")?.trim() ?? "";
  const schoolName = url.searchParams.get("schoolName")?.trim() ?? "School";

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const admin = createAdminClient();
    const unreadCount = await getParentMessagesUnreadCount(
      admin,
      supabase,
      organizationId,
      user.id,
      schoolName,
    );
    return NextResponse.json({ unreadCount });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to load unread count.",
      code: "internal_error",
      cause: err,
    });
  }
}
