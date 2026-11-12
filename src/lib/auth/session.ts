import { cache } from "react";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { getUserFromClaims } from "@/lib/supabase/get-claims-user";
import { createClient } from "@/utils/supabase/server";

export const getRequestUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Same as `getRequestUser` but verifies the JWT locally (`getClaims`) instead of calling GoTrue.
 * Parent portal reads only; see `get-claims-user.ts` for the revoked-session trade-off.
 */
export const getRequestUserFromClaims = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await getUserFromClaims(supabase);
  return user;
});
