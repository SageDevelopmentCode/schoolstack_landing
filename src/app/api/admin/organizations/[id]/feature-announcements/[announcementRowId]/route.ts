import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  deleteAdminFeatureAnnouncement,
  updateAdminFeatureAnnouncement,
  type AdminFeatureAnnouncementUpdateInput,
} from "@/lib/admin/admin-feature-announcements-storage";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE =
  "/api/admin/organizations/[id]/feature-announcements/[announcementRowId]";

type RouteContext = {
  params: Promise<{ id: string; announcementRowId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: organizationId, announcementRowId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase);

    let body: AdminFeatureAnnouncementUpdateInput;
    try {
      body = (await request.json()) as AdminFeatureAnnouncementUpdateInput;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    const admin = createAdminClient();

    const { data: existing, error: existingError } = await admin
      .from("admin_feature_announcements")
      .select("id, organization_id")
      .eq("id", announcementRowId)
      .maybeSingle();

    if (existingError) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: existingError.message,
        cause: existingError,
      });
    }

    if (!existing || existing.organization_id !== organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Organization dashboard card override not found.",
        code: "announcement_not_found",
      });
    }

    const announcement = await updateAdminFeatureAnnouncement(
      admin,
      announcementRowId,
      body,
    );
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
      error:
        error instanceof Error
          ? error.message
          : "Failed to update organization dashboard card override.",
      code: "internal_error",
      cause: error,
    });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: organizationId, announcementRowId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase);
    const admin = createAdminClient();

    const { data: existing, error: existingError } = await admin
      .from("admin_feature_announcements")
      .select("id, organization_id")
      .eq("id", announcementRowId)
      .maybeSingle();

    if (existingError) {
      return apiError(ROUTE, {
        status: 500,
        error: existingError.message,
        cause: existingError,
      });
    }

    if (!existing || existing.organization_id !== organizationId) {
      return apiError(ROUTE, {
        status: 404,
        error: "Organization dashboard card override not found.",
        code: "announcement_not_found",
      });
    }

    await deleteAdminFeatureAnnouncement(admin, announcementRowId);
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
      error: "Failed to delete organization dashboard card override.",
      code: "internal_error",
      cause: error,
    });
  }
}
