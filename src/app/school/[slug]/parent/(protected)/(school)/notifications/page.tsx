import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ParentNotificationSettingsPage from "@/components/school-parent/ParentNotificationSettingsPage";
import SchoolParentPageShell from "@/components/school-parent/SchoolParentPageShell";
import { getParentPortalPrimaryFamilyId, getParentPortalUserProfile } from "@/lib/parent-portal/parent-portal-server-cache";
import { isParentPortalEnabled } from "@/lib/organization-settings/parent-routes";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { getFamilyNotificationEmailSettings } from "@/lib/notifications/family-notification-emails";
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

  if (!org || !isParentPortalEnabled(org.features)) {
    return { title: "School Not Found" };
  }

  return {
    title: `Notification settings · ${org.name} Parent Portal`,
  };
}

export default async function SchoolParentNotificationsPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isParentPortalEnabled(org.features)) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const [userProfile, familyId] = await Promise.all([
    getParentPortalUserProfile(supabase, org.id),
    getParentPortalPrimaryFamilyId(supabase, org.id),
  ]);

  const initialSettings = familyId
    ? await getFamilyNotificationEmailSettings(supabase, {
        familyId,
        loginEmail: userProfile.email,
      })
    : null;

  return (
    <SchoolParentPageShell title="Notification settings">
      <ParentNotificationSettingsPage
        organizationId={org.id}
        branding={org.branding}
        initialSettings={
          familyId && initialSettings
            ? {
                familyId,
                ...initialSettings,
              }
            : undefined
        }
      />
    </SchoolParentPageShell>
  );
}
