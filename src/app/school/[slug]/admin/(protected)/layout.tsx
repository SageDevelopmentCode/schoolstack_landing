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
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import {
  getCachedActivityNotificationUnreadCount,
  getCachedAdminMessagesUnreadCount,
} from "@/lib/school-admin/cached-admin-unread-counts";

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
  const admin = createAdminClient();
  const messagesEnabled = Boolean(org.features.admin.messages);
  const [initialMessagesUnreadCount, initialActivityUnreadCount] = user
    ? await Promise.all([
        messagesEnabled
          ? getCachedAdminMessagesUnreadCount(
              admin,
              org.id,
              user.id,
              org.name,
            ).catch(() => 0)
          : Promise.resolve(0),
        getCachedActivityNotificationUnreadCount(admin, user.id, org.id).catch(
          () => 0,
        ),
      ])
    : [0, 0];

  return (
    <SchoolAdminBaseline
      slug={slug}
      organizationId={org.id}
      schoolName={org.name}
      branding={org.branding}
      features={org.features}
      userProfile={userProfile}
      initialMessagesUnreadCount={initialMessagesUnreadCount}
      initialActivityUnreadCount={initialActivityUnreadCount}
    >
      {children}
    </SchoolAdminBaseline>
  );
}
