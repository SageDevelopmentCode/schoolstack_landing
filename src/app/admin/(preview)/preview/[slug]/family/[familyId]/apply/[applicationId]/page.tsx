import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import ApplicationReadOnlyView from "@/components/admissions/ApplicationReadOnlyView";
import {
  applicationBelongsToFamily,
  familyPreviewBasePath,
  getFamilyPreviewProfile,
  loadApplicationDetailForFamily,
} from "@/lib/admissions/family-preview-access";
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
    title: `Application Preview · ${org.name}`,
  };
}

export default async function FamilyPreviewApplicationPage({ params }: PageProps) {
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

  const application = await loadApplicationDetailForFamily(
    supabase,
    org.id,
    familyId,
    applicationId,
  );

  if (!application) {
    notFound();
  }

  const userProfile = await getFamilyPreviewProfile(supabase, org.id, familyId);
  const previewHomeHref = familyPreviewBasePath(slug, familyId);

  if (application.status === "draft") {
    return (
      <ApplicationReadOnlyView
        branding={org.branding}
        schoolName={org.name}
        schoolSlug={slug}
        organizationId={org.id}
        application={application}
        userProfile={userProfile}
        previewMode
        previewHomeHref={previewHomeHref}
        backHref={previewHomeHref}
      />
    );
  }

  if (application.status === "enrolling") {
    redirect(
      `${familyPreviewBasePath(slug, familyId)}/apply/${applicationId}/enrollment`,
    );
  }

  return (
    <ApplicationReadOnlyView
      branding={org.branding}
      schoolName={org.name}
      schoolSlug={slug}
      organizationId={org.id}
      application={application}
      userProfile={userProfile}
      previewMode
      previewHomeHref={previewHomeHref}
      backHref={previewHomeHref}
    />
  );
}
