import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { familyPreviewBasePath } from "@/lib/admissions/family-preview-access";
import {
  isParentFeatureEnabled,
  parentClassroomSignupPath,
} from "@/lib/organization-settings/parent-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; familyId: string; signupId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const org = await fetchOrganizationWithSettings(slug);

  if (!org || !isParentFeatureEnabled(org.features, "classroom_signups")) {
    return { title: "Preview Not Found" };
  }

  return {
    title: `Help in the classroom · ${org.name} Parent Preview`,
  };
}

export default async function FamilyPreviewClassroomSignupPage({
  params,
}: PageProps) {
  const { slug, familyId, signupId } = await params;
  const org = await fetchOrganizationWithSettings(slug);

  if (!org || !isParentFeatureEnabled(org.features, "classroom_signups")) {
    notFound();
  }

  const previewBasePath = familyPreviewBasePath(slug, familyId);
  redirect(parentClassroomSignupPath(slug, signupId, previewBasePath));
}
