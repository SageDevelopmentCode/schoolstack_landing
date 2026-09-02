import {
  listOrgApplicationSubmissionsPage,
  ORG_SUBMISSIONS_PAGE_DEFAULT_SIZE,
  type ListOrgApplicationSubmissionsPageOptions,
} from "@/lib/admissions/application-submissions";
import { fetchSubmissionPageMeta } from "@/lib/school-admin/submissions-page-meta";
import type { ApplicationSubmissionsTableData } from "@/lib/school-admin/load-submissions-table-data";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type ApplicationSubmissionsPageMeta = Awaited<
  ReturnType<typeof fetchSubmissionPageMeta>
>;

export type ApplicationSubmissionsPageData = ApplicationSubmissionsPageMeta &
  ApplicationSubmissionsTableData;

/**
 * Full page loader (meta + table). Prefer streaming via fetchSubmissionPageMeta
 * + loadApplicationSubmissionsTableData for faster perceived load.
 */
export async function loadApplicationSubmissionsPageData(
  organizationId: string,
  options: ListOrgApplicationSubmissionsPageOptions = {},
): Promise<ApplicationSubmissionsPageData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [page, meta] = await Promise.all([
    listOrgApplicationSubmissionsPage(supabase, organizationId, {
      limit: ORG_SUBMISSIONS_PAGE_DEFAULT_SIZE,
      offset: 0,
      statusFilter: options.statusFilter ?? "all",
      formKey: options.formKey ?? "all",
      enrichment: "minimal",
      ...options,
    }),
    fetchSubmissionPageMeta(supabase, organizationId),
  ]);

  return {
    submissions: page.submissions,
    totalCount: page.totalCount,
    statusCounts: meta.statusCounts,
    activeSubmissionsCount: meta.activeSubmissionsCount,
    latestSubmitted: meta.latestSubmitted,
    formOptions: meta.formOptions,
    pageSize: ORG_SUBMISSIONS_PAGE_DEFAULT_SIZE,
  };
}
