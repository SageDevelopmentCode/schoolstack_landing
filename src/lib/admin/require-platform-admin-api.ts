import type { SupabaseClient, User } from "@supabase/supabase-js";
import { AuthError, requireAuthenticatedUser } from "@/lib/admissions/application-auth";

export async function requirePlatformAdminUser(
  supabase: SupabaseClient,
): Promise<User> {
  const user = await requireAuthenticatedUser(supabase);

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;

  if (data?.role !== "admin") {
    throw new AuthError(
      "You do not have permission to perform this action.",
      "forbidden",
      403,
    );
  }

  return user;
}
