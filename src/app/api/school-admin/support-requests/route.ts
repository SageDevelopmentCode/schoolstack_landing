import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { notifyAdminSupportRequest } from "@/lib/discord";
import { sendAdminSupportRequestConfirmation } from "@/lib/emails";
import {
  MAX_SUPPORT_REQUEST_FILE_BYTES,
  MAX_SUPPORT_REQUEST_FILES,
  deleteSupportRequestFiles,
  uploadSupportRequestFile,
  type SupportRequestAttachmentMeta,
} from "@/lib/school-admin/support-request-storage";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/support-requests";
const MAX_DESCRIPTION_LENGTH = 5000;

const ALLOWED_TOPICS = new Set([
  "general",
  "bug",
  "application-forms",
  "enrollment",
  "billing",
  "feature",
  "other",
]);

const ALLOWED_MIME_PREFIXES = ["image/"];
const ALLOWED_MIME_TYPES = new Set(["application/pdf"]);

function isAllowedAttachment(file: File): boolean {
  if (!file.type) return false;
  if (ALLOWED_MIME_TYPES.has(file.type)) return true;
  return ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix));
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid form data.",
      code: "invalid_body",
    });
  }

  const organizationId = String(formData.get("organizationId") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sourcePagePath =
    String(formData.get("sourcePagePath") ?? "").trim() || null;
  const attachmentFiles = formData
    .getAll("attachments")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!organizationId || !topic || !description) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, topic, and description are required.",
      code: "missing_fields",
    });
  }

  if (!ALLOWED_TOPICS.has(topic)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid topic.",
      code: "invalid_topic",
    });
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Description is too long.",
      code: "description_too_long",
    });
  }

  if (attachmentFiles.length > MAX_SUPPORT_REQUEST_FILES) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: `You can attach up to ${MAX_SUPPORT_REQUEST_FILES} files.`,
      code: "too_many_files",
    });
  }

  for (const file of attachmentFiles) {
    if (file.size > MAX_SUPPORT_REQUEST_FILE_BYTES) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: `${file.name} exceeds 10 MB.`,
        code: "file_too_large",
      });
    }

    if (!isAllowedAttachment(file)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: `${file.name} has an unsupported file type.`,
        code: "invalid_file_type",
      });
    }
  }

  try {
    const user = await requireSchoolAdminUser(supabase, organizationId);

    const submitterEmail = user.email?.trim();
    if (!submitterEmail) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Your account must have an email address to submit a support request.",
        code: "missing_email",
      });
    }

    const { data: organization, error: organizationError } = await supabase
      .from("organizations")
      .select("id, name, slug")
      .eq("id", organizationId)
      .maybeSingle();

    if (organizationError) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: organizationError.message,
        cause: organizationError,
      });
    }

    if (!organization) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Organization not found.",
        code: "organization_not_found",
      });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("admin_support_requests")
      .insert({
        organization_id: organization.id,
        organization_slug: organization.slug,
        organization_name: organization.name,
        submitted_by_user_id: user.id,
        submitter_email: submitterEmail,
        topic,
        description,
        source_page_path: sourcePagePath,
        attachments: [],
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: insertError?.message ?? "Failed to create support request.",
        cause: insertError,
      });
    }

    const requestId = String(inserted.id);
    const admin = createAdminClient();
    const uploadedAttachments: SupportRequestAttachmentMeta[] = [];
    const uploadedPaths: string[] = [];

    try {
      for (const file of attachmentFiles) {
        const meta = await uploadSupportRequestFile(
          admin,
          { organizationId, requestId },
          file,
        );
        uploadedAttachments.push(meta);
        uploadedPaths.push(meta.storagePath);
      }

      if (uploadedAttachments.length > 0) {
        const { error: updateError } = await admin
          .from("admin_support_requests")
          .update({ attachments: uploadedAttachments })
          .eq("id", requestId);

        if (updateError) {
          throw updateError;
        }
      }
    } catch (uploadError) {
      await deleteSupportRequestFiles(admin, uploadedPaths).catch((cleanupError) => {
        console.error("Support request attachment cleanup failed:", cleanupError);
      });

      await admin.from("admin_support_requests").delete().eq("id", requestId);

      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to upload attachments.",
        code: "upload_failed",
        cause: uploadError,
      });
    }

    try {
      await notifyAdminSupportRequest({
        requestId,
        organizationId: organization.id,
        organizationSlug: organization.slug,
        organizationName: organization.name,
        submitterEmail,
        topic,
        description,
        sourcePagePath,
        attachments: uploadedAttachments,
      });
    } catch (err) {
      console.error("Discord notification error:", err);
    }

    try {
      await sendAdminSupportRequestConfirmation({
        submitterEmail,
        schoolName: organization.name,
        topic,
      });
    } catch (err) {
      console.error("Confirmation email error:", err);
    }

    return NextResponse.json({ ok: true, requestId });
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to submit support request.",
      code: "internal_error",
      cause: err,
    });
  }
}
