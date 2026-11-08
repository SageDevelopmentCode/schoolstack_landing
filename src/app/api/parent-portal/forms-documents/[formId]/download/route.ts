import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { isUuid } from "@/lib/school-events/event-payload";
import { assertParentFormAccess } from "@/lib/school-parent/forms-documents/load-parent-forms";
import { getParentFormUploadStoragePath } from "@/lib/school-parent/forms-documents/mutations";
import { createTeacherFormSignedUrl } from "@/lib/school-teacher/forms-documents/teacher-form-file-storage";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/forms-documents/[formId]/download";

export const GET = withParentPortalRoute<undefined, { formId: string }>(
  {
    route: ROUTE,
    feature: "forms_documents",
    fallbackErrorMessage: "Failed to create download link.",
  },
  async ({ request, organizationId, familyId, params }) => {
    const { formId } = params;

    if (!isUuid(formId)) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Form not found.",
        code: "not_found",
      });
    }

    try {
      if (!familyId) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "Form not found.",
          code: "not_found",
        });
      }

      const admin = createAdminClient();
      await assertParentFormAccess(admin, organizationId, familyId, formId);

      const { storagePath, fileName } = await getParentFormUploadStoragePath(
        admin,
        organizationId,
        formId,
      );
      const signedUrl = await createTeacherFormSignedUrl(admin, storagePath);

      return NextResponse.json({ signedUrl, fileName });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create download link.";
      const status = message === "Form not found." ? 404 : 500;
      return apiError(ROUTE, {
        request,
        status,
        error: message,
        code: status === 404 ? "not_found" : "download_failed",
        cause: err,
      });
    }
  },
);
