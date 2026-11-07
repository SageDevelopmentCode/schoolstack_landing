import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { authorizeParentStudentHealthAccess } from "@/lib/student-health/authorize-parent-student";
import { isPhotoMediaConsent, parsePhotoMediaConsent } from "@/lib/students/photo-media-consent";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/students/[studentId]/photo-media-consent";

type StudentParams = { studentId: string };

export const GET = withParentPortalRoute<undefined, StudentParams>(
  {
    route: ROUTE,
    enforceAccess: false,
    fallbackErrorMessage: "Failed to load photo permissions.",
  },
  async ({ request, supabase, user, organizationId, access, params }) => {
    const { studentId } = params;

    const healthAccess = await authorizeParentStudentHealthAccess(
      supabase,
      user,
      organizationId,
      studentId,
      access,
    );

    if (!healthAccess.ok) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have permission to view this student's photo permissions.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("students")
      .select("id, photo_media_consent, photo_media_consent_updated_at")
      .eq("id", studentId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load photo permissions.",
        cause: error,
        code: "load_failed",
      });
    }

    if (!data) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Student not found.",
        code: "not_found",
      });
    }

    return NextResponse.json({
      studentId: String(data.id),
      consent: parsePhotoMediaConsent(data.photo_media_consent as string | null),
      updatedAt:
        typeof data.photo_media_consent_updated_at === "string"
          ? data.photo_media_consent_updated_at
          : null,
    });
  },
);

type PatchBody = {
  organizationId?: string;
  consent?: string;
};

export const PATCH = withParentPortalRoute<PatchBody, StudentParams>(
  {
    route: ROUTE,
    organizationFrom: "body",
    enforceAccess: false,
    missingOrganizationMessage: "organizationId and consent are required.",
    invalidBodyMessage: "Invalid JSON body.",
    fallbackErrorMessage: "Failed to update photo permissions.",
  },
  async ({ request, supabase, user, organizationId, access, body, params }) => {
    const { studentId } = params;
    const consentRaw = body.consent?.trim() ?? "";

    if (!consentRaw) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId and consent are required.",
        code: "missing_fields",
      });
    }

    if (!isPhotoMediaConsent(consentRaw)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "consent must be full, limited, or none.",
        code: "invalid_consent",
      });
    }

    const healthAccess = await authorizeParentStudentHealthAccess(
      supabase,
      user,
      organizationId,
      studentId,
      access,
    );

    if (!healthAccess.ok) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have permission to update this student's photo permissions.",
        code: "forbidden",
      });
    }

    const updatedAt = new Date().toISOString();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("students")
      .update({
        photo_media_consent: consentRaw,
        photo_media_consent_updated_at: updatedAt,
      })
      .eq("id", studentId)
      .eq("organization_id", organizationId)
      .select("id, photo_media_consent, photo_media_consent_updated_at")
      .maybeSingle();

    if (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to update photo permissions.",
        cause: error,
        code: "update_failed",
      });
    }

    if (!data) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Student not found.",
        code: "not_found",
      });
    }

    return NextResponse.json({
      studentId: String(data.id),
      consent: parsePhotoMediaConsent(data.photo_media_consent as string | null),
      updatedAt:
        typeof data.photo_media_consent_updated_at === "string"
          ? data.photo_media_consent_updated_at
          : updatedAt,
    });
  },
);
