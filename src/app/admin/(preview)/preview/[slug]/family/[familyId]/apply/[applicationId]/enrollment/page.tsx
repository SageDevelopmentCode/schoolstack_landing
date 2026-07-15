import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import PublicEnrollmentChecklistClient from "@/components/admissions/PublicEnrollmentChecklistClient";
import {
  applicationBelongsToFamily,
  familyPreviewBasePath,
} from "@/lib/admissions/family-preview-access";
import { loadEnrollmentChecklistForApplication } from "@/lib/admissions/enrollment-checklist-materialization";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; familyId: string; applicationId: string }>;
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
    title: `Enrollment Preview · ${org.name}`,
  };
}

export default async function FamilyPreviewEnrollmentPage({ params }: PageProps) {
  const { slug, familyId, applicationId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const belongs = await applicationBelongsToFamily(
    supabase,
    org.id,
    familyId,
    applicationId,
  );
  if (!belongs) {
    notFound();
  }

  const { data: application, error } = await supabase
    .from("applications")
    .select("id, status, organization_id")
    .eq("id", applicationId)
    .eq("organization_id", org.id)
    .maybeSingle();

  if (error) throw error;
  if (!application) {
    notFound();
  }

  if (application.status !== "enrolling" && application.status !== "enrolled") {
    redirect(`${familyPreviewBasePath(slug, familyId)}/apply/${applicationId}`);
  }

  const checklist = await loadEnrollmentChecklistForApplication(
    supabase,
    applicationId,
    org.id,
  );

  if (!checklist) {
    notFound();
  }

  return (
    <PublicEnrollmentChecklistClient
      branding={org.branding}
      schoolName={org.name}
      schoolSlug={slug}
      organizationId={org.id}
      checklist={checklist}
      previewMode
      backHref={familyPreviewBasePath(slug, familyId)}
    />
  );
}
