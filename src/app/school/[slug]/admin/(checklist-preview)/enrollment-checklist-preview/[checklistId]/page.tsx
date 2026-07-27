import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EnrollmentChecklistPreviewPageClient from "@/components/school-admin/admissions/EnrollmentChecklistPreviewPageClient";
import { getEnrollmentChecklistWithItems } from "@/lib/admissions/enrollment-checklist-templates";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; checklistId: string }>;
  searchParams: Promise<{ item?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    return { title: "Preview Not Found" };
  }

  return {
    title: `Enrollment Checklist Preview · ${org.name} Admin`,
  };
}

export default async function EnrollmentChecklistPreviewPage({
  params,
  searchParams,
}: PageProps) {
  const { slug, checklistId } = await params;
  const { item: initialItemId } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const loaded = await getEnrollmentChecklistWithItems(supabase, checklistId);
  if (!loaded || loaded.template.organizationId !== org.id) {
    notFound();
  }

  return (
    <EnrollmentChecklistPreviewPageClient
      branding={org.branding}
      schoolName={org.name}
      slug={slug}
      enrollmentPath={loaded.template.enrollmentPath}
      title={loaded.template.name}
      items={loaded.items}
      initialItemId={initialItemId}
    />
  );
}
