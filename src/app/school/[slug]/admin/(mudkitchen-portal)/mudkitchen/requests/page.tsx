import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MudKitchenSupportRequestsPage from "@/components/mudkitchen-portal/MudKitchenSupportRequestsPage";
import { fetchOrganizationSupportRequests } from "@/lib/mudkitchen-portal/support-requests";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
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
    title: `Requests · MudKitchen · ${org.name}`,
  };
}

export default async function MudKitchenPortalRequestsPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userEmail = user?.email ?? null;

  const requests = await fetchOrganizationSupportRequests(supabase, org.id);

  return (
    <MudKitchenSupportRequestsPage
      organizationId={org.id}
      initialRequests={requests}
      userEmail={userEmail}
    />
  );
}
