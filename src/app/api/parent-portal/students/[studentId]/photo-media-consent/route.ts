import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { authorizeParentStudentHealthAccess } from "@/lib/student-health/authorize-parent-student";
import {
  isPhotoMediaConsent,
  parsePhotoMediaConsent,
} from "@/lib/students/photo-media-consent";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  createClientFromRequest,
  getUserFromRequest,
  signedInErrorForRequest,
} from "@/lib/supabase/request-client";

const ROUTE = "/api/parent-portal/students/[studentId]/photo-media-consent";

type RouteContext = {
  params: Promise<{ studentId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { studentId } = await context.params;
  const supabase = await createClientFromRequest(request);

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

  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";
  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  const access = await authorizeParentStudentHealthAccess(
    supabase,
    user,
    organizationId,
    studentId,
  );

  if (!access.ok) {
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
}

type PatchBody = {
  organizationId?: string;
  consent?: string;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { studentId } = await context.params;
  const supabase = await createClientFromRequest(request);

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

  const organizationId = body.organizationId?.trim() ?? "";
  const consentRaw = body.consent?.trim() ?? "";

  if (!organizationId || !consentRaw) {
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

  const access = await authorizeParentStudentHealthAccess(
    supabase,
    user,
    organizationId,
    studentId,
  );

  if (!access.ok) {
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
}
