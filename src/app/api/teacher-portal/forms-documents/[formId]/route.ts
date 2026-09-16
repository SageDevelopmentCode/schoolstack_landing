import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  getTeacherParentFormById,
  listFormResponsesForForm,
} from "@/lib/school-teacher/forms-documents/load-teacher-forms";
import {
  archiveTeacherParentForm,
  duplicateTeacherParentForm,
  updateTeacherParentForm,
  type UpdateTeacherParentFormInput,
} from "@/lib/school-teacher/forms-documents/mutations";
import {
  fireTeacherParentFormActivityNotification,
  sendTeacherParentFormPublishedNotifications,
} from "@/lib/school-teacher/forms-documents/teacher-parent-form-notifications";
import {
  getStaffMemberIdForUser,
  getStaffUserProfile,
} from "@/lib/staff/teacher-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/teacher-portal/forms-documents/[formId]";

type RouteContext = {
  params: Promise<{ formId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { formId } = await context.params;
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
        error: "You do not have permission to view this form.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const form = await getTeacherParentFormById(
      admin,
      organizationId,
      staffMemberId,
      formId,
    );
    if (!form) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Form not found.",
        code: "not_found",
      });
    }

    const signatureRows = await listFormResponsesForForm(
      admin,
      organizationId,
      formId,
      form.dueDate,
    );

    return NextResponse.json({ form, signatureRows });
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: error instanceof Error ? error.message : "Failed to load form.",
      code: "load_failed",
      cause: error,
    });
  }
}

type PatchBody = {
  organizationId?: string;
  action?: "archive" | "duplicate";
  update?: UpdateTeacherParentFormInput;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { formId } = await context.params;
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

  if (!body.action && !body.update) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Provide action or an update payload.",
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
        error: "You do not have permission to update this form.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();

    if (body.action === "archive") {
      const form = await archiveTeacherParentForm(
        admin,
        organizationId,
        staffMemberId,
        formId,
      );
      return NextResponse.json({ form });
    }

    if (body.action === "duplicate") {
      const form = await duplicateTeacherParentForm(
        admin,
        organizationId,
        staffMemberId,
        formId,
      );
      return NextResponse.json({ form });
    }

    const existingForm = await getTeacherParentFormById(
      admin,
      organizationId,
      staffMemberId,
      formId,
    );
    const form = await updateTeacherParentForm(
      admin,
      organizationId,
      staffMemberId,
      formId,
      body.update ?? {},
    );

    const wasPublishing =
      existingForm?.status === "draft" && form.status === "active";
    if (wasPublishing) {
      const profile = await getStaffUserProfile(
        supabase,
        user.id,
        organizationId,
        user,
      );
      fireTeacherParentFormActivityNotification(
        admin,
        sendTeacherParentFormPublishedNotifications(admin, {
          organizationId,
          form,
          teacherName: profile.displayName,
          staffMemberId,
          actorUserId: user.id,
          actorName: profile.displayName,
          actorEmail: profile.email,
        }),
        {
          organizationId,
          formId: form.id,
          operation: "teacher_parent_form_published_notification",
          surface: "teacher_portal",
          actorType: "teacher",
          actorUserId: user.id,
          actorEmail: profile.email,
        },
      );
    }

    const signatureRows =
      form.status === "active"
        ? await listFormResponsesForForm(admin, organizationId, form.id, form.dueDate)
        : [];

    return NextResponse.json({ form, signatureRows });
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: error instanceof Error ? error.message : "Failed to update form.",
      code: "update_failed",
      cause: error,
    });
  }
}
