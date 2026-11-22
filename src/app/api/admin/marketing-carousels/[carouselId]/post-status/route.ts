import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { setMarketingCarouselPosted, SLIDE_ID_PATTERN } from "@/lib/marketing/carousel-post-status";
import { isMarketingCarouselId } from "@/lib/marketing/marketing-carousel-ids";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/marketing-carousels/[carouselId]/post-status";

type RouteContext = {
  params: Promise<{ carouselId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { carouselId } = await context.params;

  if (!isMarketingCarouselId(carouselId)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Unknown marketing carousel.",
      code: "invalid_carousel_id",
    });
  }

  try {
    await requirePlatformAdminUser(supabase, request);

    let body: { posted?: boolean; slideId?: unknown };
    try {
      body = (await request.json()) as { posted?: boolean; slideId?: unknown };
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid JSON body.",
        code: "invalid_body",
      });
    }

    if (typeof body.posted !== "boolean") {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "posted must be a boolean.",
        code: "invalid_body",
      });
    }

    // Optional: one slide of an ad set or post set. Omitted = the whole entry.
    const slideId = body.slideId ?? "";
    if (typeof slideId !== "string" || (slideId !== "" && !SLIDE_ID_PATTERN.test(slideId))) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "slideId must be a slide id.",
        code: "invalid_slide_id",
      });
    }

    const admin = createAdminClient();
    const status = await setMarketingCarouselPosted(admin, carouselId, body.posted, slideId);
    return NextResponse.json({ carouselId, slideId, ...status });
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
      error: "Failed to update marketing carousel post status.",
      code: "internal_error",
      cause: error,
    });
  }
}
