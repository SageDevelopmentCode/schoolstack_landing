import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  fireClassroomSignupActivityNotification,
  sendClassroomSignupClosedNotification,
} from "@/lib/classroom-signups/classroom-signup-notifications";
import {
  getTeacherClassroomSignupById,
  listClassroomSignupResponses,
} from "@/lib/classroom-signups/load-teacher-signups";
import {
  closeClassroomSignup,
  updateClassroomSignup,
  type UpdateClassroomSignupInput,
} from "@/lib/classroom-signups/mutations";
import {
  getStaffMemberIdForUser,
  getStaffUserProfile,
} from "@/lib/staff/teacher-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/teacher-portal/classroom-signups/[signupId]";

type RouteContext = {
  params: Promise<{ signupId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { signupId } = await context.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
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

  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";
  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const staffMemberId = await getStaffMemberIdForUser(
      supabase,
      user.id,
      organizationId,
    );
    if (!staffMemberId) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have permission to view this signup.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const signup = await getTeacherClassroomSignupById(
      admin,
      organizationId,
      staffMemberId,
      signupId,
    );
    if (!signup) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Signup not found.",
        code: "not_found",
      });
    }

    const responses = await listClassroomSignupResponses(
      admin,
      organizationId,
      signupId,
    );

    return NextResponse.json({ signup, responses });
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: error instanceof Error ? error.message : "Failed to load signup.",
      code: "load_failed",
      cause: error,
    });
  }
}

type PatchBody = {
  organizationId?: string;
  status?: "closed";
  update?: UpdateClassroomSignupInput;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { signupId } = await context.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
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

  let body: PatchBody;
  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  if (body.status !== "closed" && !body.update) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Provide status=closed or an update payload.",
      code: "missing_fields",
    });
  }

  try {
    const staffMemberId = await getStaffMemberIdForUser(
      supabase,
      user.id,
      organizationId,
    );
    if (!staffMemberId) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have permission to update this signup.",
        code: "forbidden",
      });
    }

    const profile = await getStaffUserProfile(supabase, user.id, organizationId, user);
    const admin = createAdminClient();

    if (body.status === "closed") {
      const signup = await closeClassroomSignup(
        admin,
        organizationId,
        staffMemberId,
        signupId,
      );

      fireClassroomSignupActivityNotification(
        admin,
        sendClassroomSignupClosedNotification(admin, {
          organizationId,
          signupId: signup.id,
          signupTitle: signup.title,
          teacherName: profile.displayName,
          staffMemberId,
          actorUserId: user.id,
          actorName: profile.displayName,
          actorEmail: profile.email,
        }),
        {
          organizationId,
          signupId: signup.id,
          operation: "classroom_signup_closed_notification",
          surface: "teacher_portal",
          actorType: "teacher",
          actorUserId: user.id,
          actorEmail: profile.email,
        },
      );

      return NextResponse.json({ signup });
    }

    const existing = await getTeacherClassroomSignupById(
      admin,
      organizationId,
      staffMemberId,
      signupId,
    );
    if (!existing) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Signup not found.",
        code: "not_found",
      });
    }

    if (existing.status === "closed") {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Closed signups cannot be edited.",
        code: "invalid_status",
      });
    }

    const responses = await listClassroomSignupResponses(
      admin,
      organizationId,
      signupId,
    );
    const confirmedCount = responses.filter(
      (response) => response.status === "confirmed",
    ).length;
    const safeFieldsOnly =
      existing.status === "open" && confirmedCount > 0;

    const signup = await updateClassroomSignup(
      admin,
      organizationId,
      staffMemberId,
      signupId,
      body.update ?? {},
      { safeFieldsOnly },
    );

    return NextResponse.json({ signup });
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: error instanceof Error ? error.message : "Failed to update signup.",
      code: "update_failed",
      cause: error,
    });
  }
}
