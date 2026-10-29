import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  listOrgApplicationSubmissionsPage,
  ORG_SUBMISSIONS_PAGE_DEFAULT_SIZE,
  type SubmissionListStatusFilter,
} from "@/lib/admissions/application-submissions";
import {
  MobilePreviewAccessError,
  parseMobilePreviewQuery,
  requireMobilePreviewPlatformAdmin,
  validateMembershipInOrganization,
} from "@/lib/admin/mobile-preview/access";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import {
  assertSchoolAdminCanAccessThread,
  getThreadDetail,
} from "@/lib/messages/api-helpers";
import {
  loadAdminMessagesContacts,
  loadAdminMessagesInbox,
} from "@/lib/messages/admin-messages";
import { getAdminMessagesUnreadCount } from "@/lib/messages/unread-count-api";
import { fetchOrganizationWithSettingsUncached } from "@/lib/organization-settings/fetch";
import {
  fetchSchoolAdminActivityNotifications,
  fetchUnreadActivityNotificationCount,
} from "@/lib/school-admin/activity-notifications";
import { loadStudentAttendanceHistory } from "@/lib/school-admin/attendance/attendance-history";
import {
  AttendanceMutationError,
  parseAttendanceDate,
} from "@/lib/school-admin/attendance/attendance-mutations";
import { loadAttendancePickupContacts } from "@/lib/school-admin/attendance/attendance-pickup-contacts";
import { loadAttendanceRoster } from "@/lib/school-admin/attendance/attendance-roster";
import { fetchAdminDashboardSummary } from "@/lib/school-admin/dashboard-summary";
import {
  MembershipPreviewAccessError,
  getMembershipPreviewContext,
} from "@/lib/school-admin/membership-preview-access";
import { fetchSubmissionPageMeta } from "@/lib/school-admin/submissions-page-meta";
import {
  listOrgEnrolledStudentsPage,
  ORG_ENROLLED_STUDENTS_PAGE_DEFAULT_LIMIT,
  ORG_ENROLLED_STUDENTS_PAGE_MAX_LIMIT,
} from "@/lib/school-admin/students-roster-page";
import { fetchStudentsPageMeta } from "@/lib/school-admin/students-page-meta";
import { listStaffMembers } from "@/lib/staff/staff-members";
import {
  buildMobilePreviewPortalOptions,
  PreviewPortalOptionsError,
} from "@/lib/admin/mobile-preview/preview-portal-options";
import { createAdminClient } from "@/utils/supabase/admin";

const DEFAULT_ACTIVITY_LIMIT = 15;
const MAX_ACTIVITY_LIMIT = 30;

type SchoolAdminPreviewContext = {
  admin: SupabaseClient;
  request: Request;
  route: string;
  organizationId: string;
  slug: string;
  membershipId: string;
  org: NonNullable<Awaited<ReturnType<typeof fetchOrganizationWithSettingsUncached>>>;
  previewContext: Awaited<ReturnType<typeof getMembershipPreviewContext>>;
};

function parseActivityLimit(value: string | null): number {
  if (!value) return DEFAULT_ACTIVITY_LIMIT;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_ACTIVITY_LIMIT;
  return Math.min(parsed, MAX_ACTIVITY_LIMIT);
}

