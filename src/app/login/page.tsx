import { Suspense } from "react";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import LoginExperience from "@/components/login/LoginExperience";
import { listLiveOrganizationsBySlugs } from "@/lib/organization-settings/list-live-organizations";
import { pageMetadata } from "@/lib/metadata";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to your school portal or admin dashboard.",
  path: "/login",
  noIndex: true,
});

function LoginFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#F7F1E7]">
      <div className="h-8 w-48 animate-pulse rounded-full bg-[#F8DDCF]" />
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
