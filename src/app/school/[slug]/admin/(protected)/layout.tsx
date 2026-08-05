import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import SchoolAdminAccessDenied from "@/components/school-admin/SchoolAdminAccessDenied";
import SchoolAdminBaseline from "@/components/school-admin/SchoolAdminBaseline";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import {
  getSchoolAdminUserProfile,
  SchoolAdminAuthError,
  requireSchoolAdminUser,
  schoolAdminLoginPath,
} from "@/lib/school-admin/access";
import { listSchoolPortalOptionsForUser } from "@/lib/auth/portal-switcher-server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function SchoolAdminProtectedLayout({
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

  let user: User | null = null;
  let deniedUserEmail: string | null | undefined;

  try {
    user = await requireSchoolAdminUser(supabase, org.id);
  } catch (error) {
    if (
      error instanceof SchoolAdminAuthError &&
      error.code === "unauthenticated"
    ) {
      redirect(schoolAdminLoginPath(slug));
    }

    if (error instanceof SchoolAdminAuthError && error.code === "forbidden") {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      deniedUserEmail = authUser?.email ?? null;
    } else {
      throw error;
    }
  }

  if (deniedUserEmail !== undefined) {
    return (
      <SchoolAdminAccessDenied
        branding={org.branding}
        schoolName={org.name}
        userEmail={deniedUserEmail}
      />
    );
  }

  const userProfile = user ? getSchoolAdminUserProfile(user) : null;
  const portalOptions = user
    ? await listSchoolPortalOptionsForUser(supabase, user.id, slug)
    : [];

  return (
    <SchoolAdminBaseline
      slug={slug}
      organizationId={org.id}
      schoolName={org.name}
      branding={org.branding}
      features={org.features}
      userProfile={userProfile}
      portalOptions={portalOptions}
    >
      {children}
    </SchoolAdminBaseline>
  );
}
