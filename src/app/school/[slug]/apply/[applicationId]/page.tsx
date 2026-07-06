import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ApplicationReadOnlyView from "@/components/admissions/ApplicationReadOnlyView";
import ApplyAuthPage from "@/components/admissions/ApplyAuthPage";
import { loadApplicationDetail } from "@/lib/admissions/parent-portal-access";
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
    return <ApplyAuthPage branding={org.branding} schoolName={org.name} />;
  }

  const application = await loadApplicationDetail(supabase, applicationId, org.id);

  if (!application) {
    notFound();
  }

  if (application.status === "draft") {
    notFound();
  }

  return (
    <ApplicationReadOnlyView
      branding={org.branding}
      schoolName={org.name}
      schoolSlug={slug}
      application={application}
    />
  );
}
