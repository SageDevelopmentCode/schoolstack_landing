import { fetchTuitionPageMeta } from "@/lib/tuition/tuition-page-meta";
import { listRatePlansWithDetails } from "@/lib/tuition/rate-plans";
import { deriveSchoolYearBounds } from "@/lib/tuition/outstanding-period";
import type { OutstandingPeriod } from "@/lib/tuition/outstanding-period";
import type { RatePlanWithDetails } from "@/lib/tuition/types";
import type { TuitionPageMeta } from "@/lib/tuition/tuition-page-meta";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type TuitionDashboardData = {
  ratePlans: RatePlanWithDetails[];
  pageMeta: TuitionPageMeta;
};

export async function loadTuitionDashboardData(
  organizationId: string,
  options: { outstandingPeriod?: OutstandingPeriod } = {},
): Promise<TuitionDashboardData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const admin = createAdminClient();

  const ratePlans = await listRatePlansWithDetails(admin, organizationId);
  const schoolYearBounds = deriveSchoolYearBounds(ratePlans);
  const pageMeta = await fetchTuitionPageMeta(supabase, organizationId, {
    outstandingPeriod: options.outstandingPeriod ?? "current_month",
    schoolYearBounds,
  });

  return { ratePlans, pageMeta };
}
