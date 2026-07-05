import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import SchoolAdminAccessDenied from "@/components/school-admin/SchoolAdminAccessDenied";
import SchoolAdminBaseline from "@/components/school-admin/SchoolAdminBaseline";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import {
  SchoolAdminAuthError,
  requireSchoolAdminUser,
  schoolAdminLoginPath,
} from "@/lib/school-admin/access";
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

  try {
    const user = await requireSchoolAdminUser(supabase, org.id);

    return (
      <SchoolAdminBaseline
        slug={slug}
        schoolName={org.name}
        branding={org.branding}
        features={org.features}
        userEmail={user.email ?? null}
      >
        {children}
      </SchoolAdminBaseline>
    );
  } catch (error) {
    if (
      error instanceof SchoolAdminAuthError &&
      error.code === "unauthenticated"
    ) {
      redirect(schoolAdminLoginPath(slug));
    }

    if (error instanceof SchoolAdminAuthError && error.code === "forbidden") {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      return (
        <SchoolAdminAccessDenied
          branding={org.branding}
          schoolName={org.name}
          userEmail={user?.email ?? null}
        />
      );
    }

    throw error;
  }
}
