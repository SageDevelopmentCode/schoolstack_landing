import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import {
  getFamilyUserProfile,
  userHasEnrolledAccess,
} from "@/lib/admissions/parent-portal-access";
import {
  fireTeacherParentFormActivityNotification,
  sendTeacherParentFormResponseSignedNotification,
} from "@/lib/school-teacher/forms-documents/teacher-parent-form-notifications";
import { getParentFormDetail } from "@/lib/school-parent/forms-documents/load-parent-forms";
import { submitParentFormResponse } from "@/lib/school-parent/forms-documents/mutations";
import type { SubmitParentFormInput } from "@/lib/school-parent/forms-documents/types";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/forms-documents/[formId]";

type RouteContext = {
  params: Promise<{ formId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { formId } = await context.params;
  const supabase = await createClientFromRequest(request);
  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

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
        error: "Form not found.",
        code: "not_found",
      });
    }

    const admin = createAdminClient();
    const detail = await getParentFormDetail(admin, organizationId, familyId, formId);
    if (!detail) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Form not found.",
        code: "not_found",
      });
    }

    return NextResponse.json(detail);
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load form.",
      cause: err,
      code: "load_failed",
    });
  }
}

type PatchBody = SubmitParentFormInput & {
  organizationId?: string;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { formId } = await context.params;
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
        error: "Form not found.",
        code: "not_found",
      });
    }

    const admin = createAdminClient();
    const profile = await getFamilyUserProfile(
      supabase,
      user.id,
      organizationId,
      user,
    );
    const detail = await submitParentFormResponse(
      admin,
      organizationId,
      familyId,
      formId,
      body,
    );

    const { data: formRow, error: formMetaError } = await admin
      .from("teacher_parent_forms")
      .select("title, created_by_staff_member_id")
      .eq("organization_id", organizationId)
      .eq("id", formId)
      .maybeSingle();

    if (formMetaError) throw formMetaError;

    const { data: familyRow, error: familyError } = await admin
      .from("families")
      .select("name")
      .eq("id", familyId)
      .maybeSingle();

    if (familyError) throw familyError;

    if (formRow?.created_by_staff_member_id) {
      fireTeacherParentFormActivityNotification(
        admin,
        sendTeacherParentFormResponseSignedNotification(admin, {
          organizationId,
          formId,
          formTitle: String(formRow.title ?? detail.form.title),
          staffMemberId: String(formRow.created_by_staff_member_id),
          familyId,
          familyName: String(familyRow?.name ?? profile.displayName),
          actorUserId: user.id,
          actorName: profile.displayName,
          actorEmail: profile.email,
        }),
        {
          organizationId,
          formId,
          operation: "teacher_parent_form_response_signed_notification",
          surface: "parent_portal",
          actorType: "parent",
          actorUserId: user.id,
          actorEmail: profile.email,
        },
      );
    }

    return NextResponse.json(detail);
  } catch (err) {
    const resolved = portalRouteErrorStatus(err, "Failed to submit form.");
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.code,
      cause: err,
    });
  }
}
