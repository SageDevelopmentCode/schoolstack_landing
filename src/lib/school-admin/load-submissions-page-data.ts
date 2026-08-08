import {
  listOrgApplicationSubmissions,
  type AdminApplicationSubmission,
} from "@/lib/admissions/application-submissions";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type ApplicationSubmissionsPageData = {
  submissions: AdminApplicationSubmission[];
};

/**
 * SSR path for submissions table. Intentionally skips Auth Admin login-status
 * fan-out — badges load client-side via /parent-login-status.
 */
export async function loadApplicationSubmissionsPageData(
  organizationId: string,
): Promise<ApplicationSubmissionsPageData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const submissions = await listOrgApplicationSubmissions(
    supabase,
    organizationId,
  );

  return { submissions };
}
