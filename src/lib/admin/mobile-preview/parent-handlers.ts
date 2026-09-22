import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { AuthError } from "@/lib/admissions/application-auth";
import { getOrganizationTimezone } from "@/lib/admissions/admissions-availability";
import {
  familyPreviewParentBasePath,
  getFamilyPreviewGuardianId,
  getFamilyPreviewGuardianUserId,
  getFamilyPreviewProfile,
  listFamilyChildrenForHomeByFamilyId,
  loadApplicationDetailForFamily,
} from "@/lib/admissions/family-preview-access";
import { familyPreviewBasePath } from "@/lib/admissions/preview-portal-options";
import { loadEnrollmentChecklistForApplication } from "@/lib/admissions/enrollment-checklist-materialization";
import {
  loadAssignedTeachersForStudent,
  type FamilyChildOverview,
} from "@/lib/admissions/parent-portal-access";
import {
  MobilePreviewAccessError,
  PREVIEW_NO_USER_ID,
  parseMobilePreviewQuery,
  requireMobilePreviewPlatformAdmin,
  validateFamilyInOrganization,
} from "@/lib/admin/mobile-preview/access";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import {
  getParentCommitteeWorkspace,
  listBrowsableCommitteesForParent,
  listParentCommitteeMemberships,
} from "@/lib/committees/parent-committees";
import {
  getParentVisibleClassroomSignup,
  loadParentClassroomSignupsPageBundle,
  loadParentSignupAttentionItems,
} from "@/lib/classroom-signups/load-parent-signups";
import {
  getFamilyClassroomSignupResponse,
  listClassroomSignupResponses,
} from "@/lib/classroom-signups/load-teacher-signups";
import { toParentVisibleSignupResponses } from "@/lib/classroom-signups/parent-response-visibility";
import { getThreadDetail } from "@/lib/messages/api-helpers";
import { loadParentMessagesPreviewInbox } from "@/lib/messages/parent-messages";
import { getTotalUnreadCount } from "@/lib/messages/threads";
import { getFamilyNotificationEmailSettings } from "@/lib/notifications/family-notification-emails";
import { fetchOrganizationWithSettingsUncached } from "@/lib/organization-settings/fetch";
import { buildParentQuickActions } from "@/lib/organization-settings/parent-home";
import { resolveMainParentOrganizationFeatures } from "@/lib/organization-settings/resolve-program-parent-features";
import { loadParentHomePreviewContentData } from "@/lib/parent-portal/load-parent-home-content-data";
import {
  fetchParentActivityNotifications,
  fetchUnreadParentActivityNotificationCount,
} from "@/lib/parent-portal/parent-activity-notifications";
import { resolveParentNotificationContextForApi } from "@/lib/parent-portal/parent-notification-context";
import { loadHomeBulletinPosts } from "@/lib/school-bulletin/posts";
import { mainPortalAudienceScope } from "@/lib/school-events/event-audience";
import { listEventsForOrg, listUpcomingEventsForOrg } from "@/lib/school-events/events";
import {
  assertParentFormAccess,
  getParentFormDetail,
  loadParentFormsDocumentsPageBundle,
} from "@/lib/school-parent/forms-documents/load-parent-forms";
import { getParentFormUploadStoragePath } from "@/lib/school-parent/forms-documents/mutations";
import { createTeacherFormSignedUrl } from "@/lib/school-teacher/forms-documents/teacher-form-file-storage";
import { listBillingSplits } from "@/lib/tuition/billing-splits";
import {
  filterChargesForFamilyGuardian,
  listChargesForFamily,
} from "@/lib/tuition/charges";
import { listAdjustmentsForFamily } from "@/lib/tuition/adjustments";
import { listParentTuitionPaymentHistory } from "@/lib/tuition/payments";
import {
  fetchParentBillingFamilySummary,
  pickInitialChildKey,
} from "@/lib/tuition/parent-billing-summary";
import { getAutopayEnabledForGuardian } from "@/lib/tuition/payment-settlement";
import { getDefaultPaymentMethodForGuardian } from "@/lib/tuition/payment-methods";
import { getRecentAutopayFailureForFamily } from "@/lib/tuition/autopay-failure-queries";
import { rowToBillingAccount } from "@/lib/tuition/row-mappers";
import { fetchFamilyBillingReadiness } from "@/lib/tuition/tuition-readiness";
import { shouldShowTaxCreditPaymentBanner } from "@/lib/tuition/family-checklist-responses";
import { createAdminClient } from "@/utils/supabase/admin";

