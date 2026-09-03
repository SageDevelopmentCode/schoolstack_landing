import type { User } from "@supabase/supabase-js";
import AdminDashboardContent from "@/components/school-admin/AdminDashboardContent";
import { fetchAdminDashboardSummary } from "@/lib/school-admin/dashboard-summary";
import type { OrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

type AdminDashboardSummaryLoaderProps = {
  org: OrganizationWithSettings;
  slug: string;
  user: User | null;
};

export default async function AdminDashboardSummaryLoader({
  org,
  slug,
  user,
}: AdminDashboardSummaryLoaderProps) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const admin = createAdminClient();
  const initialSummary = await fetchAdminDashboardSummary(
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
      initialSummary={initialSummary}
    />
  );
}
