import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { AuthError } from "@/lib/admissions/application-auth";
import { getOrganizationTimezone } from "@/lib/admissions/admissions-availability";
import {
  MobilePreviewAccessError,
  PREVIEW_NO_USER_ID,
  parseMobilePreviewQuery,
  requireMobilePreviewPlatformAdmin,
  validateStaffInOrganization,
} from "@/lib/admin/mobile-preview/access";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { assertTeacherCanAccessThread, getThreadDetail } from "@/lib/messages/api-helpers";
import { getTotalUnreadCount } from "@/lib/messages/threads";
import { fetchOrganizationWithSettingsUncached } from "@/lib/organization-settings/fetch";
import { isTeacherFeatureEnabled } from "@/lib/organization-settings/teacher-routes";
import {
  fetchTeacherActivityNotifications,
  fetchUnreadTeacherActivityNotificationCount,
} from "@/lib/school-teacher/activity-notifications";
import { loadTeacherDashboardPreviewData } from "@/lib/school-teacher/load-teacher-dashboard-data";
import { loadTeacherCalendarPreviewData } from "@/lib/school-events/load-teacher-calendar-data";
import {
  loadTeacherAssignedStudentDetail,
  loadTeacherMessageableFamilyStudentDetail,
  loadTeacherSchoolStudentDetail,
} from "@/lib/school-admin/enrolled-students";
import { loadStudentHealthProfile } from "@/lib/student-health/load-student-health-profile";
import {
  getStaffPreviewContext,
  loadTeacherMessagesPreviewInbox,
  StaffPreviewAccessError,
} from "@/lib/staff/staff-preview-access";
import type { StaffPortalRole } from "@/lib/staff/staff-members";
import { createAdminClient } from "@/utils/supabase/admin";

const DEFAULT_ACTIVITY_LIMIT = 15;
const MAX_ACTIVITY_LIMIT = 30;

type TeacherPreviewContext = {
  admin: SupabaseClient;
  request: Request;
  route: string;
  organizationId: string;
  slug: string;
  staffMemberId: string;
  org: NonNullable<Awaited<ReturnType<typeof fetchOrganizationWithSettingsUncached>>>;
  previewContext: Awaited<ReturnType<typeof getStaffPreviewContext>>;
};

function parseActivityLimit(value: string | null): number {
  if (!value) return DEFAULT_ACTIVITY_LIMIT;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_ACTIVITY_LIMIT;
  return Math.min(parsed, MAX_ACTIVITY_LIMIT);
}

async function resolveTeacherPreviewContext(
  request: Request,
  pathSegments: string[],
): Promise<TeacherPreviewContext | Response> {
  const route = `/api/admin/mobile-preview/teacher/${pathSegments.join("/")}`;

  await requireMobilePreviewPlatformAdmin(request);

  const query = parseMobilePreviewQuery(request);
  if (!query.organizationId || !query.slug || !query.staffMemberId) {
    return apiError(route, {
      request,
      status: 400,
      error: "organizationId, slug, and staffMemberId are required.",
      code: "missing_fields",
    });
  }

  const admin = createAdminClient();
  const org = await fetchOrganizationWithSettingsUncached(admin, query.slug);
  if (!org || org.id !== query.organizationId) {
    return apiError(route, {
      request,
      status: 404,
      error: "School not found.",
      code: "not_found",
    });
  }

  await validateStaffInOrganization(admin, query.organizationId, query.staffMemberId);

  const previewContext = await getStaffPreviewContext(
    admin,
    query.organizationId,
    query.staffMemberId,
  );

  return {
    admin,
    request,
    route,
    organizationId: query.organizationId,
    slug: query.slug,
    staffMemberId: query.staffMemberId,
    org,
    previewContext,
  };
}

async function authorizeTeacherPreviewStudentHealthAccess(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  studentId: string,
): Promise<boolean> {
  const [assignedDetail, messageableDetail, schoolDetail] = await Promise.all([
    loadTeacherAssignedStudentDetail(
      admin,
      organizationId,
      staffMemberId,
      studentId,
    ),
    loadTeacherMessageableFamilyStudentDetail(
      admin,
      organizationId,
      staffMemberId,
      studentId,
    ),
    loadTeacherSchoolStudentDetail(admin, organizationId, studentId),
  ]);

  return Boolean(assignedDetail || messageableDetail || schoolDetail);
}