async function resolveSchoolAdminPreviewContext(
  request: Request,
  pathSegments: string[],
): Promise<SchoolAdminPreviewContext | Response> {
  const route = `/api/admin/mobile-preview/school-admin/${pathSegments.join("/")}`;

  await requireMobilePreviewPlatformAdmin(request);

  const query = parseMobilePreviewQuery(request);
  if (!query.organizationId || !query.slug || !query.membershipId) {
    return apiError(route, {
      request,
      status: 400,
      error: "organizationId, slug, and membershipId are required.",
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

  await validateMembershipInOrganization(
    admin,
    query.organizationId,
    query.membershipId,
  );

  const previewContext = await getMembershipPreviewContext(
    admin,
    query.organizationId,
    query.membershipId,
  );

  return {
    admin,
    request,
    route,
    organizationId: query.organizationId,
    slug: query.slug,
    membershipId: query.membershipId,
    org,
    previewContext,
  };
}

export async function handleSchoolAdminMobilePreviewGet(
  request: Request,
  pathSegments: string[],
): Promise<Response> {
  const route = `/api/admin/mobile-preview/school-admin/${pathSegments.join("/")}`;

  try {
    const segment = pathSegments[0] ?? "";

    if (segment === "portal-options") {
      await requireMobilePreviewPlatformAdmin(request);
      const previewQuery = parseMobilePreviewQuery(request);
      if (!previewQuery.organizationId || !previewQuery.slug) {
        return apiError(route, {
          request,
          status: 400,
          error: "organizationId and slug are required.",
          code: "missing_fields",
        });
      }
      if (
        !previewQuery.membershipId &&
        !previewQuery.staffMemberId &&
        !previewQuery.familyId
      ) {
        return apiError(route, {
          request,
          status: 400,
          error:
            "membershipId, staffMemberId, or familyId is required for portal options.",
          code: "missing_fields",
        });
      }

      const admin = createAdminClient();
      const payload = await buildMobilePreviewPortalOptions(admin, {
        organizationId: previewQuery.organizationId,
        slug: previewQuery.slug,
        membershipId: previewQuery.membershipId,
        staffMemberId: previewQuery.staffMemberId,
        familyId: previewQuery.familyId,
      });
      return NextResponse.json(payload);
    }

    const context = await resolveSchoolAdminPreviewContext(request, pathSegments);
    if (context instanceof Response) return context;

    const {
      admin,
      request: req,
      organizationId,
      slug,
      org,
      previewContext,
    } = context;
    const url = new URL(req.url);
    const previewUserId = previewContext.userId;

    if (segment === "dashboard-summary") {
      const summary = await fetchAdminDashboardSummary(
        admin,
        admin,
        organizationId,
        slug,
        org.features.admin,
        { userId: previewUserId, schoolName: org.name },
      );

      return NextResponse.json({
        ...summary,
        viewerProfile: previewContext.userProfile,
      });
    }

    if (segment === "activity-notifications") {
      if (pathSegments[1] === "unread-count") {
        const unreadCount = await fetchUnreadActivityNotificationCount(
          admin,
          previewUserId,
          organizationId,
        );
        return NextResponse.json({ unreadCount });
      }

      const cursor = url.searchParams.get("cursor")?.trim() || null;
      const limit = parseActivityLimit(url.searchParams.get("limit"));
      const page = await fetchSchoolAdminActivityNotifications(
        admin,
        organizationId,
        slug,
        { cursor, limit },
      );
      return NextResponse.json(page);
    }

    if (segment === "messages") {
      const subsegment = pathSegments[1] ?? "";
      const schoolName = url.searchParams.get("schoolName")?.trim() || org.name;

      if (subsegment === "threads") {
        const threadId = pathSegments[2];
        if (!threadId) {
          const inbox = await loadAdminMessagesInbox(
            admin,
            organizationId,
            previewUserId,
            schoolName,
            admin,
            { includeContacts: false },
          );
          return NextResponse.json(inbox);
        }

        await assertSchoolAdminCanAccessThread(admin, organizationId, threadId);

        const thread = await getThreadDetail(
          admin,
          organizationId,
          threadId,
          previewUserId,
          `${schoolName} Office`,
          "admin",
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

      if (subsegment === "contacts") {
        const contacts = await loadAdminMessagesContacts(
          admin,
          organizationId,
          schoolName,
        );
        return NextResponse.json({ contacts });
      }

      if (subsegment === "unread-count") {
        const unreadCount = await getAdminMessagesUnreadCount(
          admin,
          organizationId,
          previewUserId,
          schoolName,
        );
        return NextResponse.json({ unreadCount });
      }
    }

    if (segment === "attendance") {
      const subsegment = pathSegments[1] ?? "";

      if (!subsegment) {
        const date =
          url.searchParams.get("date")?.trim() ??
          new Date().toISOString().slice(0, 10);
        parseAttendanceDate(date);
        const roster = await loadAttendanceRoster(admin, organizationId, date);
        return NextResponse.json(roster);
      }

      if (subsegment === "history") {
        const studentId = url.searchParams.get("studentId")?.trim() ?? "";
        const limitParam = url.searchParams.get("limit")?.trim();
        const offsetParam = url.searchParams.get("offset")?.trim();
        const limit = limitParam ? Number.parseInt(limitParam, 10) : 14;
        const offset = offsetParam ? Number.parseInt(offsetParam, 10) : 0;

        if (!studentId) {
          return apiError(route, {
            request: req,
            status: 400,
            error: "studentId is required.",
            code: "missing_fields",
          });
        }

        const history = await loadStudentAttendanceHistory(
          admin,
          organizationId,
          studentId,
          {
            limit: Number.isFinite(limit) ? limit : 14,
            offset: Number.isFinite(offset) ? offset : 0,
          },
        );

        return NextResponse.json(history);
      }

      if (subsegment === "pickup-contacts") {
        const familyId = url.searchParams.get("familyId")?.trim() ?? "";
        const studentId = url.searchParams.get("studentId")?.trim() ?? "";

        if (!familyId || !studentId) {
          return apiError(route, {
            request: req,
            status: 400,
            error: "familyId and studentId are required.",
            code: "missing_fields",
          });
        }

        const contacts = await loadAttendancePickupContacts(
          admin,
          organizationId,
          studentId,
          familyId,
        );

        return NextResponse.json({ contacts });
      }
    }

    if (segment === "admissions" && pathSegments[1] === "submissions") {
      const statusFilter =
        (url.searchParams.get("status")?.trim() as SubmissionListStatusFilter | "") ||
        "all";
      const formKey = url.searchParams.get("formKey")?.trim() || "all";
      const includeMeta = url.searchParams.get("includeMeta") === "1";
      const offset = Math.max(
        Number.parseInt(url.searchParams.get("offset") ?? "0", 10) || 0,
        0,
      );
      const limit = Math.min(
        Math.max(
          Number.parseInt(
            url.searchParams.get("limit") ??
              String(ORG_SUBMISSIONS_PAGE_DEFAULT_SIZE),
            10,
          ) || ORG_SUBMISSIONS_PAGE_DEFAULT_SIZE,
          1,
        ),
        500,
      );

      const [page, meta] = await Promise.all([
        listOrgApplicationSubmissionsPage(admin, organizationId, {
          limit,
          offset,
          statusFilter,
          formKey,
          enrichment: "minimal",
        }),
        includeMeta ? fetchSubmissionPageMeta(admin, organizationId) : null,
      ]);

      return NextResponse.json({
        submissions: page.submissions,
        totalCount: page.totalCount,
        pageSize: limit,
        ...(meta ? { meta } : {}),
      });
    }

    if (segment === "students") {
      const limit = Math.min(
        Math.max(
          Number(url.searchParams.get("limit") ?? ORG_ENROLLED_STUDENTS_PAGE_DEFAULT_LIMIT),
          1,
        ),
        ORG_ENROLLED_STUDENTS_PAGE_MAX_LIMIT,
      );
      const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
      const filter = url.searchParams.get("filter")?.trim() || "all";
      const search = url.searchParams.get("q")?.trim() ?? "";
      const includeMeta = url.searchParams.get("includeMeta") === "1";
      const includeStaff = url.searchParams.get("includeStaff") === "1";

      const [page, meta, staffMembers] = await Promise.all([
        listOrgEnrolledStudentsPage(admin, organizationId, {
          limit,
          offset,
          filter,
          search,
        }),
        includeMeta ? fetchStudentsPageMeta(admin, organizationId) : Promise.resolve(null),
        includeStaff
          ? listStaffMembers(admin, organizationId)
          : Promise.resolve(null),
      ]);

      return NextResponse.json({
        students: page.students,
        totalCount: page.totalCount,
        limit: page.limit,
        offset: page.offset,
        hasMore: page.hasMore,
        ...(meta ? { meta } : {}),
        ...(staffMembers ? { staffMembers } : {}),
      });
    }

    return apiError(route, {
      request: req,
      status: 404,
      error: "Not found.",
      code: "not_found",
    });
  } catch (err) {
    if (err instanceof AttendanceMutationError) {
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
      err instanceof MembershipPreviewAccessError ||
      err instanceof PreviewPortalOptionsError
    ) {
      return apiError(route, {
        request,
        status: err.code === "forbidden" ? 403 : 404,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    const resolved = portalRouteErrorStatus(err, "Preview request failed.");
    return apiError(route, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.code,
      cause: err,
    });
  }
}
