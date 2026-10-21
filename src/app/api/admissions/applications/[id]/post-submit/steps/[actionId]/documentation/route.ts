import { NextResponse } from "next/server";
import {
  AdmissionsBookingError,
  updatePostSubmitStepAdminCompletionNotes,
} from "@/lib/admissions/admissions-booking";
import { AuthError } from "@/lib/admissions/application-auth";
import { requireAuthenticatedUser } from "@/lib/admissions/application-auth-server";
import {
  PostSubmitCompleteRequestError,
  validatePostSubmitCompleteAttachments,
} from "@/lib/admissions/post-submit-complete-request";
import {
  listPostSubmitStepCompletionFilesForApplication,
  normalizePostSubmitStepCompletionNotes,
  uploadPostSubmitStepCompletionFile,
} from "@/lib/admissions/post-submit-step-documentation";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE =
  "/api/admissions/applications/[id]/post-submit/steps/[actionId]/documentation";

type RouteContext = {
  params: Promise<{ id: string; actionId: string }>;
};

async function loadApplicationOrganizationId(
  admin: ReturnType<typeof createAdminClient>,
  applicationId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("applications")
    .select("organization_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) throw error;
  return data?.organization_id ? String(data.organization_id) : null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { id: applicationId, actionId: rawActionId } = await context.params;
  const actionId = rawActionId.trim();

  if (!actionId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "actionId is required.",
      code: "invalid_request",
    });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let notes: string | null | undefined;
  let attachmentFiles: File[] = [];

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      if (formData.has("notes")) {
        const notesValue = formData.get("notes");
        notes =
          notesValue === null
            ? null
            : normalizePostSubmitStepCompletionNotes(String(notesValue));
      }
      attachmentFiles = formData
        .getAll("attachments")
        .filter((entry): entry is File => entry instanceof File && entry.size > 0);
    } else {
      const body = (await request.json()) as { notes?: string | null };
      if (body.notes !== undefined) {
        notes =
          body.notes === null
            ? null
            : normalizePostSubmitStepCompletionNotes(body.notes);
      }
    }
    validatePostSubmitCompleteAttachments(attachmentFiles);
  } catch (error) {
    if (error instanceof PostSubmitCompleteRequestError) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: error.message,
        code: error.code,
      });
    }
    if (error instanceof Error && error.message.includes("Notes cannot exceed")) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: error.message,
        code: "notes_too_long",
      });
    }
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_request",
    });
  }

  try {
    const user = await requireAuthenticatedUser(supabase, request);
    const admin = createAdminClient();
    const organizationId = await loadApplicationOrganizationId(admin, applicationId);

    if (!organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Application not found.",
        code: "not_found",
      });
    }

    await requireSchoolAdminUser(supabase, organizationId, request);

    if (notes !== undefined) {
      await updatePostSubmitStepAdminCompletionNotes(admin, {
        organizationId,
        applicationId,
        actionId,
        adminCompletionNotes: notes,
      });
    }

    const uploadCtx = { organizationId, applicationId, actionId };
    for (const file of attachmentFiles) {
      await uploadPostSubmitStepCompletionFile(admin, uploadCtx, file, user.id);
    }

    const filesByActionId = await listPostSubmitStepCompletionFilesForApplication(
      admin,
      applicationId,
      [actionId],
    );
    const files = filesByActionId.get(actionId) ?? [];

    const { data: visitRow, error: visitError } = await admin
      .from("admissions_scheduled_visits")
      .select("admin_completion_notes")
      .eq("application_id", applicationId)
      .eq("post_submit_action_id", actionId)
      .eq("status", "scheduled")
      .maybeSingle();

    if (visitError) throw visitError;

    return NextResponse.json({
      notes: visitRow?.admin_completion_notes
        ? String(visitRow.admin_completion_notes)
        : null,
      files,
    });
  } catch (error) {
    if (error instanceof AuthError || error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }

    if (error instanceof AdmissionsBookingError) {
      const status = error.code === "not_found" ? 404 : 400;
      return apiError(ROUTE, {
        request,
        status,
        error: error.message,
        code: error.code,
      });
    }

    if (error instanceof Error) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: error.message,
        code: "invalid_request",
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to update post-application step documentation.",
      cause: error,
    });
  }
}
