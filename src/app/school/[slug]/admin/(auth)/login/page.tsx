import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SchoolAdminLoginForm from "@/components/school-admin/SchoolAdminLoginForm";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const org = await fetchOrganizationWithSettings(slug);

  if (!org) {
    return { title: "School Not Found" };
  }

  return {
    title: `Sign in · ${org.name} Admin`,
  };
}

function LoginFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg">
      <div className="h-8 w-48 rounded bg-border/40 animate-pulse" />
    </div>
  );
}

export default async function SchoolAdminLoginPage({ params }: PageProps) {
  const { slug } = await params;
  const org = await fetchOrganizationWithSettings(slug);

  if (!org) {
    notFound();
  }

  return (
    <Suspense fallback={<LoginFallback />}>
      <SchoolAdminLoginForm
        slug={slug}
        organizationId={org.id}
        schoolName={org.name}
        branding={org.branding}
      />
    </Suspense>
  );
}
