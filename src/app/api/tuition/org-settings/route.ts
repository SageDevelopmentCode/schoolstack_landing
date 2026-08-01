import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { requireTuitionOrgAdmin } from "@/lib/tuition/api-auth";
import {
  getTuitionOrgSettings,
  updateTuitionOrgSettings,
} from "@/lib/tuition/org-settings";
import type { TuitionOrgSettings } from "@/lib/tuition/types";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/org-settings";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const user = await requireAuthenticatedUser(supabase);
    const admin = createAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId is required.",
        code: "invalid_request",
      });
    }

    await requireTuitionOrgAdmin(admin, organizationId, user.id);
    const settings = await getTuitionOrgSettings(admin, organizationId);

    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }
    throw error;
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const user = await requireAuthenticatedUser(supabase);
    const admin = createAdminClient();
    const body = (await request.json()) as {
      organizationId?: string;
      settings?: TuitionOrgSettings;
    };

    if (!body.organizationId || !body.settings) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId and settings are required.",
        code: "invalid_request",
      });
    }

    await requireTuitionOrgAdmin(admin, body.organizationId, user.id);
    const settings = await updateTuitionOrgSettings(
      admin,
      body.organizationId,
      body.settings,
    );

    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }
    throw error;
  }
}
