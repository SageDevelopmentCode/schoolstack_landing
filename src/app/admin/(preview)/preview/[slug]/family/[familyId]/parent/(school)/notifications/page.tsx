import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ParentNotificationSettingsPage from "@/components/school-parent/ParentNotificationSettingsPage";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import { getFamilyPreviewProfile } from "@/lib/admissions/family-preview-server-cache";
import { isParentPortalEnabled } from "@/lib/organization-settings/parent-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { getFamilyNotificationEmailSettings } from "@/lib/notifications/family-notification-emails";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; familyId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentPortalEnabled(org.features)) {
    return { title: "Preview Not Found" };
  }

  return {
    title: `Notification settings · ${org.name} Parent Preview`,
  };
}

export default async function FamilyPreviewParentNotificationsPage({
  params,
}: PageProps) {
  const { slug, familyId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentPortalEnabled(org.features)) {
    notFound();
  }

  const userProfile = await getFamilyPreviewProfile(supabase, org.id, familyId);
  const admin = createAdminClient();
  const initialSettings = await getFamilyNotificationEmailSettings(admin, {
    familyId,
    loginEmail: userProfile.email,
  });

  return (
    <SchoolParentPageShell title="Notification settings">
      <ParentNotificationSettingsPage
        organizationId={org.id}
        branding={org.branding}
        readOnly
        initialSettings={{
          familyId,
          ...initialSettings,
        }}
      />
    </SchoolParentPageShell>
  );
}
