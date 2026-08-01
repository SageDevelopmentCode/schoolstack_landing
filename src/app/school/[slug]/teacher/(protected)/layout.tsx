import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import SchoolTeacherBaseline from "@/components/school-teacher/SchoolTeacherBaseline";
import { getRequestUser } from "@/lib/auth/session";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { schoolTeacherLoginPath, isTeacherPortalEnabled } from "@/lib/organization-settings/teacher-routes";
import {
  getStaffUserProfile,
  userHasTeacherPortalAccess,
} from "@/lib/staff/teacher-portal-access";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function SchoolTeacherProtectedLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  if (!isTeacherPortalEnabled(org.features)) {
    notFound();
  }

  const user = await getRequestUser();

  if (!user) {
    redirect(schoolTeacherLoginPath(slug));
  }

  const hasAccess = await userHasTeacherPortalAccess(supabase, user.id, org.id);

  if (!hasAccess) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 text-center">
        <div className="max-w-md space-y-2">
          <h1 className="text-lg font-semibold text-gray-900">Access denied</h1>
          <p className="text-sm text-gray-600">
            You do not have staff access to this school. Contact your school
            administrator if you believe this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  const userProfile = await getStaffUserProfile(
    supabase,
    user.id,
    org.id,
    user,
  );

  return (
    <SchoolTeacherBaseline
      slug={slug}
      schoolName={org.name}
      branding={org.branding}
      features={org.features}
      userProfile={userProfile}
    >
      {children}
    </SchoolTeacherBaseline>
  );
}
