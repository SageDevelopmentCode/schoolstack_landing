import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SchoolTeacherComingSoon from "@/components/school-teacher/SchoolTeacherComingSoon";
import { getTeacherPageLabel } from "@/lib/organization-settings/teacher-nav";
import { isTeacherFeatureEnabled } from "@/lib/organization-settings/teacher-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; feature: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, feature } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isTeacherFeatureEnabled(org.features, feature)) {
    return { title: "School Not Found" };
  }

  const pageName = getTeacherPageLabel(
    feature,
    org.features.feature_nav?.teacher,
  );

  return {
    title: `${pageName} · ${org.name} Staff`,
  };
}

export default async function SchoolTeacherFeaturePage({ params }: PageProps) {
  const { slug, feature } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isTeacherFeatureEnabled(org.features, feature)) {
    notFound();
  }

  const pageName = getTeacherPageLabel(
    feature,
    org.features.feature_nav?.teacher,
  );

  return (
    <SchoolTeacherComingSoon branding={org.branding} featureLabel={pageName} />
  );
}
