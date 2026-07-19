import { Suspense } from "react";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import LoginExperience from "@/components/login/LoginExperience";
import { listLiveOrganizations } from "@/lib/organization-settings/list-live-organizations";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your school portal or admin dashboard.",
};

function LoginFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg">
      <div className="h-8 w-48 animate-pulse rounded bg-border/40" />
    </div>
  );
}

export default async function LoginPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const organizations = await listLiveOrganizations(supabase);

  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginExperience organizations={organizations} />
    </Suspense>
  );
}
