import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  createClientFromRequest,
  getUserFromRequest,
} from "@/lib/supabase/request-client";

const ROUTE = "/api/account/expo-push/register";

const EXPO_PUSH_TOKEN_PATTERN = /^ExponentPushToken\[[^\]]+\]$/;

function isValidExpoPushToken(value: string): boolean {
  return EXPO_PUSH_TOKEN_PATTERN.test(value);
}

function isValidPlatform(value: string | undefined): value is "ios" | "android" {
  return value === "ios" || value === "android";
}

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);
  const {
    data: { user },
  } = await getUserFromRequest(supabase, request);

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
      pushToken?: string;
      platform?: string;
    };

    const pushToken = body.pushToken?.trim() ?? "";
    const platform = body.platform?.trim();

    if (!pushToken || !isValidExpoPushToken(pushToken)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "A valid Expo push token is required.",
        code: "invalid_push_token",
      });
    }

    if (platform && !isValidPlatform(platform)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "platform must be ios or android.",
        code: "invalid_platform",
      });
    }

    const { error } = await supabase.from("expo_push_tokens").upsert(
      {
        user_id: user.id,
        organization_id: null,
        push_token: pushToken,
        platform: platform ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "push_token" },
    );

    if (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to save push token.",
        cause: error,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to save push token.",
      code: "internal_error",
      cause: err,
    });
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClientFromRequest(request);
  const {
    data: { user },
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      pushToken?: string;
    };
    const pushToken = body.pushToken?.trim() ?? "";

    if (!pushToken || !isValidExpoPushToken(pushToken)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "A valid Expo push token is required.",
        code: "invalid_push_token",
      });
    }

    const { error } = await supabase
      .from("expo_push_tokens")
      .delete()
      .eq("push_token", pushToken)
      .eq("user_id", user.id);

    if (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to remove push token.",
        cause: error,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to remove push token.",
      code: "internal_error",
      cause: err,
    });
  }
}
