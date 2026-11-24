import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PublicTourExperience from "@/components/admissions/PublicTourExperience";
import Footer from "@/components/sections/Footer";
import { getAdmissionsOrgSettings } from "@/lib/admissions/admissions-org-settings";
import {
  isPublicTourEnabled,
  parsePublicTourPageSettings,
  resolvePublicTourFields,
  resolvePublicTourHeadline,
  resolvePublicTourIntro,
} from "@/lib/admissions/public-tour-settings";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createAdminClient } from "@/utils/supabase/admin";
import { schoolPageMetadata } from "@/lib/og/school-page-metadata";

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

  return schoolPageMetadata(org, {
    title: `Schedule a tour | ${org.name}`,
    description: `Book a campus tour at ${org.name}.`,
    path: "/tour",
    page: "tour",
  });
}

export default async function PublicTourPage({ params }: PageProps) {
  const { slug } = await params;
  const org = await fetchOrganizationWithSettings(slug);

  if (!org) {
    notFound();
  }

  const admin = createAdminClient();
  const admissions = await getAdmissionsOrgSettings(admin, org.id);
  const publicTour = parsePublicTourPageSettings(admissions.publicTour);

  if (!isPublicTourEnabled(publicTour)) {
    notFound();
  }

  return (
    <>
      <PublicTourExperience
        branding={org.branding}
        schoolName={org.name}
        schoolSlug={slug}
        organizationId={org.id}
        headline={resolvePublicTourHeadline(publicTour)}
        intro={resolvePublicTourIntro(publicTour)}
        fields={resolvePublicTourFields(publicTour)}
      />
      <Footer />
    </>
  );
}
