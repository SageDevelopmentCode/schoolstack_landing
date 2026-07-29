import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import ApplicationReadOnlyView from "@/components/admissions/ApplicationReadOnlyView";
import ApplyAuthPage from "@/components/admissions/ApplyAuthPage";
import {
  getFamilyUserProfile,
  loadApplicationDetail,
} from "@/lib/admissions/parent-portal-access";
import { userOwnsApplication } from "@/lib/admissions/application-auth";
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
    title: `Application | ${org.name}`,
  };
}

export default async function ApplicationDetailPage({ params }: PageProps) {
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
    return (
      <ApplyAuthPage
        branding={org.branding}
        schoolName={org.name}
        organizationId={org.id}
        organizationSlug={slug}
      />
    );
  }

  const ownsApplication = await userOwnsApplication(supabase, user.id, applicationId);
  if (!ownsApplication) {
    notFound();
  }

  const [application, userProfile] = await Promise.all([
    loadApplicationDetail(supabase, applicationId, org.id, user.id),
    getFamilyUserProfile(supabase, user.id, org.id, user),
  ]);

  if (!application) {
    notFound();
  }

  if (application.status === "draft") {
    notFound();
  }

  if (application.status === "enrolling") {
    redirect(`/school/${slug}/apply/${applicationId}/enrollment`);
  }

  return (
    <ApplicationReadOnlyView
      branding={org.branding}
      schoolName={org.name}
      schoolSlug={slug}
      organizationId={org.id}
      application={application}
      userProfile={userProfile}
    />
  );
}
