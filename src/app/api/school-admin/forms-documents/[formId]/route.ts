import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  getOrgParentFormById,
  listOrgFormResponsesForForm,
} from "@/lib/school-admin/forms-documents/load-admin-forms";
import {
  archiveAdminParentForm,
  duplicateAdminParentForm,
  updateAdminParentForm,
  type UpdateAdminParentFormInput,
} from "@/lib/school-admin/forms-documents/mutations";
import { requireSchoolAdminUser, SchoolAdminAuthError } from "@/lib/school-admin/access";
import {
  fireTeacherParentFormActivityNotification,
  sendTeacherParentFormPublishedNotifications,
} from "@/lib/school-teacher/forms-documents/teacher-parent-form-notifications";
import { ensureStaffMemberIdForSchoolAdminPublisher } from "@/lib/school-admin/forms-documents/ensure-admin-publisher-staff";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/forms-documents/[formId]";

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

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();
    const form = await getOrgParentFormById(admin, organizationId, formId);
    if (!form) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Form not found.",
        code: "not_found",
      });
    }

    const signatureRows = await listOrgFormResponsesForForm(
      admin,
      organizationId,
      formId,
      form.dueDate,
    );

    return NextResponse.json({ form, signatureRows });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }
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
  update?: UpdateAdminParentFormInput;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { formId } = await context.params;
  const supabase = await createClientFromRequest(request);

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
    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();

    if (body.action === "archive") {
      const form = await archiveAdminParentForm(admin, organizationId, formId);
      return NextResponse.json({ form });
    }

    if (body.action === "duplicate") {
      const staffMemberId = await ensureStaffMemberIdForSchoolAdminPublisher(
        admin,
        user,
        organizationId,
      );
      const form = await duplicateAdminParentForm(
        admin,
        organizationId,
        staffMemberId,
        formId,
      );
      return NextResponse.json({ form });
    }

    const existingForm = await getOrgParentFormById(admin, organizationId, formId);
    const form = await updateAdminParentForm(
      admin,
      organizationId,
      formId,
      body.update ?? {},
    );

    const wasPublishing =
      existingForm?.status === "draft" && form.status === "active";
    if (wasPublishing) {
      const staffMemberId = await ensureStaffMemberIdForSchoolAdminPublisher(
        admin,
        user,
        organizationId,
      );
      const publisherName =
        user.user_metadata?.full_name?.trim() ||
        user.user_metadata?.name?.trim() ||
        user.email?.split("@")[0] ||
        "School admin";

      fireTeacherParentFormActivityNotification(
        admin,
        sendTeacherParentFormPublishedNotifications(admin, {
          organizationId,
          form,
          publisherName,
          staffMemberId,
          actorUserId: user.id,
          actorName: publisherName,
          actorEmail: user.email ?? "",
          actorType: "school_admin",
          surface: "school_admin",
        }),
        {
          organizationId,
          formId: form.id,
          operation: "admin_parent_form_published_notification",
          surface: "school_admin",
          actorType: "school_admin",
          actorUserId: user.id,
          actorEmail: user.email ?? "",
        },
      );
    }

    const signatureRows =
      form.status === "active"
        ? await listOrgFormResponsesForForm(admin, organizationId, form.id, form.dueDate)
        : [];

    return NextResponse.json({ form, signatureRows });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }
    return apiError(ROUTE, {
      request,
      status: 500,
      error: error instanceof Error ? error.message : "Failed to update form.",
      code: "update_failed",
      cause: error,
    });
  }
}
