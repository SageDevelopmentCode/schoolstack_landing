import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  getFamilyUserProfile,
  listFamilyChildrenForHome,
} from "@/lib/admissions/parent-portal-access";
import {
  fireClassroomSignupActivityNotification,
  sendClassroomSignupResponseSubmittedNotification,
} from "@/lib/classroom-signups/classroom-signup-notifications";
import {
  getFamilyClassroomSignupResponse,
  listClassroomSignupResponses,
} from "@/lib/classroom-signups/load-teacher-signups";
import { getParentVisibleClassroomSignup } from "@/lib/classroom-signups/load-parent-signups";
import { toParentVisibleSignupResponses } from "@/lib/classroom-signups/parent-response-visibility";
import {
  resolveAuthorizedFamilyIdForStudent,
  resolveParentClassroomSignupContext,
} from "@/lib/classroom-signups/resolve-parent-signup-family";
import {
  ClassroomSignupSubmitError,
  upsertClassroomSignupResponse,
  withdrawClassroomSignupResponse,
  type ClassroomSignupSubmitFailureReason,
} from "@/lib/classroom-signups/mutations";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/classroom-signups/[signupId]";

type SignupParams = { signupId: string };

export const GET = withParentPortalRoute<undefined, SignupParams>(
  {
    route: ROUTE,
    fallbackErrorMessage: "Failed to load signup.",
  },
  async ({ request, supabase, user, organizationId, access, params }) => {
    const { signupId } = params;

    try {
      const familyIds = access.familyIds;
      if (familyIds.length === 0) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "Family not found.",
          code: "not_found",
        });
      }

      const admin = createAdminClient();
      const studentId =
        new URL(request.url).searchParams.get("studentId")?.trim() ?? null;
      const context = await resolveParentClassroomSignupContext(
        admin,
        organizationId,
        familyIds,
        signupId,
        studentId,
      );
      if (!context) {
        if (studentId) {
          const familyForStudent = await resolveAuthorizedFamilyIdForStudent(
            admin,
            organizationId,
            familyIds,
            studentId,
          );
          if (!familyForStudent) {
            return apiError(ROUTE, {
              request,
              status: 403,
              error: "That student is not part of your family.",
              code: "invalid_student",
            });
          }
        }
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "Signup not found.",
          code: "not_found",
        });
      }

      const { familyId, signup } = context;

      const [responses, familyResponse, studentOptions] = await Promise.all([
        listClassroomSignupResponses(admin, organizationId, signupId),
        getFamilyClassroomSignupResponse(
          admin,
          organizationId,
          signupId,
          familyId,
        ),
        listFamilyChildrenForHome(supabase, organizationId, user.id),
      ]);

      return NextResponse.json({
        signup,
        responses: toParentVisibleSignupResponses(responses, familyId),
        familyResponse,
        studentOptions: studentOptions
          .filter((child) => child.studentId)
          .map((child) => ({
            id: child.studentId!,
            name: child.studentName,
          })),
      });
    } catch (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load signup.",
        cause: error,
        code: "load_failed",
      });
    }
  },
);

const SUBMIT_REJECTIONS: Record<
  ClassroomSignupSubmitFailureReason,
  { status: number; message: string }
> = {
  not_found: { status: 404, message: "Signup not found." },
  invalid_student: {
    status: 403,
    message: "That student is not part of your family.",
  },
  invalid_selection: {
    status: 400,
    message: "One or more selections are not available for this signup.",
  },
  slot_full: {
    status: 409,
    message: "That time slot just filled up. Please choose another.",
  },
  role_full: {
    status: 409,
    message: "That role was just filled. Please choose another.",
  },
  signup_full: { status: 409, message: "This signup is full." },
};

type ResponseBody = {
  organizationId?: string;
  studentId?: string;
  selectedSlotIds?: string[];
  selectedRoleIds?: string[];
  note?: string | null;
};

