import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { loadTeacherFormsDocumentsPageData } from "@/lib/school-teacher/forms-documents/load-forms-documents-page-data";
import { listFormResponsesForForm } from "@/lib/school-teacher/forms-documents/load-teacher-forms";
import { publishTeacherParentForm } from "@/lib/school-teacher/forms-documents/mutations";
import type {
  PublishTeacherParentFormInput,
  TeacherFormField,
  TeacherParentFormStatus,
} from "@/lib/school-teacher/forms-documents/types";
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
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/teacher-portal/forms-documents";

function parseStatus(value: string | null | undefined): TeacherParentFormStatus {
  if (value === "draft" || value === "active" || value === "archived") {
    return value;
  }
  return "active";
}

function parseFields(raw: string | null | undefined): TeacherFormField[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as TeacherFormField[]) : [];
  } catch {
    return [];
  }
}

function parseClassroomIds(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String).filter(Boolean);
  } catch {
    return raw.split(",").map((id) => id.trim()).filter(Boolean);
  }
}

function parsePublishInputFromFormData(
  formData: FormData,
): { input: PublishTeacherParentFormInput; file: File | null } {
  const formType = String(formData.get("formType") ?? "upload");
  const file = formData.get("file");

  return {
    input: {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      formType: formType === "builder" ? "builder" : "upload",
      classroomIds: parseClassroomIds(String(formData.get("classroomIds") ?? "")),
      dueDate: String(formData.get("dueDate") ?? "").trim() || null,
      requireSignature: String(formData.get("requireSignature") ?? "true") !== "false",
      uploadFormat:
        String(formData.get("uploadFormat") ?? "pdf") === "docx" ? "docx" : "pdf",
      uploadFileName: file instanceof File ? file.name : null,
      uploadFileSize: file instanceof File ? String(file.size) : null,
      fields: parseFields(String(formData.get("fields") ?? "")),
      status: parseStatus(String(formData.get("status") ?? "active")),
    },
    file: file instanceof File && file.size > 0 ? file : null,
  };
}

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
      error: error instanceof Error ? error.message : "Failed to load forms.",
      code: "load_failed",
      cause: error,
    });
  }
}

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
