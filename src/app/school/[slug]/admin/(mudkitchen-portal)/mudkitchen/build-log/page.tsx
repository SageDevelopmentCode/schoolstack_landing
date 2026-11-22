import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MudKitchenBuildLogPage from "@/components/mudkitchen-portal/MudKitchenBuildLogPage";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { fetchOrganizationProgressLog } from "@/lib/organization-progress";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const org = await fetchOrganizationWithSettings(slug);

  if (!org) {
    return { title: "School Not Found" };
  }

  return {
    title: `Build log · MudKitchen · ${org.name}`,
  };
}

export default async function MudKitchenPortalBuildLogPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const org = await fetchOrganizationWithSettings(slug);

  if (!org) {
    notFound();
  }

  const progressEntries = await fetchOrganizationProgressLog(supabase, slug);

  return (
    <MudKitchenBuildLogPage
      entries={progressEntries}
      schoolName={org.name}
    />
  );
}
