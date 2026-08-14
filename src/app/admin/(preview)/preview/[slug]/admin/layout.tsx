import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import SchoolAdminPreviewLayoutClient from "@/components/admin/SchoolAdminPreviewLayoutClient";
import {
  familyHasEnrolledAccess,
  findOwnerLinkedFamilyId,
  getFamilyPreviewProfile,
} from "@/lib/admissions/family-preview-access";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function SchoolAdminPreviewLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const defaultFamilyId = await findOwnerLinkedFamilyId(supabase, org.id);

  const [userProfile, hasEnrolledAccess] = await Promise.all([
    defaultFamilyId
      ? getFamilyPreviewProfile(supabase, org.id, defaultFamilyId)
      : Promise.resolve({
          email: "",
          displayName: "School owner (preview)",
          profilePhotoUrl: null,
        }),
    defaultFamilyId
      ? familyHasEnrolledAccess(supabase, org.id, defaultFamilyId)
      : Promise.resolve(false),
  ]);

  return (
    <Suspense fallback={null}>
      <SchoolAdminPreviewLayoutClient
        slug={slug}
        org={org}
        defaultFamilyId={defaultFamilyId}
        hasEnrolledAccess={hasEnrolledAccess}
        userProfile={userProfile}
      >
        {children}
      </SchoolAdminPreviewLayoutClient>
    </Suspense>
  );
}
