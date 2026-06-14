import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Profile = {
  id: string;
  email: string;
  role: "admin" | "viewer";
  created_at: string;
};

export async function getSessionUser() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const user = await getSessionUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .eq("id", user.id)
    .single();

  return data;
}

export async function requireAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/admin/login");
  }
  return profile;
}
