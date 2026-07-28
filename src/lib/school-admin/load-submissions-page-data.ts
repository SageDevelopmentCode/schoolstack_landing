import { listOrgParentPortalLoginStatus } from "@/lib/admissions/parent-portal-login-status";
import {
  listOrgApplicationSubmissions,
  type AdminApplicationSubmission,
} from "@/lib/admissions/application-submissions";
import type { ParentPortalLoginStatus } from "@/lib/admissions/parent-portal-login-status";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type ApplicationSubmissionsPageData = {
  submissions: AdminApplicationSubmission[];
  loginStatusByGuardianId: Record<string, ParentPortalLoginStatus>;
};

export async function loadApplicationSubmissionsPageData(
  organizationId: string,
): Promise<ApplicationSubmissionsPageData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const submissions = await listOrgApplicationSubmissions(
    supabase,
    organizationId,
  );

  try {
    const admin = createAdminClient();
    const statuses = await listOrgParentPortalLoginStatus(admin, organizationId);
    const loginStatusByGuardianId = Object.fromEntries(
      statuses.map((status) => [status.guardianId, status]),
    );
    return { submissions, loginStatusByGuardianId };
  } catch {
    return { submissions, loginStatusByGuardianId: {} };
  }
}
