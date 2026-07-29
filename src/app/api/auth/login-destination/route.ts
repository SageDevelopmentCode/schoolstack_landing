import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { recordAuthActivity } from "@/lib/activity-auth-server";
import { resolveAuthenticatedLogin } from "@/lib/auth/login-destination";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

type LoginAuthMethod = "otp" | "password" | "session_restored";

function isLoginAuthMethod(value: string | undefined): value is LoginAuthMethod {
  return value === "otp" || value === "password" || value === "session_restored";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim() || undefined;
  const methodParam = searchParams.get("method")?.trim();
  const method = isLoginAuthMethod(methodParam) ? methodParam : undefined;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "unauthenticated", message: "You must be signed in to continue." },
      { status: 401 },
    );
  }

  const result = await resolveAuthenticatedLogin(supabase, user.id, slug);

  if (!result.ok) {
    const status =
      result.error === "not_found"
        ? 404
        : result.error === "forbidden"
          ? 403
          : 401;

    return NextResponse.json(
      { error: result.error, message: result.message },
      { status },
    );
  }

  if (method) {
    const admin = createAdminClient();
    let organizationId: string | null = null;

    if (slug) {
      const { data: organization } = await admin
        .from("organizations")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      organizationId = organization?.id ? String(organization.id) : null;
    }

    const metadata = {
      method: method === "session_restored" ? undefined : method,
      page: "/login" as const,
      organizationSlug: slug,
    };

    if (method === "session_restored") {
      void recordAuthActivity(admin, {
        organizationId,
        actorUserId: user.id,
        actorEmail: user.email ?? null,
        surface: "login",
        action: ACTIVITY_ACTIONS.AUTH_SESSION_RESTORED,
        metadata,
      });
    } else {
      if (method === "otp") {
        void recordAuthActivity(admin, {
          organizationId,
          actorUserId: user.id,
          actorEmail: user.email ?? null,
          surface: "login",
          action: ACTIVITY_ACTIONS.AUTH_OTP_VERIFIED,
          metadata: {
            ...metadata,
            method: "otp",
          },
        });
      }

      void recordAuthActivity(admin, {
        organizationId,
        actorUserId: user.id,
        actorEmail: user.email ?? null,
        surface: "login",
        action: ACTIVITY_ACTIONS.AUTH_SIGNED_IN,
        metadata: {
          ...metadata,
          method,
        },
      });
    }
  }

  if ("needsSchoolSelection" in result) {
    return NextResponse.json({
      needsSchoolSelection: true,
      accessibleSlugs: result.accessibleSlugs,
    });
  }

  return NextResponse.json({ href: result.href });
}
