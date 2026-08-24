import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import StaffPreviewShell from "@/components/admin/StaffPreviewShell";
import SchoolTeacherBaseline from "@/components/school-teacher/SchoolTeacherBaseline";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { isTeacherPortalEnabled } from "@/lib/organization-settings/teacher-routes";
import { getStaffPreviewContext } from "@/lib/staff/staff-preview-server-cache";
import { staffPreviewBasePath } from "@/lib/staff/staff-preview-access";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string; staffMemberId: string }>;
};

export default async function StaffTeacherPreviewLayout({
  children,
  params,
}: LayoutProps) {
  const { slug, staffMemberId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org || !isTeacherPortalEnabled(org.features)) {
    notFound();
  }

  let previewContext;
  try {
    previewContext = await getStaffPreviewContext(
      supabase,
      org.id,
      staffMemberId,
    );
  } catch {
    notFound();
  }

  if (
    !previewContext.portalRole ||
    previewContext.membershipStatus !== "active"
  ) {
    notFound();
  }

  const previewBasePath = staffPreviewBasePath(slug, staffMemberId);

  return (
    <Suspense fallback={null}>
      <StaffPreviewShell
        schoolName={org.name}
        userProfile={previewContext.userProfile}
      >
        <SchoolTeacherBaseline
          slug={slug}
          organizationId={org.id}
          schoolName={org.name}
          branding={org.branding}
          features={org.features}
          userProfile={previewContext.userProfile}
          previewMode
          previewBasePath={previewBasePath}
        >
          {children}
        </SchoolTeacherBaseline>
      </StaffPreviewShell>
    </Suspense>
  );
}
