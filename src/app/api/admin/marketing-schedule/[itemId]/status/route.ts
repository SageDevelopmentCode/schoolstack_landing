import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { setMarketingCarouselPosted } from "@/lib/marketing/carousel-post-status";
import { setSchedulePostStatus } from "@/lib/marketing/schedule-post-status";
import { getScheduleItem, isScheduleStatus } from "@/lib/marketing/social-schedule";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/marketing-schedule/[itemId]/status";

type RouteContext = { params: Promise<{ itemId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { itemId } = await context.params;
  const item = getScheduleItem(itemId);

  if (!item) {
    return apiError(ROUTE, { request, status: 400, error: "Unknown scheduled post.", code: "invalid_schedule_item" });
  }

  try {
    await requirePlatformAdminUser(supabase, request);

    let body: { status?: unknown };
    try {
      body = (await request.json()) as { status?: unknown };
    } catch {
      return apiError(ROUTE, { request, status: 400, error: "Invalid JSON body.", code: "invalid_body" });
    }

    if (!isScheduleStatus(body.status)) {
      return apiError(ROUTE, { request, status: 400, error: "status must be planned, scheduled or posted.", code: "invalid_body" });
    }

    const admin = createAdminClient();
    const saved = await setSchedulePostStatus(admin, item.id, body.status);

    // A whole carousel goes out once, so posting it also flips its Posted badge in the Studio.
    // Sets of singles keep their own badge: one single going out doesn't mean the set has.
    // Paid ad options don't touch the organic Posted badge.
    let carouselPosted = false;
    if (item.kind !== "ad" && !item.slideId && saved.status === "posted") {
      await setMarketingCarouselPosted(admin, item.carouselId, true);
      carouselPosted = true;
    }

    return NextResponse.json({ itemId: item.id, ...saved, carouselPosted });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, { request, status: error.status, error: error.message, code: error.code, cause: error });
    }
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to update the scheduled post status.",
      code: "internal_error",
      cause: error,
    });
  }
}