export const POST = withParentPortalRoute<ResponseBody, SignupParams>(
  {
    route: ROUTE,
    organizationFrom: "body",
    missingOrganizationMessage: "organizationId and studentId are required.",
    fallbackErrorMessage: "Failed to submit response.",
  },
  async ({ request, supabase, user, organizationId, access, body, params }) => {
    const { signupId } = params;
    const studentId = body.studentId?.trim() ?? "";
    if (!studentId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId and studentId are required.",
        code: "missing_fields",
      });
    }

    try {
      const familyIds = access.familyIds;
      if (familyIds.length === 0) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "Family not found.",
          code: "not_found",
        });
      }

      const admin = createAdminClient();

      const familyId = await resolveAuthorizedFamilyIdForStudent(
        admin,
        organizationId,
        familyIds,
        studentId,
      );
      if (!familyId) {
        return apiError(ROUTE, {
          request,
          status: 403,
          error: "That student is not part of your family.",
          code: "invalid_student",
        });
      }

      const signup = await getParentVisibleClassroomSignup(
        admin,
        organizationId,
        familyId,
        signupId,
      );
      if (!signup || signup.status !== "open") {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "Signup not found.",
          code: "not_found",
        });
      }

      const profile = await getFamilyUserProfile(
        supabase,
        user.id,
        organizationId,
        user,
      );
      let response;
      try {
        response = await upsertClassroomSignupResponse(admin, {
          organizationId,
          signupId,
          familyId,
          studentId,
          selectedSlotIds: body.selectedSlotIds ?? [],
          selectedRoleIds: body.selectedRoleIds ?? [],
          note: body.note ?? null,
        });
      } catch (submitError) {
        if (submitError instanceof ClassroomSignupSubmitError) {
          const rejection = SUBMIT_REJECTIONS[submitError.reason];
          return apiError(ROUTE, {
            request,
            status: rejection.status,
            error: rejection.message,
            code: submitError.reason,
          });
        }
        throw submitError;
      }

      fireClassroomSignupActivityNotification(
        admin,
        sendClassroomSignupResponseSubmittedNotification(admin, {
          organizationId,
          signupId: signup.id,
          signupTitle: signup.title,
          staffMemberId: signup.createdByStaffMemberId,
          familyName: response.familyName,
          studentName: response.studentName,
          actorUserId: user.id,
          actorName: profile.displayName,
          actorEmail: profile.email,
        }),
        {
          organizationId,
          signupId: signup.id,
          operation: "classroom_signup_response_submitted_notification",
          surface: "parent_portal",
          actorType: "parent",
          actorUserId: user.id,
          actorEmail: profile.email,
        },
      );

      return NextResponse.json({ response });
    } catch (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to submit response.",
        cause: error,
        code: "submit_failed",
      });
    }
  },
);

export const DELETE = withParentPortalRoute<undefined, SignupParams>(
  {
    route: ROUTE,
    // Withdrawing only touches the caller's own family response.
    enforceAccess: false,
    fallbackErrorMessage: "Failed to withdraw response.",
  },
  async ({ request, organizationId, access, params }) => {
    const { signupId } = params;

    try {
      const familyIds = access.familyIds;
      if (familyIds.length === 0) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "Family not found.",
          code: "not_found",
        });
      }

      const studentId =
        new URL(request.url).searchParams.get("studentId")?.trim() ?? "";
      const admin = createAdminClient();
      let familyId: string;

      if (familyIds.length === 1) {
        familyId = familyIds[0]!;
      } else if (!studentId) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "organizationId and studentId are required.",
          code: "missing_fields",
        });
      } else {
        const resolvedFamilyId = await resolveAuthorizedFamilyIdForStudent(
          admin,
          organizationId,
          familyIds,
          studentId,
        );
        if (!resolvedFamilyId) {
          return apiError(ROUTE, {
            request,
            status: 403,
            error: "That student is not part of your family.",
            code: "invalid_student",
          });
        }
        familyId = resolvedFamilyId;
      }
      const response = await withdrawClassroomSignupResponse(
        admin,
        organizationId,
        signupId,
        familyId,
      );

      return NextResponse.json({ response });
    } catch (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to withdraw response.",
        cause: error,
        code: "withdraw_failed",
      });
    }
  },
);
