import { loadParentHomePreviewContentData } from "@/lib/parent-portal/load-parent-home-content-data";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import ParentHomeContentData from "./ParentHomeContentData";

type ParentHomePreviewContentLoaderProps = {
  organizationId: string;
  familyId: string;
  slug: string;
  features: OrganizationFeatures;
  previewBasePath?: string;
};

export default async function ParentHomePreviewContentLoader({
  organizationId,
  familyId,
  slug,
  features,
  previewBasePath,
}: ParentHomePreviewContentLoaderProps) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const contentData = await loadParentHomePreviewContentData({
    organizationId,
    familyId,
    slug,
    features,
    previewBasePath,
    supabase,
  });

  return <ParentHomeContentData contentData={contentData} />;
}
