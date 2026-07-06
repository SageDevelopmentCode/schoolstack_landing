import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  bootstrapApplicant,
  BootstrapApplicantError,
} from "@/lib/admissions/applicant-bootstrap";
import { apiError } from "@/lib/api/route-errors";
import {
  notifyRootedMeadowsParentApplicationStarted,
  type ApplyAuthMode,
} from "@/lib/discord";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/applicant-bootstrap";

type BootstrapRequestBody = {
  organizationId?: string;
  formVersionId?: string;
  firstName?: string;
  lastName?: string;
  schoolName?: string;
  formTitle?: string;
  mode?: ApplyAuthMode;
  forceNew?: boolean;
};

function isApplyAuthMode(value: string): value is ApplyAuthMode {
  return value === "create" || value === "login";
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in to continue.",
      code: "unauthenticated",
    });
  }

  let body: BootstrapRequestBody;
  try {
    body = (await request.json()) as BootstrapRequestBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim();
  const formVersionId = body.formVersionId?.trim();

  if (!organizationId || !formVersionId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and formVersionId are required.",
      code: "missing_fields",
    });
  }

  const email = user.email;
  if (!email) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Your account has no email address.",
      code: "missing_email",
    });
  }

  try {
    const admin = createAdminClient();
    const result = await bootstrapApplicant(admin, {
      userId: user.id,
      email,
      organizationId,
      formVersionId,
      firstName: body.firstName,
      lastName: body.lastName,
      forceNew: body.forceNew === true,
    });

    if (
      result.action === "resume" &&
      result.createdNewApplication &&
      body.schoolName?.trim() &&
      body.mode &&
      isApplyAuthMode(body.mode) &&
      result.applicationId
    ) {
      try {
        await notifyRootedMeadowsParentApplicationStarted({
          schoolName: body.schoolName.trim(),
          email,
          mode: body.mode,
          applicationId: result.applicationId,
          formTitle: body.formTitle,
          firstName: body.firstName,
          lastName: body.lastName,
        });
      } catch (discordError) {
        console.error("applicant-bootstrap Discord notify failed:", discordError);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof BootstrapApplicantError) {
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
      error: "Something went wrong. Please try again.",
      code: "internal_error",
      cause: error,
    });
  }
}
