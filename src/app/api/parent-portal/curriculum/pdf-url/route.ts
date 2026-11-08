import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  createProgramCoopCurriculumSignedUrl,
  getProgramCoopCurriculumById,
  PROGRAM_COOP_CURRICULUM_SIGNED_URL_TTL_SECONDS,
} from "@/lib/admissions/program-coop-curriculum-storage";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";

const ROUTE = "/api/parent-portal/curriculum/pdf-url";

/**
 * Mobile viewers load large curriculum books through a short-lived signed storage URL so the
 * client can use HTTP range requests (only the pages being read are fetched) instead of the
 * whole file being buffered through a serverless function. The streaming
 * `/api/parent-portal/curriculum/pdf` route stays for the web viewer.
 */
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

      let url: string;
      try {
        url = await createProgramCoopCurriculumSignedUrl(supabase, curriculum.storagePath);
      } catch (signError) {
        return apiError(ROUTE, {
          request,
          status: 403,
          error: "You do not have access to this curriculum.",
          code: "forbidden",
          cause: signError,
        });
      }

      return NextResponse.json(
        {
          url,
          fileName: curriculum.fileName,
          fileSizeBytes: curriculum.fileSizeBytes,
          expiresInSeconds: PROGRAM_COOP_CURRICULUM_SIGNED_URL_TTL_SECONDS,
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
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
