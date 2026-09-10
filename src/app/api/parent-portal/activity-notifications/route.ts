import { NextResponse } from "next/server";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { apiError } from "@/lib/api/route-errors";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import {
  fetchParentActivityNotifications,
  parseParentNotificationContextFromSearchParams,
} from "@/lib/parent-portal/parent-activity-notifications";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/parent-portal/activity-notifications";
const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 30;

function parseLimit(value: string | null): number {
  if (!value) return DEFAULT_LIMIT;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

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

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const slug = searchParams.get("slug")?.trim() ?? "";
  const cursor = searchParams.get("cursor")?.trim() || null;
  const limit = parseLimit(searchParams.get("limit"));
  const parentNavBasePath = searchParams.get("parentNavBasePath")?.trim() || undefined;
  const applyBasePath = searchParams.get("applyBasePath")?.trim() || undefined;
  const notificationContext = parseParentNotificationContextFromSearchParams(
    slug,
    searchParams,
    { parentNavBasePath, applyBasePath },
  );

  if (!organizationId || !slug) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and slug are required.",
      code: "missing_fields",
    });
  }

  try {
    const org = await fetchOrganizationWithSettings(supabase, slug);
    if (!org || org.id !== organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    const hasAccess = await userHasEnrolledAccess(
      supabase,
      user.id,
      organizationId,
    );
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to the parent portal.",
        code: "forbidden",
      });
    }

    const familyIds = await getFamilyIdsForUser(
      supabase,
      user.id,
      organizationId,
    );
    const familyId = familyIds[0];
    if (!familyId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "No family found for this account.",
        code: "family_not_found",
      });
    }

    const admin = createAdminClient();
    const page = await fetchParentActivityNotifications(
      admin,
      organizationId,
      slug,
      familyId,
      {
        cursor,
        limit,
        notificationContext,
        parentNavBasePath: notificationContext.parentNavBasePath,
        applyBasePath: notificationContext.applyBasePath,
      },
    );

    return NextResponse.json(page);
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load activity notifications.",
      code: "internal_error",
      cause: error,
    });
  }
}
