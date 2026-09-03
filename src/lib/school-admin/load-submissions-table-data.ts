import {
  listOrgApplicationSubmissionsPage,
  ORG_SUBMISSIONS_PAGE_DEFAULT_SIZE,
  type ListOrgApplicationSubmissionsPageOptions,
} from "@/lib/admissions/application-submissions";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type ApplicationSubmissionsTableData = {
  submissions: Awaited<
    ReturnType<typeof listOrgApplicationSubmissionsPage>
  >["submissions"];
  totalCount: number;
  pageSize: number;
};

export async function loadApplicationSubmissionsTableData(
  organizationId: string,
  options: ListOrgApplicationSubmissionsPageOptions = {},
): Promise<ApplicationSubmissionsTableData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const page = await listOrgApplicationSubmissionsPage(supabase, organizationId, {
    limit: ORG_SUBMISSIONS_PAGE_DEFAULT_SIZE,
    offset: 0,
    statusFilter: options.statusFilter ?? "all",
    formKey: options.formKey ?? "all",
    enrichment: "minimal",
    ...options,
  });

  return {
    submissions: page.submissions,
    totalCount: page.totalCount,
    pageSize: ORG_SUBMISSIONS_PAGE_DEFAULT_SIZE,
  };
}
