import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  getProgramCoopCurriculumById,
  PROGRAM_COOP_CURRICULUM_BUCKET,
} from "@/lib/admissions/program-coop-curriculum-storage";
import { userHasAccessForProgramPortal } from "@/lib/admissions/program-parent-portal-access";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/parent-portal/curriculum/pdf";

function contentDispositionInline(fileName: string): string {
  const safe = fileName.replace(/["\r\n]/g, "_");
  return `inline; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const programId = searchParams.get("programId")?.trim() ?? "";
  const curriculumId = searchParams.get("curriculumId")?.trim() ?? "";

  if (!organizationId || !programId || !curriculumId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, programId, and curriculumId are required.",
      code: "missing_fields",
    });
  }

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

  try {
    const hasAccess = await userHasAccessForProgramPortal(
      supabase,
      user.id,
      organizationId,
      programId,
    );
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to this curriculum.",
        code: "forbidden",
      });
    }

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
}
