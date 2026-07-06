import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import ParentAuthPage from "@/components/admissions/ParentAuthPage";
import ParentDashboardPlaceholder from "@/components/admissions/ParentDashboardPlaceholder";
import {
  listEnrolledStudents,
  userHasEnrolledAccess,
} from "@/lib/admissions/parent-portal-access";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
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
    title: `Parent Portal | ${org.name}`,
    description: `Family portal for ${org.name}.`,
  };
}

export default async function SchoolParentDashboardPage({ params }: PageProps) {
  const { slug } = await params;
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
    return <ParentAuthPage branding={org.branding} schoolName={org.name} />;
  }

  const hasEnrolledAccess = await userHasEnrolledAccess(supabase, user.id, org.id);

  if (!hasEnrolledAccess) {
    redirect(`/school/${slug}/apply`);
  }

  const enrolledStudents = await listEnrolledStudents(supabase, user.id, org.id);

  return (
    <ParentDashboardPlaceholder
      branding={org.branding}
      schoolName={org.name}
      schoolSlug={slug}
      enrolledStudents={enrolledStudents}
    />
  );
}
