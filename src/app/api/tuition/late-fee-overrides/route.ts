import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { requireTuitionOrgAdmin } from "@/lib/tuition/api-auth";
import {
  deleteLateFeeOverride,
  listLateFeeOverrides,
  upsertLateFeeOverride,
} from "@/lib/tuition/late-fee-overrides";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/late-fee-overrides";

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
    const overrides = await listLateFeeOverrides(admin, organizationId);

    return NextResponse.json({ overrides });
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

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const user = await requireAuthenticatedUser(supabase);
    const admin = createAdminClient();
    const body = (await request.json()) as {
      organizationId?: string;
      year?: number;
      month?: number;
      lateFeeDayOfMonth?: number;
    };

    if (
      !body.organizationId ||
      body.year == null ||
      body.month == null ||
      body.lateFeeDayOfMonth == null
    ) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId, year, month, and lateFeeDayOfMonth are required.",
        code: "invalid_request",
      });
    }

    await requireTuitionOrgAdmin(admin, body.organizationId, user.id);
    const override = await upsertLateFeeOverride(admin, {
      organizationId: body.organizationId,
      year: body.year,
      month: body.month,
      lateFeeDayOfMonth: body.lateFeeDayOfMonth,
    });

    return NextResponse.json({ override });
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

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const user = await requireAuthenticatedUser(supabase);
    const admin = createAdminClient();
    const { searchParams } = new URL(request.url);
    const overrideId = searchParams.get("overrideId");
    const organizationId = searchParams.get("organizationId");

    if (!overrideId || !organizationId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "overrideId and organizationId are required.",
        code: "invalid_request",
      });
    }

    await requireTuitionOrgAdmin(admin, organizationId, user.id);
    await deleteLateFeeOverride(admin, overrideId);

    return NextResponse.json({ ok: true });
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
