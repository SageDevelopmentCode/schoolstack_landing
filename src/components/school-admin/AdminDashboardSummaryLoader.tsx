import type { User } from "@supabase/supabase-js";
import AdminDashboardContent from "@/components/school-admin/AdminDashboardContent";
import { fetchAdminDashboardToday } from "@/lib/school-admin/dashboard-summary";
import type { OrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

type AdminDashboardSummaryLoaderProps = {
  org: OrganizationWithSettings;
  slug: string;
  user: User | null;
  userFirstName?: string | null;
};

export default async function AdminDashboardSummaryLoader({
  org,
  slug,
  user,
  userFirstName,
}: AdminDashboardSummaryLoaderProps) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const admin = createAdminClient();
  const initialToday = await fetchAdminDashboardToday(
    supabase,
    admin,
    org.id,
    slug,
    org.features.admin,
    {
      userId: user?.id,
      schoolName: org.name,
    },
  );

  return (
    <AdminDashboardContent
      organizationId={org.id}
      slug={slug}
      features={org.features}
      schoolName={org.name}
      userFirstName={userFirstName}
      initialToday={initialToday}
    />
  );
}
