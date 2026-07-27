import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MudKitchenBillingPlaceholder from "@/components/mudkitchen-portal/MudKitchenBillingPlaceholder";
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
    title: `Billing · MudKitchen · ${org.name}`,
  };
}

export default async function MudKitchenPortalBillingPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(supabase, slug);

  if (!org) {
    notFound();
  }

  return <MudKitchenBillingPlaceholder />;
}
