import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadAdminFormsDocumentsPageData } from "@/lib/school-admin/forms-documents/load-forms-documents-page-data";
import { listOrgFormResponsesForForm } from "@/lib/school-admin/forms-documents/load-admin-forms";
import { parsePublishInputFromFormData } from "@/lib/school-admin/forms-documents/parse-publish-input";
import { publishAdminParentForm } from "@/lib/school-admin/forms-documents/mutations";
import { requireSchoolAdminUser, SchoolAdminAuthError } from "@/lib/school-admin/access";
import type { PublishTeacherParentFormInput } from "@/lib/school-teacher/forms-documents/types";
import {
  fireTeacherParentFormActivityNotification,
  sendTeacherParentFormPublishedNotifications,
} from "@/lib/school-teacher/forms-documents/teacher-parent-form-notifications";
import { ensureStaffMemberIdForSchoolAdminPublisher } from "@/lib/school-admin/forms-documents/ensure-admin-publisher-staff";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/forms-documents";

export async function GET(request: Request) {
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
    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const staffMemberId = await getStaffMemberIdForUser(
      supabase,
      user.id,
      organizationId,
    );

    const admin = createAdminClient();
    const pageData = await loadAdminFormsDocumentsPageData(admin, organizationId);

    return NextResponse.json({
      ...pageData,
      staffMemberId,
    });
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
      error: error instanceof Error ? error.message : "Failed to load forms.",
      code: "load_failed",
      cause: error,
    });
  }
}

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

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
      publishInput = {
        title: body.title ?? "",
        description: body.description ?? "",
        formType: body.formType ?? "builder",
        classroomIds: body.classroomIds ?? [],
        dueDate: body.dueDate ?? null,
        requireSignature: body.requireSignature ?? true,
        uploadFormat: body.uploadFormat ?? "pdf",
        uploadFileName: body.uploadFileName ?? null,
        uploadFileSize: body.uploadFileSize ?? null,
        fields: body.fields ?? [],
        status: body.status ?? "active",
      };
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
    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();
    const staffMemberId = await ensureStaffMemberIdForSchoolAdminPublisher(
      admin,
      user,
      organizationId,
    );
    const form = await publishAdminParentForm(
      admin,
      organizationId,
      staffMemberId,
      publishInput,
      uploadFile,
    );

    const publisherName =
      user.user_metadata?.full_name?.trim() ||
      user.user_metadata?.name?.trim() ||
      user.email?.split("@")[0] ||
      "School admin";

    if (form.status === "active") {
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
      error: error instanceof Error ? error.message : "Failed to publish form.",
      code: "publish_failed",
      cause: error,
    });
  }
}
