import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ParentClassroomSignupDetailPage from "@/components/classroom-signups/parent/ParentClassroomSignupDetailPage";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import { getRequestUser } from "@/lib/auth/session";
import { isParentFeatureEnabled } from "@/lib/organization-settings/parent-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; signupId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentFeatureEnabled(org.features, "classroom_signups")) {
    return { title: "School Not Found" };
  }

  return {
    title: `Help in the classroom · ${org.name} Parent Portal`,
  };
}

export default async function ParentClassroomSignupDetailRoute({
  params,
}: PageProps) {
  const { slug, signupId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentFeatureEnabled(org.features, "classroom_signups")) {
    notFound();
  }

  const user = await getRequestUser();
  if (!user) {
    notFound();
  }

  return (
    <SchoolParentPageShell title="Help in the classroom">
      <ParentClassroomSignupDetailPage slug={slug} signupId={signupId} />
    </SchoolParentPageShell>
  );
}
