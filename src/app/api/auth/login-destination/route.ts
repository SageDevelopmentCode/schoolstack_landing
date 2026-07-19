import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { resolveAuthenticatedLogin } from "@/lib/auth/login-destination";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim() || undefined;

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

  if ("needsSchoolSelection" in result) {
    return NextResponse.json({
      needsSchoolSelection: true,
      accessibleSlugs: result.accessibleSlugs,
    });
  }

  return NextResponse.json({ href: result.href });
}
