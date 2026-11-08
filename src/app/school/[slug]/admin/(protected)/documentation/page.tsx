import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminDocumentationPage from "@/components/school-admin/AdminDocumentationPage";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const org = await fetchOrganizationWithSettings(slug);

  if (!org) {
    return { title: "School Not Found" };
  }

  return {
    title: `How-to guides · ${org.name} Admin`,
  };
}

export default async function SchoolAdminDocumentationRoute({ params }: PageProps) {
  const { slug } = await params;
  const org = await fetchOrganizationWithSettings(slug);

  if (!org) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <AdminDocumentationPage
        slug={slug}
        schoolName={org.name}
        branding={org.branding}
        features={org.features}
        plan={org.plan}
      />
    </Suspense>
  );
}
