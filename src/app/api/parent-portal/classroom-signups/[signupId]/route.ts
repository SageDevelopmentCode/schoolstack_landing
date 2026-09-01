import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import {
  getFamilyUserProfile,
  listFamilyChildrenForHome,
  userHasEnrolledAccess,
} from "@/lib/admissions/parent-portal-access";
import { sendClassroomSignupResponseSubmittedNotification } from "@/lib/classroom-signups/classroom-signup-notifications";
import {
  getFamilyClassroomSignupResponse,
  listClassroomSignupResponses,
} from "@/lib/classroom-signups/load-teacher-signups";
import { getParentVisibleClassroomSignup } from "@/lib/classroom-signups/load-parent-signups";
import {
  upsertClassroomSignupResponse,
  withdrawClassroomSignupResponse,
} from "@/lib/classroom-signups/mutations";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/parent-portal/classroom-signups/[signupId]";

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
    const hasAccess = await userHasEnrolledAccess(supabase, user.id, organizationId);
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to the parent portal.",
        code: "forbidden",
      });
    }

    const familyIds = await getFamilyIdsForUser(supabase, user.id, organizationId);
    const familyId = familyIds[0];
    if (!familyId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Family not found.",
        code: "not_found",
      });
    }

    const admin = createAdminClient();
    const signup = await getParentVisibleClassroomSignup(
      admin,
      organizationId,
      familyId,
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

    const [responses, familyResponse, studentOptions] = await Promise.all([
      listClassroomSignupResponses(admin, organizationId, signupId),
      getFamilyClassroomSignupResponse(admin, organizationId, signupId, familyId),
      listFamilyChildrenForHome(supabase, organizationId, user.id),
    ]);

    return NextResponse.json({
      signup,
      responses,
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
      error: error instanceof Error ? error.message : "Failed to load signup.",
      code: "load_failed",
      cause: error,
    });
  }
}

type ResponseBody = {
  organizationId?: string;
  studentId?: string;
  selectedSlotIds?: string[];
  selectedRoleIds?: string[];
  note?: string | null;
};

export async function POST(request: Request, context: RouteContext) {
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

  let body: ResponseBody;
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
  const studentId = body.studentId?.trim() ?? "";
  if (!organizationId || !studentId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and studentId are required.",
      code: "missing_fields",
    });
  }

  try {
    const hasAccess = await userHasEnrolledAccess(supabase, user.id, organizationId);
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to the parent portal.",
        code: "forbidden",
      });
    }

    const familyIds = await getFamilyIdsForUser(supabase, user.id, organizationId);
    const familyId = familyIds[0];
    if (!familyId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Family not found.",
        code: "not_found",
      });
    }

    const admin = createAdminClient();
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

    const profile = await getFamilyUserProfile(supabase, user.id, organizationId, user);
    const response = await upsertClassroomSignupResponse(admin, {
      organizationId,
      signupId,
      familyId,
      studentId,
      selectedSlotIds: body.selectedSlotIds ?? [],
      selectedRoleIds: body.selectedRoleIds ?? [],
      note: body.note ?? null,
    });

    void sendClassroomSignupResponseSubmittedNotification(admin, {
      organizationId,
      signupId: signup.id,
      signupTitle: signup.title,
      staffMemberId: signup.createdByStaffMemberId,
      familyName: response.familyName,
      studentName: response.studentName,
      actorUserId: user.id,
      actorName: profile.displayName,
      actorEmail: profile.email,
    });

    return NextResponse.json({ response });
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: error instanceof Error ? error.message : "Failed to submit response.",
      code: "submit_failed",
      cause: error,
    });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
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
    const familyIds = await getFamilyIdsForUser(supabase, user.id, organizationId);
    const familyId = familyIds[0];
    if (!familyId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Family not found.",
        code: "not_found",
      });
    }

    const admin = createAdminClient();
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
      error: error instanceof Error ? error.message : "Failed to withdraw response.",
      code: "withdraw_failed",
      cause: error,
    });
  }
}