export async function handleTeacherMobilePreviewGet(
  request: Request,
  pathSegments: string[],
): Promise<Response> {
  const route = `/api/admin/mobile-preview/teacher/${pathSegments.join("/")}`;

  try {
    const context = await resolveTeacherPreviewContext(request, pathSegments);
    if (context instanceof Response) return context;

    const {
      admin,
      request: req,
      organizationId,
      slug,
      staffMemberId,
      org,
      previewContext,
    } = context;
    const url = new URL(req.url);
    const segment = pathSegments[0] ?? "";
    const previewUserId = previewContext.userId ?? PREVIEW_NO_USER_ID;

    if (segment === "home") {
      const summary = await loadTeacherDashboardPreviewData({
        organizationId,
        slug,
        features: org.features,
        staffMemberId,
        schoolName: org.name,
      });

      const portalRole: StaffPortalRole | null = previewContext.portalRole;

      return NextResponse.json({
        branding: org.branding,
        schoolSlug: slug,
        schoolName: org.name,
        organizationId,
        features: org.features,
        userProfile: previewContext.userProfile,
        roleTitle: previewContext.roleTitle,
        portalRole,
        summary,
      });
    }

    if (segment === "calendar") {
      if (!isTeacherFeatureEnabled(org.features, "calendar")) {
        return apiError(route, {
          request: req,
          status: 404,
          error: "Calendar is not enabled for this school.",
          code: "feature_disabled",
        });
      }

      const [initialData, timezone] = await Promise.all([
        loadTeacherCalendarPreviewData({
          organizationId,
          staffMemberId: previewContext.staffMemberId,
          portalRole: previewContext.portalRole,
          membershipStatus: previewContext.membershipStatus,
        }),
        getOrganizationTimezone(admin, organizationId),
      ]);

      return NextResponse.json({
        events: initialData.events,
        timezone,
        canManageEvents: initialData.canManageEvents,
      });
    }

    if (segment === "messages") {
      const subsegment = pathSegments[1] ?? "";
      const schoolName = url.searchParams.get("schoolName")?.trim() || org.name;

      if (subsegment === "threads") {
        const threadId = pathSegments[2];
        if (!threadId) {
          const inbox = await loadTeacherMessagesPreviewInbox(
            admin,
            organizationId,
            staffMemberId,
            schoolName,
          );
          return NextResponse.json(inbox);
        }

        await assertTeacherCanAccessThread(
          admin,
          organizationId,
          staffMemberId,
          threadId,
        );

        const thread = await getThreadDetail(
          admin,
          organizationId,
          threadId,
          previewUserId,
          `${schoolName} Office`,
          "teacher",
          { currentStaffMemberId: staffMemberId },
        );

        if (!thread) {
          return apiError(route, {
            request: req,
            status: 404,
            error: "Thread not found.",
            code: "not_found",
          });
        }

        return NextResponse.json({ thread });
      }

      if (subsegment === "unread-count") {
        const unreadCount = await getTotalUnreadCount(
          admin,
          organizationId,
          previewUserId,
          `${schoolName} Office`,
          "teacher",
          { type: "staff", staffMemberId },
        );

        return NextResponse.json({ unreadCount });
      }
    }

    if (segment === "students" && pathSegments[2] === "health") {
      const studentId = pathSegments[1];
      if (!studentId) {
        return apiError(route, {
          request: req,
          status: 400,
          error: "studentId is required.",
          code: "missing_fields",
        });
      }

      const hasAccess = await authorizeTeacherPreviewStudentHealthAccess(
        admin,
        organizationId,
        staffMemberId,
        studentId,
      );

      if (!hasAccess) {
        return apiError(route, {
          request: req,
          status: 403,
          error: "You do not have permission to view this student's health profile.",
          code: "forbidden",
        });
      }

      const profile = await loadStudentHealthProfile(admin, organizationId, studentId);
      return NextResponse.json({ profile });
    }

    if (segment === "activity-notifications") {
      if (pathSegments[1] === "unread-count") {
        const unreadCount = await fetchUnreadTeacherActivityNotificationCount(
          admin,
          previewUserId,
          organizationId,
          slug,
          staffMemberId,
        );

        return NextResponse.json({ unreadCount });
      }

      const page = await fetchTeacherActivityNotifications(
        admin,
        organizationId,
        slug,
        staffMemberId,
        {
          cursor: url.searchParams.get("cursor")?.trim() || null,
          limit: parseActivityLimit(url.searchParams.get("limit")),
          viewerUserId: previewUserId,
        },
      );

      return NextResponse.json(page);
    }

    return apiError(route, {
      request: req,
      status: 404,
      error: "Not found.",
      code: "not_found",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return apiError(route, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    if (
      err instanceof MobilePreviewAccessError ||
      err instanceof StaffPreviewAccessError
    ) {
      const code = err.code;
      const status = code === "not_found" ? 404 : 403;
      return apiError(route, {
        request,
        status,
        error: err.message,
        code,
        cause: err,
      });
    }

    const resolved = portalRouteErrorStatus(
      err,
      "Failed to load preview data.",
    );
    return apiError(route, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.code,
      cause: err,
    });
  }
}
