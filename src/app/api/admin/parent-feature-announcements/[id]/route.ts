import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  deleteParentFeatureAnnouncement,
  updateParentFeatureAnnouncement,
  type ParentFeatureAnnouncementUpdateInput,
} from "@/lib/admin/parent-feature-announcements-storage";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/parent-feature-announcements/[id]";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id } = await context.params;

  try {
    await requirePlatformAdminUser(supabase, request);

    let body: ParentFeatureAnnouncementUpdateInput;
    try {
      body = (await request.json()) as ParentFeatureAnnouncementUpdateInput;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    const admin = createAdminClient();
    const announcement = await updateParentFeatureAnnouncement(admin, id, body);
    return NextResponse.json({ announcement });
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
      error: "Failed to update global parent portal card.",
      cause: error,
      code: "internal_error",
    });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id } = await context.params;

  try {
    await requirePlatformAdminUser(supabase, request);
    const admin = createAdminClient();
    await deleteParentFeatureAnnouncement(admin, id);
    return NextResponse.json({ ok: true });
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
      status: 500,
      error: "Failed to delete global parent portal card.",
      code: "internal_error",
      cause: error,
    });
  }
}
