import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import SchoolAdminAccessDenied from "@/components/school-admin/SchoolAdminAccessDenied";
import MudKitchenPortalShell from "@/components/mudkitchen-portal/MudKitchenPortalShell";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { countDueCustomerInvoices } from "@/lib/mudkitchen-portal/customer-invoices";
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

export default async function MudKitchenPortalLayout({
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

  return (
    <MudKitchenPortalShell
      slug={slug}
      schoolName={org.name}
      branding={org.branding}
      dueInvoiceCount={await countDueCustomerInvoices(supabase, org.id)}
    >
      {children}
    </MudKitchenPortalShell>
  );
}
