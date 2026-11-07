import { Suspense } from "react";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import LoginExperience from "@/components/login/LoginExperience";
import { listLiveOrganizationsBySlugs } from "@/lib/organization-settings/list-live-organizations";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your school portal or admin dashboard.",
};

function LoginFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <div className="h-8 w-48 animate-pulse rounded-pill bg-[#F4F1EC]" />
    </div>
  );
}

type LoginPageProps = {
  searchParams: Promise<{ school?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { school } = await searchParams;
  const schoolSlug = (Array.isArray(school) ? school[0] : school)?.trim();

  // Only resolve the school named in a deep link. The full school list is never
  // shipped to the browser; signed-in users get their own schools after auth.
  let initialOrganization = null;
  if (schoolSlug) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const [organization] = await listLiveOrganizationsBySlugs(supabase, [
      schoolSlug,
    ]);
    initialOrganization = organization ?? null;
  }

  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginExperience initialOrganization={initialOrganization} />
    </Suspense>
  );
}
