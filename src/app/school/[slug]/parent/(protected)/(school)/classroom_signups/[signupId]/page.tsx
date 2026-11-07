import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { isParentFeatureEnabled, parentClassroomSignupPath } from "@/lib/organization-settings/parent-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; signupId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const org = await fetchOrganizationWithSettings(slug);

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
  const org = await fetchOrganizationWithSettings(slug);

  if (!org || !isParentFeatureEnabled(org.features, "classroom_signups")) {
    notFound();
  }

  redirect(parentClassroomSignupPath(slug, signupId));
}
