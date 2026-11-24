import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import GardenRoot from "@/components/garden/GardenRoot";
import SchoolAdminAccessDenied from "@/components/school-admin/SchoolAdminAccessDenied";
import MudKitchenPortalShell from "@/components/mudkitchen-portal/MudKitchenPortalShell";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { countDueCustomerInvoices } from "@/lib/mudkitchen-portal/customer-invoices";
import {
  SchoolAdminAuthError,
  requireSchoolAdminUser,
  schoolAdminLoginPath,
} from "@/lib/school-admin/access";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import {
  FREE_PLAN_UPGRADE_QUERY,
  MUDKITCHEN_ACCOUNT_LABEL,
} from "@/lib/school-admin/free-plan-upgrade";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function MudKitchenPortalLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(slug);

  if (!org) {
    notFound();
  }

  let deniedUserEmail: string | null | undefined;

  try {
    await requireSchoolAdminUser(supabase, org.id);
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

  // Free schools see the unlock popup on Home instead of the account pages.
  if (org.plan === "free") {
    const params = new URLSearchParams({
      [FREE_PLAN_UPGRADE_QUERY]: MUDKITCHEN_ACCOUNT_LABEL,
    });
    redirect(`${schoolAdminPath(slug, "home")}?${params.toString()}`);
  }

  const dueInvoiceCount = await countDueCustomerInvoices(supabase, org.id);

  return (
    <GardenRoot className="min-h-dvh bg-[var(--sf-cream)]">
      <MudKitchenPortalShell
        slug={slug}
        schoolName={org.name}
        branding={org.branding}
        dueInvoiceCount={dueInvoiceCount}
      >
        {children}
      </MudKitchenPortalShell>
    </GardenRoot>
  );
}
