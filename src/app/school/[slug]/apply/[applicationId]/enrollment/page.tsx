import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import ApplyAuthPage from "@/components/admissions/ApplyAuthPage";
import PublicEnrollmentChecklistClient from "@/components/admissions/PublicEnrollmentChecklistClient";
import { userOwnsApplication } from "@/lib/admissions/application-auth";
import { loadEnrollmentChecklistForApplication } from "@/lib/admissions/enrollment-checklist-materialization";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; applicationId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    return { title: "School Not Found" };
  }

  return {
    title: `Enrollment | ${org.name}`,
  };
}

export default async function ApplicationEnrollmentPage({ params }: PageProps) {
  const { slug, applicationId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <ApplyAuthPage branding={org.branding} schoolName={org.name} />;
  }

  const ownsApplication = await userOwnsApplication(supabase, user.id, applicationId);
  if (!ownsApplication) {
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
    redirect(`/school/${slug}/apply/${applicationId}`);
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
    />
  );
}
