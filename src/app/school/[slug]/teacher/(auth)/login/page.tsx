import { Suspense } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SchoolTeacherLoginForm from "@/components/school-teacher/SchoolTeacherLoginForm";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    return { title: "School Not Found" };
  }

  return {
    title: `Sign in · ${org.name} Staff`,
  };
}

function LoginFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg">
      <div className="h-8 w-48 animate-pulse rounded bg-border/40" />
    </div>
  );
}

export default async function SchoolTeacherLoginPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  return (
    <Suspense fallback={<LoginFallback />}>
      <SchoolTeacherLoginForm
        slug={slug}
        schoolName={org.name}
        branding={org.branding}
      />
    </Suspense>
  );
}
