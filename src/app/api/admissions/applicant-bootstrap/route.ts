import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  bootstrapApplicant,
  BootstrapApplicantError,
} from "@/lib/admissions/applicant-bootstrap";
import {
  notifyRootedMeadowsParentApplicationStarted,
  type ApplyAuthMode,
} from "@/lib/discord";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

type BootstrapRequestBody = {
  organizationId?: string;
  formVersionId?: string;
  firstName?: string;
  lastName?: string;
  schoolName?: string;
  formTitle?: string;
  mode?: ApplyAuthMode;
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
    return NextResponse.json(
      { error: "You must be signed in to continue.", code: "unauthenticated" },
      { status: 401 },
    );
  }

  let body: BootstrapRequestBody;
  try {
    body = (await request.json()) as BootstrapRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body.", code: "invalid_body" },
      { status: 400 },
    );
  }

  const organizationId = body.organizationId?.trim();
  const formVersionId = body.formVersionId?.trim();

  if (!organizationId || !formVersionId) {
    return NextResponse.json(
      {
        error: "organizationId and formVersionId are required.",
        code: "missing_fields",
      },
      { status: 400 },
    );
  }

  const email = user.email;
  if (!email) {
    return NextResponse.json(
      { error: "Your account has no email address.", code: "missing_email" },
      { status: 400 },
    );
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
    });

    if (
      body.schoolName?.trim() &&
      body.mode &&
      isApplyAuthMode(body.mode)
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
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    console.error("applicant-bootstrap failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "internal_error" },
      { status: 500 },
    );
  }
}