const DEFAULT_ACTIVITY_LIMIT = 15;
const MAX_ACTIVITY_LIMIT = 30;

type ParentPreviewContext = {
  admin: SupabaseClient;
  request: Request;
  route: string;
  organizationId: string;
  slug: string;
  familyId: string;
  org: NonNullable<Awaited<ReturnType<typeof fetchOrganizationWithSettingsUncached>>>;
  previewParentBasePath: string;
};

function parseActivityLimit(value: string | null): number {
  if (!value) return DEFAULT_ACTIVITY_LIMIT;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_ACTIVITY_LIMIT;
  return Math.min(parsed, MAX_ACTIVITY_LIMIT);
}

async function resolveParentPreviewContext(
  request: Request,
  pathSegments: string[],
): Promise<ParentPreviewContext | Response> {
  const route = `/api/admin/mobile-preview/parent/${pathSegments.join("/")}`;

  await requireMobilePreviewPlatformAdmin(request);

  const query = parseMobilePreviewQuery(request);
  if (!query.organizationId || !query.slug || !query.familyId) {
    return apiError(route, {
      request,
      status: 400,
      error: "organizationId, slug, and familyId are required.",
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

  await validateFamilyInOrganization(admin, query.organizationId, query.familyId);

  return {
    admin,
    request,
    route,
    organizationId: query.organizationId,
    slug: query.slug,
    familyId: query.familyId,
    org,
    previewParentBasePath: familyPreviewParentBasePath(query.slug, query.familyId),
  };
}

async function assertParentPreviewCanAccessThread(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  threadId: string,
): Promise<string[]> {
  const { data: guardianRows, error: guardianError } = await admin
    .from("guardians")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId);

  if (guardianError) throw new Error(guardianError.message);

  const guardianIds = (guardianRows ?? []).map((row) => String(row.id));
  if (guardianIds.length === 0) {
    throw new MobilePreviewAccessError(
      "You do not have access to this thread.",
      "forbidden",
    );
  }

  const { data: participants, error } = await admin
    .from("message_thread_participants")
    .select("family_id, guardian_id, participant_kind")
    .eq("thread_id", threadId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);

  const allowed = (participants ?? []).some((row) => {
    if (
      row.participant_kind === "guardian" &&
      row.guardian_id &&
      guardianIds.includes(String(row.guardian_id))
    ) {
      return true;
    }

    return (
      row.participant_kind === "family" &&
      row.family_id &&
      String(row.family_id) === familyId
    );
  });

  if (!allowed) {
    throw new MobilePreviewAccessError(
      "You do not have access to this thread.",
      "forbidden",
    );
  }

  return guardianIds;
}

async function assertStudentBelongsToFamily(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  studentId: string,
): Promise<void> {
  const { data, error } = await admin
    .from("students")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .eq("id", studentId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new MobilePreviewAccessError("Student not found.", "not_found");
  }
}

async function loadBillingPreviewForMobile(
  admin: SupabaseClient,
  input: { organizationId: string; familyId: string; slug: string },
) {
  const guardianId = await getFamilyPreviewGuardianId(
    admin,
    input.organizationId,
    input.familyId,
  );
  const billingSplits = await listBillingSplits(admin, input.familyId);
  const hasBillingSplit = billingSplits.length > 0;

  const [allFamilyCharges, paymentRows, adjustmentRows, readinessState] =
    await Promise.all([
      listChargesForFamily(admin, input.familyId),
      listParentTuitionPaymentHistory(admin, input.familyId),
      listAdjustmentsForFamily(admin, input.familyId),
      fetchFamilyBillingReadiness(admin, {
        organizationId: input.organizationId,
        familyId: input.familyId,
        slug: input.slug,
      }),
    ]);

  const chargeRows = filterChargesForFamilyGuardian(
    allFamilyCharges,
    guardianId,
    { hasBillingSplit },
  );

  const familySummary = await fetchParentBillingFamilySummary(admin, {
    organizationId: input.organizationId,
    familyId: input.familyId,
    charges: chargeRows,
    allFamilyCharges,
  });

  const { data: account } = await admin
    .from("tuition_billing_accounts")
    .select("*")
    .eq("organization_id", input.organizationId)
    .eq("family_id", input.familyId)
    .maybeSingle();

  const billingAccount = account ? rowToBillingAccount(account) : null;
  const autopayEnabled = billingAccount
    ? getAutopayEnabledForGuardian(billingAccount, guardianId)
    : false;

  const savedPaymentMethod =
    billingAccount && guardianId !== undefined
      ? await getDefaultPaymentMethodForGuardian(admin, {
          billingAccountId: billingAccount.id,
          guardianId,
          defaultPaymentMethodId: billingAccount.defaultPaymentMethodId,
        })
      : null;

  const recentAutopayFailure = await getRecentAutopayFailureForFamily(admin, {
    organizationId: input.organizationId,
    familyId: input.familyId,
  });

  const showTaxCreditPaymentBanner = await shouldShowTaxCreditPaymentBanner(
    admin,
    {
      familyId: input.familyId,
      charges: chargeRows,
    },
  );

  return {
    charges: chargeRows,
    allFamilyCharges,
    payments: paymentRows,
    adjustments: adjustmentRows,
    readiness: readinessState,
    familySummary,
    autopayEnabled,
    savedPaymentMethod,
    recentAutopayFailure,
    guardianId,
    hasBillingSplit,
    initialChildKey: pickInitialChildKey(familySummary.children),
    showTaxCreditPaymentBanner,
  };
}

export async function handleParentMobilePreviewGet(
  request: Request,
  pathSegments: string[],
): Promise<Response> {
  const route = `/api/admin/mobile-preview/parent/${pathSegments.join("/")}`;

  try {
    const context = await resolveParentPreviewContext(request, pathSegments);
    if (context instanceof Response) return context;

    const {
      admin,
      organizationId,
      slug,
      familyId,
      org,
      previewParentBasePath,
    } = context;
    const features = resolveMainParentOrganizationFeatures(org.features);
    const url = new URL(request.url);
    const segment = pathSegments[0] ?? "";

    if (segment === "home") {
      const userProfile = await getFamilyPreviewProfile(admin, organizationId, familyId);
      const homeContent = await loadParentHomePreviewContentData({
        organizationId,
        familyId,
        slug,
        features,
        previewBasePath: previewParentBasePath,
        supabase: admin,
      });
      const bulletinEnabled = Boolean(org.features.admin?.bulletin);
      const [upcomingEvents, bulletinPosts] = await Promise.all([
        listUpcomingEventsForOrg(admin, organizationId, 3),
        loadHomeBulletinPosts({
          supabase: admin,
          signedUrlClient: admin,
          organizationId,
          bulletinEnabled,
          viewer: "parent",
          limit: 25,
        }),
      ]);
      const quickActions = buildParentQuickActions(
        slug,
        features,
        previewParentBasePath,
      );

      return NextResponse.json({
        branding: org.branding,
        schoolSlug: slug,
        schoolName: org.name,
        organizationId,
        userProfile,
        familyChildren: homeContent.familyChildren,
        quickActions,
        onboardingItems: homeContent.onboardingItems,
        upcomingEvents,
        enrollmentAmendmentBannerItems: homeContent.enrollmentAmendmentBannerItems,
        enrollmentIncompleteBannerItems: homeContent.enrollmentIncompleteBannerItems,
        formAttentionItems: homeContent.formAttentionItems,
        formSnapshot: homeContent.formSnapshot,
        bulletinEnabled,
        bulletinPosts,
      });
    }

    if (segment === "calendar") {
      const startDate = url.searchParams.get("start")?.trim() ?? "";
      const endDate = url.searchParams.get("end")?.trim() ?? "";
      const eventWindow =
        startDate && endDate ? { startDate, endDate } : undefined;

      const [events, timezone] = await Promise.all([
        listEventsForOrg(admin, organizationId, {
          ...eventWindow,
          audienceScope: mainPortalAudienceScope(),
        }),
        getOrganizationTimezone(admin, organizationId),
      ]);

      return NextResponse.json({ events, timezone });
    }

    if (segment === "billing") {
      const billingData = await loadBillingPreviewForMobile(admin, {
        organizationId,
        familyId,
        slug,
      });

      return NextResponse.json({
        branding: org.branding,
        schoolSlug: slug,
        schoolName: org.name,
        organizationId,
        familyId,
        ...billingData,
      });
    }

    if (segment === "notification-settings") {
      const profile = await getFamilyPreviewProfile(admin, organizationId, familyId);
      const settings = await getFamilyNotificationEmailSettings(admin, {
        familyId,
        loginEmail: profile.email?.trim() || null,
      });

      return NextResponse.json({
        familyId,
        ...settings,
      });
    }

    if (segment === "committees") {
      const subsegment = pathSegments[1] ?? "";

      if (subsegment === "browse") {
        const guardianUserId = await getFamilyPreviewGuardianUserId(
          admin,
          organizationId,
          familyId,
        );
        const committees = await listBrowsableCommitteesForParent(
          admin,
          organizationId,
          guardianUserId ?? PREVIEW_NO_USER_ID,
        );
        return NextResponse.json({ committees });
      }

      if (subsegment === "mine") {
        const guardianUserId = await getFamilyPreviewGuardianUserId(
          admin,
          organizationId,
          familyId,
        );
        const committees = guardianUserId
          ? await listParentCommitteeMemberships(admin, organizationId, guardianUserId)
          : [];
        return NextResponse.json({ committees });
      }

      const committeeId = subsegment;
      if (!committeeId) {
        return apiError(route, {
          request,
          status: 404,
          error: "Not found.",
          code: "not_found",
        });
      }

      const guardianUserId = await getFamilyPreviewGuardianUserId(
        admin,
        organizationId,
        familyId,
      );
      if (!guardianUserId) {
        return apiError(route, {
          request,
          status: 403,
          error: "You do not have access to this committee.",
          code: "forbidden",
        });
      }

      const committee = await getParentCommitteeWorkspace(
        admin,
        organizationId,
        guardianUserId,
        committeeId,
      );

      return NextResponse.json({ committee });
    }

    if (segment === "classroom-signups") {
      const signupId = pathSegments[1];
      if (!signupId) {
        const familyChildren = await listFamilyChildrenForHomeByFamilyId(
          admin,
          organizationId,
          familyId,
        );
        const studentOptions = familyChildren
          .filter((child) => child.studentId)
          .map((child) => ({
            id: child.studentId!,
            name: child.studentName,
          }));
        const bundle = await loadParentClassroomSignupsPageBundle(
          admin,
          organizationId,
          familyId,
          studentOptions,
        );
        return NextResponse.json(bundle);
      }

      const signup = await getParentVisibleClassroomSignup(
        admin,
        organizationId,
        familyId,
        signupId,
      );
      if (!signup) {
        return apiError(route, {
          request,
          status: 404,
          error: "Signup not found.",
          code: "not_found",
        });
      }

      const [responses, familyResponse, familyChildren] = await Promise.all([
        listClassroomSignupResponses(admin, organizationId, signupId),
        getFamilyClassroomSignupResponse(admin, organizationId, signupId, familyId),
        listFamilyChildrenForHomeByFamilyId(admin, organizationId, familyId),
      ]);

      return NextResponse.json({
        signup,
        responses: toParentVisibleSignupResponses(responses, familyId),
        familyResponse,
        studentOptions: familyChildren
          .filter((child: FamilyChildOverview) => child.studentId)
          .map((child: FamilyChildOverview) => ({
            id: child.studentId!,
            name: child.studentName,
          })),
      });
    }

    if (segment === "forms-documents") {
      const formId = pathSegments[1];
      if (!formId) {
        const bundle = await loadParentFormsDocumentsPageBundle(
          admin,
          organizationId,
          familyId,
        );
        return NextResponse.json(bundle);
      }

      if (pathSegments[2] === "download") {
        await assertParentFormAccess(admin, organizationId, familyId, formId);
        const { storagePath, fileName } = await getParentFormUploadStoragePath(
          admin,
          organizationId,
          formId,
        );
        const signedUrl = await createTeacherFormSignedUrl(admin, storagePath);
        return NextResponse.json({ signedUrl, fileName });
      }

      const detail = await getParentFormDetail(admin, organizationId, familyId, formId);
      if (!detail) {
        return apiError(route, {
          request,
          status: 404,
          error: "Form not found.",
          code: "not_found",
        });
      }

      return NextResponse.json(detail);
    }

    if (segment === "signups" && pathSegments[1] === "attention") {
      const items = await loadParentSignupAttentionItems(admin, organizationId, familyId);
      return NextResponse.json({ items });
    }

    if (segment === "messages") {
      const subsegment = pathSegments[1] ?? "";
      const schoolName = url.searchParams.get("schoolName")?.trim() || org.name;

      if (subsegment === "threads") {
        const threadId = pathSegments[2];
        if (!threadId) {
          const previewUserId =
            (await getFamilyPreviewGuardianUserId(admin, organizationId, familyId)) ??
            PREVIEW_NO_USER_ID;
          const inbox = await loadParentMessagesPreviewInbox(
            admin,
            organizationId,
            familyId,
            schoolName,
            previewUserId,
          );
          return NextResponse.json(inbox);
        }

        const previewUserId =
          (await getFamilyPreviewGuardianUserId(admin, organizationId, familyId)) ??
          PREVIEW_NO_USER_ID;
        await assertParentPreviewCanAccessThread(
          admin,
          organizationId,
          familyId,
          threadId,
        );

        const thread = await getThreadDetail(
          admin,
          organizationId,
          threadId,
          previewUserId,
          `${schoolName} Office`,
          "parent",
        );

        if (!thread) {
          return apiError(route, {
            request,
            status: 404,
            error: "Thread not found.",
            code: "not_found",
          });
        }

        return NextResponse.json({ thread });
      }

      if (subsegment === "unread-count") {
        const previewUserId =
          (await getFamilyPreviewGuardianUserId(admin, organizationId, familyId)) ??
          PREVIEW_NO_USER_ID;
        const { data: guardianRows, error: guardianError } = await admin
          .from("guardians")
          .select("id")
          .eq("organization_id", organizationId)
          .eq("family_id", familyId);

        if (guardianError) throw new Error(guardianError.message);

        const guardianIds = (guardianRows ?? []).map((row) => String(row.id));
        const unreadCount =
          guardianIds.length > 0
            ? await getTotalUnreadCount(
                admin,
                organizationId,
                previewUserId,
                `${schoolName} Office`,
                "parent",
                { type: "guardian", guardianIds },
              )
            : 0;

        return NextResponse.json({ unreadCount });
      }
    }

    if (segment === "students" && pathSegments[2] === "teachers") {
      const studentId = pathSegments[1];
      if (!studentId) {
        return apiError(route, {
          request,
          status: 400,
          error: "studentId is required.",
          code: "missing_fields",
        });
      }

      await assertStudentBelongsToFamily(admin, organizationId, familyId, studentId);
      const teachers = await loadAssignedTeachersForStudent(
        admin,
        organizationId,
        studentId,
      );

      return NextResponse.json({ teachers });
    }

    if (segment === "children" && pathSegments[2] === "profile") {
      const applicationId = pathSegments[1];
      if (!applicationId) {
        return apiError(route, {
          request,
          status: 400,
          error: "applicationId is required.",
          code: "missing_fields",
        });
      }

      const application = await loadApplicationDetailForFamily(
        admin,
        organizationId,
        familyId,
        applicationId,
      );
      if (!application) {
        return apiError(route, {
          request,
          status: 404,
          error: "Student profile not found.",
          code: "not_found",
        });
      }

      const [checklist, assignedTeachers] = await Promise.all([
        loadEnrollmentChecklistForApplication(admin, applicationId, organizationId),
        application.studentId
          ? loadAssignedTeachersForStudent(admin, organizationId, application.studentId)
          : Promise.resolve([]),
      ]);

      return NextResponse.json({
        profile: {
          application,
          checklist,
          assignedTeachers,
        },
      });
    }

    if (segment === "activity-notifications") {
      const notificationContext =
        await resolveParentNotificationContextForApi(admin, {
          organizationId,
          slug,
          searchParams: url.searchParams,
        });
      if (!notificationContext) {
        return apiError(route, {
          request,
          status: 404,
          error: "Program not found.",
          code: "not_found",
        });
      }

      const previewUserId =
        (await getFamilyPreviewGuardianUserId(admin, organizationId, familyId)) ??
        PREVIEW_NO_USER_ID;
      const applyBasePath = `${familyPreviewBasePath(slug, familyId)}/apply`;

      if (pathSegments[1] === "unread-count") {
        const unreadCount = await fetchUnreadParentActivityNotificationCount(
          admin,
          previewUserId,
          organizationId,
          slug,
          familyId,
          {
            notificationContext,
            parentNavBasePath: previewParentBasePath,
            applyBasePath,
          },
        );

        return NextResponse.json({ unreadCount });
      }

      const page = await fetchParentActivityNotifications(
        admin,
        organizationId,
        slug,
        familyId,
        {
          cursor: url.searchParams.get("cursor")?.trim() || null,
          limit: parseActivityLimit(url.searchParams.get("limit")),
          notificationContext,
          parentNavBasePath: previewParentBasePath,
          applyBasePath,
        },
      );

      return NextResponse.json(page);
    }

    return apiError(route, {
      request,
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

    if (err instanceof MobilePreviewAccessError) {
      const status = err.code === "not_found" ? 404 : 403;
      return apiError(route, {
        request,
        status,
        error: err.message,
        code: err.code,
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
