import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/account/web-push/subscribe";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

  try {
    const body = (await request.json()) as {
      organizationId?: string | null;
      endpoint?: string;
      p256dh?: string;
      auth?: string;
      userAgent?: string;
    };

    const endpoint = body.endpoint?.trim() ?? "";
    const p256dh = body.p256dh?.trim() ?? "";
    const auth = body.auth?.trim() ?? "";

    if (!endpoint || !p256dh || !auth) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "endpoint, p256dh, and auth are required.",
        code: "missing_fields",
      });
    }

    const { error } = await supabase.from("web_push_subscriptions").upsert(
      {
        user_id: user.id,
        organization_id: body.organizationId ?? null,
        endpoint,
        p256dh,
        auth,
        user_agent: body.userAgent ?? null,
      },
      { onConflict: "user_id,endpoint" },
    );

    if (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: error.message,
        cause: error,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to save push subscription.",
      code: "internal_error",
      cause: err,
    });
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

  try {
    const body = (await request.json()) as { endpoint?: string };
    const endpoint = body.endpoint?.trim() ?? "";

    if (!endpoint) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "endpoint is required.",
        code: "missing_fields",
      });
    }

    const { error } = await supabase
      .from("web_push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", endpoint);

    if (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: error.message,
        cause: error,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to remove push subscription.",
      code: "internal_error",
      cause: err,
    });
  }
}
