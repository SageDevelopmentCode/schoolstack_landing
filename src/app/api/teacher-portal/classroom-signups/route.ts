import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { sendClassroomSignupPublishedNotification } from "@/lib/classroom-signups/classroom-signup-notifications";
import { countAssignedFamiliesForTeacher } from "@/lib/classroom-signups/audience";
import { loadTeacherClassroomOptions } from "@/lib/classroom-signups/load-teacher-classrooms";
import { listTeacherClassroomSignups } from "@/lib/classroom-signups/load-teacher-signups";
import { publishClassroomSignup } from "@/lib/classroom-signups/mutations";
import type { ClassroomSignupDraft } from "@/lib/classroom-signups/types";
import {
  getStaffMemberIdForUser,
  getStaffUserProfile,
  TeacherPortalAuthError,
} from "@/lib/staff/teacher-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/teacher-portal/classroom-signups";

export async function GET(request: Request) {
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
        error: "You do not have permission to view classroom signups.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const [signups, classroomOptions, assignedFamilyCount] = await Promise.all([
      listTeacherClassroomSignups(admin, organizationId, staffMemberId),
      loadTeacherClassroomOptions(admin, organizationId, staffMemberId),
      countAssignedFamiliesForTeacher(admin, organizationId, staffMemberId),
    ]);

    return NextResponse.json({
      signups,
      classroomOptions,
      assignedFamilyCount,
      staffMemberId,
    });
  } catch (error) {
    if (error instanceof TeacherPortalAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }
    return apiError(ROUTE, {
      request,
      status: 500,
      error: error instanceof Error ? error.message : "Failed to load signups.",
      code: "load_failed",
      cause: error,
    });
  }
}

type PublishBody = Partial<ClassroomSignupDraft> & {
  organizationId?: string;
  status?: "open" | "draft";
};

export async function POST(request: Request) {
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

  let body: PublishBody;
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
  if (!organizationId || !body.title?.trim()) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and title are required.",
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
        error: "You do not have permission to create classroom signups.",
        code: "forbidden",
      });
    }

    const profile = await getStaffUserProfile(supabase, user.id, organizationId, user);
    const admin = createAdminClient();
    const status = body.status ?? "open";

    const signup = await publishClassroomSignup(admin, organizationId, staffMemberId, {
      title: body.title,
      description: body.description ?? "",
      signupType: body.signupType ?? "time_slots",
      audience: body.audience ?? "assigned",
      classroomId: body.classroomId ?? null,
      classroomName: body.classroomName ?? null,
      responseDeadline: body.responseDeadline ?? null,
      config: body.config ?? {},
      status,
    });

    if (status === "open") {
      void sendClassroomSignupPublishedNotification(admin, {
        organizationId,
        signupId: signup.id,
        signupTitle: signup.title,
        teacherName: profile.displayName,
        staffMemberId,
        actorUserId: user.id,
        actorName: profile.displayName,
        actorEmail: profile.email,
      });
    }

    return NextResponse.json({ signup });
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: error instanceof Error ? error.message : "Failed to publish signup.",
      code: "publish_failed",
      cause: error,
    });
  }
}
