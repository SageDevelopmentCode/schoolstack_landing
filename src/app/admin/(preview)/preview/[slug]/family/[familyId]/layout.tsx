import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import FamilyPreviewShell from "@/components/admin/FamilyPreviewShell";
import { PreviewPortalOptionsProvider } from "@/components/admin/PreviewPortalOptionsProvider";
import {
  familyHasEnrolledAccess,
  getFamilyPreviewProfile,
} from "@/lib/admissions/family-preview-server-cache";
import {
  listFamilyPreviewGuardians,
  resolveFamilyPreviewGuardianId,
} from "@/lib/admissions/family-preview-access";
import {
  listPreviewPortalOptions,
  resolveFamilyPreviewParentPortalHref,
} from "@/lib/admissions/preview-portal-options";
import { isParentPortalEnabled } from "@/lib/organization-settings/parent-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string; familyId: string }>;
};

export default async function FamilyPreviewLayout({
  children,
  params,
}: LayoutProps) {
  const { slug, familyId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const [userProfile, hasEnrolledAccess, guardians, defaultGuardianId] =
    await Promise.all([
      getFamilyPreviewProfile(supabase, org.id, familyId),
      familyHasEnrolledAccess(supabase, org.id, familyId),
      listFamilyPreviewGuardians(supabase, org.id, familyId),
      resolveFamilyPreviewGuardianId(supabase, org.id, familyId),
    ]);

  const parentPortalEnabled = isParentPortalEnabled(org.features);
  const parentPortalHref =
    hasEnrolledAccess && parentPortalEnabled
      ? await resolveFamilyPreviewParentPortalHref(supabase, org, familyId)
      : null;

  const portalOptions = listPreviewPortalOptions({
    slug,
    familyId,
    hasEnrolledAccess,
    org,
    parentPortalHref,
  });

  return (
    <PreviewPortalOptionsProvider options={portalOptions}>
      <FamilyPreviewShell
        schoolSlug={slug}
        familyId={familyId}
        schoolName={org.name}
        userProfile={userProfile}
        guardians={guardians}
        defaultGuardianId={defaultGuardianId}
        hasEnrolledAccess={hasEnrolledAccess}
        parentPortalEnabled={parentPortalEnabled}
        parentPortalHref={parentPortalHref}
      >
        {children}
      </FamilyPreviewShell>
    </PreviewPortalOptionsProvider>
  );
}
