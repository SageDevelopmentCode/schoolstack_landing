import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MudKitchenPortalOverview from "@/components/mudkitchen-portal/MudKitchenPortalOverview";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { fetchOrganizationProgressLog } from "@/lib/organization-progress";
import { fetchDueCustomerInvoices } from "@/lib/mudkitchen-portal/customer-invoices";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    return { title: "School Not Found" };
  }

  return {
    title: `MudKitchen · ${org.name}`,
  };
}

export default async function MudKitchenPortalOverviewPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const progressEntries = await fetchOrganizationProgressLog(supabase, slug);
  const dueInvoices = await fetchDueCustomerInvoices(supabase, org.id);

  return (
    <MudKitchenPortalOverview
      slug={slug}
      schoolName={org.name}
      latestProgressEntry={progressEntries[0] ?? null}
      dueInvoices={dueInvoices}
    />
  );
}
