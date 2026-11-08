import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getUserFromClaims } from "@/lib/supabase/get-claims-user";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export type SessionVerification = "server" | "claims";

/**
 * `verify: "server"` (default) asks GoTrue, so revoked sessions are noticed immediately: use it
 * wherever the result gates access (admin routes). `verify: "claims"` checks the JWT locally and
 * only refreshes the cookie session; use it for pages that do not redirect on `user` (parent
 * portal, apply flow), where the page and API routes authorize on their own.
 */
export async function updateSession(
  request: NextRequest,
  options: { verify?: SessionVerification } = {},
) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } =
    options.verify === "claims"
      ? await getUserFromClaims(supabase)
      : await supabase.auth.getUser();

  return { supabase, response: supabaseResponse, user };
}
