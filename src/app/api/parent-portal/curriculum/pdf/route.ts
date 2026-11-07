import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  getProgramCoopCurriculumById,
  PROGRAM_COOP_CURRICULUM_BUCKET,
} from "@/lib/admissions/program-coop-curriculum-storage";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";

const ROUTE = "/api/parent-portal/curriculum/pdf";

function contentDispositionInline(fileName: string): string {
  const safe = fileName.replace(/["\r\n]/g, "_");
  return `inline; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    programScope: "required",
    forbiddenMessage: "You do not have access to this curriculum.",
    missingProgramMessage: "organizationId, programId, and curriculumId are required.",
    missingOrganizationMessage: "organizationId, programId, and curriculumId are required.",
    fallbackErrorMessage: "Failed to load curriculum PDF.",
  },
  async ({ request, supabase, organizationId, programId }) => {
    const curriculumId = new URL(request.url).searchParams.get("curriculumId")?.trim() ?? "";
    if (!curriculumId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId, programId, and curriculumId are required.",
        code: "missing_fields",
      });
    }

    try {
      const curriculum = await getProgramCoopCurriculumById(supabase, curriculumId);

      if (
        !curriculum ||
        curriculum.organizationId !== organizationId ||
        curriculum.programId !== programId
      ) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "Curriculum not found.",
          code: "not_found",
        });
      }

      const { data: fileBlob, error: downloadError } = await supabase.storage
        .from(PROGRAM_COOP_CURRICULUM_BUCKET)
        .download(curriculum.storagePath);

      if (downloadError || !fileBlob) {
        return apiError(ROUTE, {
          request,
          status: 403,
          error: "You do not have access to this curriculum.",
          code: "forbidden",
          cause: downloadError,
        });
      }

      const bytes = await fileBlob.arrayBuffer();

      return new NextResponse(bytes, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": contentDispositionInline(curriculum.fileName),
          "Cache-Control": "private, no-store",
        },
      });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load curriculum PDF.",
        cause: err,
        code: "internal_error",
      });
    }
  },
);
