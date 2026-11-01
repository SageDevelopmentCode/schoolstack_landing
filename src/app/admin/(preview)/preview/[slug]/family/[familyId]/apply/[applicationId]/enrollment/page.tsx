import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import PublicEnrollmentChecklistClient from "@/components/admissions/PublicEnrollmentChecklistClient";
import { listCombinedEnrollmentPaymentCandidates } from "@/lib/admissions/combined-enrollment-payment";
import {
  applicationBelongsToFamily,
  familyPreviewBasePath,
  getFamilyPreviewGuardianUserId,
} from "@/lib/admissions/family-preview-access";
import { getFamilyPreviewProfile } from "@/lib/admissions/family-preview-server-cache";
import { loadEnrollmentChecklistForApplication } from "@/lib/admissions/enrollment-checklist-materialization";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; familyId: string; applicationId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    return { title: "Preview Not Found" };
  }

  return {
    title: `Enrollment Preview · ${org.name}`,
  };
}

export default async function FamilyPreviewEnrollmentPage({ params }: PageProps) {
  const { slug, familyId, applicationId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const admin = createAdminClient();

  const belongs = await applicationBelongsToFamily(
    admin,
    org.id,
    familyId,
    applicationId,
  );
  if (!belongs) {
    notFound();
  }

  const { data: application, error } = await admin
    .from("applications")
    .select("id, status, organization_id")
    .eq("id", applicationId)
    .eq("organization_id", org.id)
    .maybeSingle();

  if (error) throw error;
  if (!application) {
    notFound();
  }

  if (application.status !== "enrolling" && application.status !== "enrolled") {
    redirect(`${familyPreviewBasePath(slug, familyId)}/apply/${applicationId}`);
  }

  const [checklist, userProfile, guardianUserId] = await Promise.all([
    loadEnrollmentChecklistForApplication(admin, applicationId, org.id),
    getFamilyPreviewProfile(supabase, org.id, familyId),
    getFamilyPreviewGuardianUserId(admin, org.id, familyId),
  ]);

  if (!checklist) {
    notFound();
  }

  const combinedPaymentCandidates = guardianUserId
    ? await listCombinedEnrollmentPaymentCandidates(admin, {
        organizationId: org.id,
        userId: guardianUserId,
      })
    : [];

  return (
    <PublicEnrollmentChecklistClient
      branding={org.branding}
      schoolName={org.name}
      schoolSlug={slug}
      organizationId={org.id}
      checklist={checklist}
      combinedPaymentCandidates={combinedPaymentCandidates}
      userProfile={userProfile}
      previewMode
      backHref={familyPreviewBasePath(slug, familyId)}
    />
  );
}
