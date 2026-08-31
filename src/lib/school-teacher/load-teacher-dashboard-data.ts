import { cookies } from "next/headers";
import {
  getStaffPreviewContext,
  staffPreviewBasePath,
} from "@/lib/staff/staff-preview-access";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import {
  fetchTeacherDashboardSummary,
  type TeacherDashboardSummary,
} from "./teacher-dashboard-summary";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function loadTeacherDashboardInitialData(input: {
  organizationId: string;
  slug: string;
  features: OrganizationFeatures;
  userId: string;
  schoolName: string;
}): Promise<TeacherDashboardSummary> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const admin = createAdminClient();

  return fetchTeacherDashboardSummary(
    supabase,
    admin,
    input.organizationId,
    input.slug,
    input.features,
    {
      schoolName: input.schoolName,
      userId: input.userId,
    },
  );
}

export async function loadTeacherDashboardPreviewData(input: {
  organizationId: string;
  slug: string;
  features: OrganizationFeatures;
  staffMemberId: string;
  schoolName: string;
}): Promise<TeacherDashboardSummary> {
  const admin = createAdminClient();
  const previewBasePath = staffPreviewBasePath(input.slug, input.staffMemberId);

  const previewContext = await getStaffPreviewContext(
    admin,
    input.organizationId,
    input.staffMemberId,
  );

  return fetchTeacherDashboardSummary(
    admin,
    admin,
    input.organizationId,
    input.slug,
    input.features,
    {
      schoolName: input.schoolName,
      userId: previewContext.userId ?? undefined,
      staffMemberId: input.staffMemberId,
      teacherBasePath: previewBasePath,
    },
  );
}
