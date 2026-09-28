import { NextResponse } from "next/server";
import { getAdmissionsOrgSettings } from "@/lib/admissions/admissions-org-settings";
import { updatePublicTourPageSettingsForOrg } from "@/lib/admissions/public-tour-booking";
import {
  isPublicTourEnabled,
  parsePublicTourPageSettings,
  resolvePublicTourFields,
  resolvePublicTourHeadline,
  resolvePublicTourIntro,
  sanitizePublicTourFieldsForSave,
  type PublicTourFieldDefinition,
} from "@/lib/admissions/public-tour-settings";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/admissions/public-tour-settings";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim();

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const supabase = await createClientFromRequest(request);
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();
    const admissions = await getAdmissionsOrgSettings(admin, organizationId);
    const publicTour = parsePublicTourPageSettings(admissions.publicTour);

    return NextResponse.json({
      platformEnabled: isPublicTourEnabled(publicTour),
      headline: resolvePublicTourHeadline(publicTour),
      intro: resolvePublicTourIntro(publicTour),
      fields: resolvePublicTourFields(publicTour),
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
      error: "Failed to load public tour settings.",
      cause: error,
    });
  }
}

type PatchBody = {
  organizationId?: string;
  headline?: string;
  intro?: string;
  fields?: PublicTourFieldDefinition[];
};

export async function PATCH(request: Request) {
  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim();
  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const supabase = await createClientFromRequest(request);
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();

    await updatePublicTourPageSettingsForOrg(admin, organizationId, {
      ...(body.headline !== undefined ? { headline: body.headline.trim() } : {}),
      ...(body.intro !== undefined ? { intro: body.intro.trim() } : {}),
      ...(body.fields !== undefined
        ? { fields: sanitizePublicTourFieldsForSave(body.fields) }
        : {}),
    });

    return new NextResponse(null, { status: 204 });
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
      error: "Failed to save public tour settings.",
      cause: error,
    });
  }
}
