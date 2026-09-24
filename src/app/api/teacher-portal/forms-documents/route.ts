import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { loadTeacherFormsDocumentsPageData } from "@/lib/school-teacher/forms-documents/load-forms-documents-page-data";
import { listFormResponsesForForm } from "@/lib/school-teacher/forms-documents/load-teacher-forms";
import { publishTeacherParentForm } from "@/lib/school-teacher/forms-documents/mutations";
import {
  parsePublishInputFromFormData,
  parsePublishInputFromJson,
} from "@/lib/school-teacher/forms-documents/parse-publish-input";
import type { PublishTeacherParentFormInput } from "@/lib/school-teacher/forms-documents/types";
import {
  fireTeacherParentFormActivityNotification,
  sendTeacherParentFormPublishedNotifications,
} from "@/lib/school-teacher/forms-documents/teacher-parent-form-notifications";
import {
  getStaffMemberIdForUser,
  getStaffUserProfile,
  TeacherPortalAuthError,
} from "@/lib/staff/teacher-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  createClientFromRequest,
  getUserFromRequest,
  signedInErrorForRequest,
} from "@/lib/supabase/request-client";

const ROUTE = "/api/teacher-portal/forms-documents";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const {
    data: { user },
    error: authError,
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: await signedInErrorForRequest(request, authError),
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
        error: "You do not have permission to view forms.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const pageData = await loadTeacherFormsDocumentsPageData(
      admin,
      organizationId,
      staffMemberId,
    );

    return NextResponse.json({
      ...pageData,
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
      error: "Failed to load forms.",
      cause: error,
      code: "load_failed",
    });
  }
}

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);
  const {
    data: { user },
    error: authError,
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: await signedInErrorForRequest(request, authError),
      code: "unauthorized",
    });
  }

  let organizationId = "";
  let publishInput: PublishTeacherParentFormInput;
  let uploadFile: File | null = null;

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      organizationId = String(formData.get("organizationId") ?? "").trim();
      const parsed = parsePublishInputFromFormData(formData);
      publishInput = parsed.input;
      uploadFile = parsed.file;
    } else {
      const body = (await request.json()) as Partial<PublishTeacherParentFormInput> & {
        organizationId?: string;
      };
      organizationId = body.organizationId?.trim() ?? "";
      publishInput = parsePublishInputFromJson(body);
    }
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

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
        error: "You do not have permission to create forms.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const profile = await getStaffUserProfile(
      supabase,
      user.id,
      organizationId,
      user,
    );
    const form = await publishTeacherParentForm(
      admin,
      organizationId,
      staffMemberId,
      publishInput,
      uploadFile,
    );

    if (form.status === "active") {
      fireTeacherParentFormActivityNotification(
        admin,
        sendTeacherParentFormPublishedNotifications(admin, {
          organizationId,
          form,
          publisherName: profile.displayName,
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
    const resolved = portalRouteErrorStatus(error, "Failed to publish form.");
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.code,
      cause: error,
    });
  }
}
